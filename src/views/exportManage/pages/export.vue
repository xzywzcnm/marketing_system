<template>
  <div class="exportManageExportPage page-main plr10">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="80px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="状态">
            <dyt-select v-model="searchOptions.status">
              <el-option v-for="(item, index) in statuslist" :key="'statuslist' + index" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="导出时间">
            <dyt-timePicker v-model="arraySearch.exportTime" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss"
              class="exportTimeRanger" @change="timeChange" />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>

    <!-- 提示条 -->
    <el-alert :title="'共有 ' + total + ' 条查询结果'" type="warning" :closable="false" class="exportManageAlert" />

    <!-- 内容展示栏 begin -->
    <div class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass">
          <el-table-column label="导出类型" width="160">
            <template slot-scope="{ row }">
              {{ exportType[row.type] && exportType[row.type].label }}
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="文件名" min-width="200" />
          <el-table-column prop="createName" label="导出人" min-width="140" />
          <el-table-column label="导出时间" width="150">
            <template slot-scope="{ row }">
              <!-- <div class="timeWidth"> -->
              <div>{{ row.gmtCreate || "-" }}</div>
              <!-- </div> -->
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template slot-scope="{ row }">
              <span v-if="statuslist[row.status]" :style="{ color: statuslist[row.status].color }">
                {{ statuslist[row.status].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="{ row }">
              <span v-if="row.status == 1" @click="downLoad(row)" class="highCursor">
                下载
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pageBox">
        <el-pagination :current-page="searchOptions.pageNum" :page-sizes="Globalsize" :page-size="searchOptions.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import { exportType } from "@/layout/components/fileData";
export default {
  name: "ExportManageExport",
  data() {
    return {
      searchOptions: {
        status: "",
        minGmtCreate: "",
        maxGmtCreate: "",
        pageNum: 1,
        pageSize: 30,
      },
      arraySearch: {
        exportTime: [],
      },
      statuslist: {
        0: { label: "导出中", value: 0 },
        1: { label: "导出成功", value: 1 },
        2: { label: "导出失败", value: 2, color: "#F56C6C" },
      },
      isExpand: false,
      loading: false,
      tableData: [],
      searchStatus: false, //是否请求过
      total: 0,
      exportType: exportType,
    };
  },
  computed: {
    searchClass() {
      if (this.loading) return "";
      if (this.searchStatus) {
        return !this.tableData.length && "nolength";
      } else {
        return "nosearch";
      }
    },
  },
  methods: {
    // 展开或收起
    expand(val) {
      this.isExpand = val.isExpand;
    },
    // 搜索栏按钮处理
    filterBtn(type) {
      let _self = this;
      this.filterType = type;
      let fun = {
        // 查询
        submit() {
          _self.search();
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions);
          _self.arraySearch = FetchFun.reset(_self.arraySearch);
        },
      };
      type && fun[type] && fun[type]();
    },
    // 页码切换事件
    handleSizeChange(val) {
      this.searchOptions.pageNum = 1;
      this.searchOptions.pageSize = val;
      this.getList();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      this.searchOptions.pageNum = val;
      this.getList();
    },
    search() {
      this.searchOptions.pageNum = 1;
      this.getList();
    },
    getList() {
      let searchOptions = Object.assign({}, this.searchOptions);
      let reqParams = FetchFun.returnSearchOptions(searchOptions, "post");
      let mapi = this.api.export.reconReportList + reqParams.params;
      this.loading = true;
      this.$http
        .post(mapi, reqParams.data)
        .then(({ data }) => {
          this.tableData = data.list || [];
          this.total = data.total || 0;
        })
        .finally(() => {
          this.searchStatus = true;
          this.loading = false;
        });
    },
    timeChange(e) {
      let arr = ["minGmtCreate", "maxGmtCreate"];
      if (Array.isArray(e)) {
        this.searchOptions[arr[0]] = e[0];
        this.searchOptions[arr[1]] = e[1];
      } else {
        this.searchOptions[arr[0]] = this.searchOptions[arr[1]] = "";
      }
    },
    // 下载文件
    downLoad(row) {
      this.loading = true;
      this.$http({
        type: "get",
        url: this.api.export.downLoadExcel,
        params: { id: row.id },
        // responseType: "blob",
        timeout: 600000,
      })
        .then((res) => {
          if (res.status !== 200) return;
          // let { resData, filename } = res.data || {};
          // this.$common.downFile(resData, filename);
          if (!res.data) {
            this.$message.error("文件路径缺失，请联系管理员~");
            return;
          }
          this.$common.downLink(res.data);
          this.$message.success("导出成功");
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="scss">
.exportManageExportPage {
  .exportManageAlert {
    .el-alert__content {
      padding: 0;
    }
  }

  .el-table .el-table__body .cell {
    padding: 10px;
  }

  .form-search .exportTimeRanger .el-date-editor {
    width: 300px !important;
  }
}
</style>
