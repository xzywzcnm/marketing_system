<template>
  <div class="ImportPage page-main plr10">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="80px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="状态">
            <dyt-select v-model="searchOptions.statusList" :multiple="true">
              <el-option v-for="(item, index) in statuslist" :key="'statuslist' + index" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="导入时间">
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
          <el-table-column label="导入类型" width="200">
            <template slot-scope="{ row }">
              {{ importType[row.type] && importType[row.type].label }}
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="文件名" min-width="200" />
          <el-table-column label="导入时间" width="200">
            <template slot-scope="{ row }">
              <div>{{ row.gmtCreate || "-" }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="140">
            <template slot-scope="{ row }">
              <span v-if="statuslist[row.status]" :style="{ color: statuslist[row.status].color }">
                {{ statuslist[row.status].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template slot-scope="{ row }">
              <span v-if="row.status == 2" @click="downLoad(row)" class="highCursor">
                下载查看失败原因
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
import { importType } from "@/layout/components/fileData";
export default {
  name: "import",
  data() {
    return {
      searchOptions: {
        statusList: [],
        startTime: "",
        endTime: "",
        pageNum: 1,
        pageSize: 30,
      },
      arraySearch: {
        exportTime: [],
      },
      statuslist: {
        0: { label: "导入中", value: 0 },
        1: { label: "导入成功", value: 1 },
        2: { label: "导入失败", value: 2, color: "#F56C6C" },
      },
      isExpand: false,
      loading: false,
      tableData: [],
      searchStatus: false, //是否请求过
      total: 0,
      importType: importType,
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
      let mapi = this.api.import.list + reqParams.params;
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
      let arr = ["startTime", "endTime"];
      if (Array.isArray(e)) {
        this.searchOptions[arr[0]] = e[0];
        this.searchOptions[arr[1]] = e[1];
      } else {
        this.searchOptions[arr[0]] = this.searchOptions[arr[1]] = "";
      }
    },
    // 下载文件
    downLoad(row) {
      if (!row.filePath) {
        this.$message.error("文件路径不存在，请检查!");
        return;
      }
      window.open(row.filePath, "_blank");
    },
  },
};
</script>
<style lang="scss">
.ImportPage {
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
