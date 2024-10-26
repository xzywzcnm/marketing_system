<template>
  <div class="dialog-content">
    <el-dialog title="操作日志" :visible.sync="dialogVisible" :width="width" :close-on-click-modal="false"
      class="commonLogPage">
      <!-- 头部插槽 -->
      <div slot="title" class="dyt-dialogTitle">
        <slot v-if="'title' in $slots" name="title" />
        <span v-else>操作日志</span>
      </div>
      <!-- 查询插槽 -->
      <slot name="logSearch" />
      <!-- 表格 -->
      <div class="mainContent" style="height:600px;">
        <div class="tableWrap table-maxheight">
          <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass">
            <el-table-column prop="operate_content" label="日志内容">
              <template slot-scope="{row}">
                <span>{{ row.content || '' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="gmtCreate" label="执行时间" width="160px" />
            <el-table-column prop="createBy" label="操作人" width="180px" />
          </el-table>
        </div>
        <div class="pageBox">
          <el-pagination layout="total, sizes, prev, pager, next, jumper" :current-page="searchPages.pageNum"
            :page-sizes="Globalsize" :page-size="searchPages.pageSize" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
export default {
  name: "ComponentsCommonLog",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '1000px'
    },
    requestInfo: {
      type: Object,
      default() {
        return {
          axiosApi: '', // 请求路径
          axiosType: '', // 请求类型
          paramsArr: [], // 除了'pageNum', 'pageSize', 'sortField', 'sortType' 外，需要追加到请求连接的入参字段
          axiosOptions: {}, // 请求参数，这里不追加到请求连接，放到 body 进行传参
        }
      }
    },
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      tableData: [],
      searchPages: {
        pageNum: 1,
        pageSize: 50,
      },
      total: 0,
      searchStatus: false,
    }
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
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit('update:modelVisible', val);
    },
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.getList();
    },
    search() {
      this.searchPages.pageNum = 1;
      this.getList();
    },
    // 获取日志列表
    getList() {
      let { axiosApi, axiosType, paramsArr, axiosOptions } = this.requestInfo;
      let [data, mapi] = [{}, axiosApi];
      let reqParams = {};
      if (Array.isArray(axiosOptions)) {
        let searchOptions = Object.assign(this.searchPages);
        reqParams = FetchFun.returnSearchOptions(searchOptions, axiosType, paramsArr);
        reqParams.data = axiosOptions;
      } else {
        let searchOptions = Object.assign(this.searchPages, axiosOptions);
        reqParams = FetchFun.returnSearchOptions(searchOptions, axiosType, paramsArr);
      }
      if (axiosType == 'post') {
        mapi += reqParams.params;
        data = reqParams.data;
      } else {
        data = { params: reqParams };
      }
      // console.log(data, axiosType, reqParams)
      this.loading = true;
      this.$http[axiosType](mapi, data).then(({ data }) => {
        this.tableData = data.list || [];
        this.total = data.total;
      }).finally(() => {
        this.searchStatus = true;
        this.loading = false;
      })
    },
    handleSizeChange(val) {
      this.searchPages.pageSize = val;
      this.search();
    },
    handleCurrentChange(val) {
      this.searchPages.pageNum = val
      this.getList();
    }
  }
}
</script>
<style lang="scss">
.commonLogPage {
  .dyt-dialogTitle {
    color: #303133;
    font-size: 16px;
    line-height: 22px;
    display: inline-block;
  }
}
</style>