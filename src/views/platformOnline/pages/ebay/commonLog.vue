<template>
  <common-log ref="commonLog" :model-visible.sync="dialogVisible" :request-info="logData">
    <div slot="title">
      <span>操作日志</span>
      <span class="ml15">Itemid: {{ requestInfo.itemId }}</span>
    </div>
    <div slot="logSearch" class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="70px" class="form-search">
        <dyt-filter :filter-row="1" :is-show-more-btn="false" @operation="filterBtn">
          <el-form-item label="关键词搜索" label-width="85px">
            <el-input v-model="searchOptions.content" placeholder="请输入关键词" clearable />
          </el-form-item>
          <el-form-item label="执行时间">
            <dyt-timePicker v-model="arraySearch.executionTime" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss"
              :is-show-all="true" @change="executionTimeChange" />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
  </common-log>
</template>
<script>
import FetchFun from "@/utils/listPage";
import commonLog from "@/views/components/commonLog";
export default {
  name: "EbayCommonLog",
  components: { commonLog },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    requestInfo: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      dialogVisible: false,
      searchOptions: {
        content: '',
        startTime: '',
        endTime: '',
      },
      arraySearch: {
        executionTime: [],
      },
    }
  },
  computed: {
    logData() {
      let temp = {};
      temp.axiosApi = this.api.ebay.getLinkLog;
      temp.axiosType = 'post';
      temp.paramsArr = ['pageNum', 'pageSize', 'linkId'];
      temp.axiosOptions = this.$common.copy(Object.assign({ linkId: this.requestInfo.linkId }, this.searchOptions));
      return temp;
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
      this.filterBtn('refresh');
    },
    // 搜索栏按钮处理
    filterBtn(type) {
      let _self = this;
      this.filterType = type;
      let fun = {
        // 查询
        submit() {
          _self.$refs["commonLog"].search();
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions);
          _self.arraySearch = FetchFun.reset(_self.arraySearch);
        },
      };
      type && fun[type] && fun[type]();
    },
    executionTimeChange(e) {
      let list = e || [];
      this.searchOptions.startTime = list[0];
      this.searchOptions.endTime = list[1];
    },
  },
}
</script>