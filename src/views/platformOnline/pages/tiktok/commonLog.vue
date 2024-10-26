<template>
  <common-log ref="commonLog" :model-visible.sync="dialogVisible" :request-info="logData" width="1200px">
    <div slot="title">
      <span>操作日志</span>
      <span class="ml15">SPU ID: {{ spuId }}</span>
    </div>
    <div slot="logSearch" class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="85px" class="form-search">
        <dyt-filter :filter-row="1" :is-show-more-btn="false" @operation="filterBtn">
          <el-form-item label="关键词搜索">
            <el-input v-model="searchOptions.content" placeholder="请输入关键词" clearable />
          </el-form-item>
          <!-- <el-form-item label="类型">
            <dyt-select v-model="searchOptions.type" placeholder="请选择类型">
              <el-option v-for="(item, index) in typeData" :key="`type-${index}`" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item> -->
          <el-form-item label="执行时间">
            <dyt-timePicker
              v-model="searchOptions.executionTime"
              type="datetimerange"
              clearable
              value-format="yyyy-MM-dd HH:mm:ss"
              :is-show-all="true"
            />
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
        return {
          detailsInfo: {},
          axiosOptions: {}
        }
      }
    },
  },
  data() {
    return {
      dialogVisible: false,
      searchOptions: {
        content: '',
        executionTime: [],
        startTime: '',
        endTime: '',
        // type: null,
      },
      // 0: 修改防超卖, 1: 修改自动补货, 2: 修改忽略初始化, 3: 修改库存
      typeData: {
        0: {label: '修改防超卖', value: 0},
        1: {label: '修改自动补货', value: 1},
        2: {label: '修改忽略初始化', value: 2},
        3: {label: '修改库存', value: 3},
      }
    }
  },
  computed: {
    spuId () {
      if (this.$common.isEmpty(this.requestInfo) || this.$common.isEmpty(this.requestInfo.detailsInfo)) return '';
      return this.requestInfo.detailsInfo.spuId;
    },
    logData() {
      let temp = {};
      temp.axiosApi = this.requestInfo.axiosApi || '';
      temp.axiosType = this.requestInfo.axiosType || 'get';
      temp.paramsArr = this.requestInfo.paramsArr || [];
      temp.axiosOptions = this.$common.copy(this.searchOptions);
      if (!this.$common.isEmpty(this.requestInfo.axiosOptions)) {
        temp.axiosOptions = {...this.requestInfo.axiosOptions, ...temp.axiosOptions};
      }
      if (!this.$common.isEmpty(temp.axiosOptions.executionTime)) {
        temp.axiosOptions.startTime = temp.axiosOptions.executionTime[0];
        temp.axiosOptions.endTime = temp.axiosOptions.executionTime[1];
      }
      delete temp.axiosOptions.executionTime;
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
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.requestInfo.axiosApi)) {
          console.error('请求地址为空，可能会出现请求错误，请设置 requestInfo.axiosApi');
        }
        if (this.$common.isEmpty(this.requestInfo.axiosType)) {
          console.warn('请求类型为空时将使用 get 方式请求，可能会出现请求错误，请设置 requestInfo.axiosType');
        }
        this.dialogVisible = true;
        this.filterBtn('refresh');
      })
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
        },
      };
      type && fun[type] && fun[type]();
    }
  },
}
</script>