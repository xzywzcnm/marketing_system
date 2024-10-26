<template>
  <div class="page-main plr10">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="110px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="是否已处理数据">
            <dyt-select v-model="searchOptions.isProcessed">
              <el-option v-for="(item, index) in handleData" :key="'isProcessed' + index" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺" label-width="50px">
            <!-- + '[' + item.account + ']' -->
            <dyt-select v-model="arraySearch.commonStoreIds" multiple @change="commonStoreIdChange">
              <el-option v-for="item in shopList" :key="item.accountCode" :label="item.accountCode"
                :value="item.commonStoreId" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="账单文件时间" label-width="100px">
            <dyt-timePicker v-model="arraySearch.settleTime" @change="timeChange" />
          </el-form-item>
          <el-form-item label="账单文件名称" label-width="100px">
            <el-input v-model="searchOptions.fileName" placeholder="请输入" clearable />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>

    <!-- 排序 -->
    <div class="operator-sort">
      <div>
        <!-- <el-button type="primary" v-if="$common.getPower('marketing_strategy_manage_add')">下载选中文件</el-button> -->
        <div class="tips">
          每天凌晨03:00，自动查询店铺最新的账单，自动下载账单文件，自动把账单文件数据加入数据库中；
        </div>
      </div>
      <div class="sort-main" />
    </div>

    <!-- 内容展示栏 begin -->
    <div v-loading="pageLoading" class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass">
          <!-- <el-table-column type="selection" width="55"></el-table-column> -->
          <el-table-column prop="accountCode" label="店铺" width="200" />
          <el-table-column label="站点" width="100">
            <template slot-scope="{}">
              美国
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="账单文件" min-width="120" />
          <el-table-column prop="settleDate" label="账单文件时间" width="140" />
          <el-table-column prop="gmtCreate" label="账单文件获取时间" width="140" />
          <el-table-column label="是否已处理数据" width="120">
            <template slot-scope="{row}">
              <span v-for="(item, i) in handleData" :key="i + 'handleData'">
                <span v-if="row.isProcessed === item.value" :style="item.style">{{ item.label }}</span>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="{row}">
              <el-button v-if="row.isProcessed == 1" type="text" @click="downLoad(row)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pageBox">
        <el-pagination :current-page="searchOptions.pageNum" :page-sizes="Globalsize"
          :page-size="searchOptions.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script>
import FETCH from "@/mixins/fetch";
export default {
  name: "FinancialAccountAccountWalmart",
  mixins: [FETCH],
  data() {
    return {
      searchOptions: {
        isProcessed: '',
        startSettleDate: '', //账单开始时间
        endSettleDate: '', //账单结束时间
        fileName: '', //账单文件名称
        pageNum: 1,
        pageSize: 30,
      },
      resetOption: {
        startSettleDate: '', //账单开始时间
        endSettleDate: '', //账单结束时间
      },
      arraySearch: {
        settleTime: [],
        commonStoreIds: [],
      },
      resetArray: {
        settleTime: [],
      },
      tableData: [],
      handleData: { // 是否已处理数据
        1: { label: '是', value: 1, style: 'color:#67c23a;' },
        0: { label: '否', value: 0, style: 'color:#f56c6c;' },
      },
      shopList: [],//店铺列表
    }
  },
  created() {
    this.setTime();
    this.getotherList();
    this.fetch(this.api.financialAccount.reconReportList, "get");
  },
  methods: {
    // 设置默认时间
    setTime() {
      let daysInMonth = this.$common.dayjs().daysInMonth();//获取天数
      let subtractDate = this.$common.dayjs().subtract(daysInMonth, 'd').format('YYYY-MM-DD');//前天数日期
      let nowDate = this.$common.dayjs().format('YYYY-MM-DD');//当前日期
      let time = [subtractDate, nowDate];
      this.resetArray.settleTime = this.arraySearch.settleTime = time;
      [this.resetOption['startSettleDate'], this.resetOption['endSettleDate']] = time;
      this.timeChange(time);
    },
    // 获取店铺列表
    getotherList() {
      this.$store.dispatch('platformList/getstoreList', { platformCode: 'walmart' }).then(list => {
        this.shopList = (list || []);
      })
    },
    // 时间切换
    timeChange(e) {
      let arr = Array.isArray(e) ? e : ['', ''];
      [this.searchOptions['startSettleDate'], this.searchOptions['endSettleDate']] = arr;
    },
    // 店铺变化
    commonStoreIdChange(e) {
      this.searchOptions.commonStoreIds = e.toString();
    },
    // 下载文件
    downLoad(row) {
      let { fileDownloadUrl } = row || {};
      if (!fileDownloadUrl) {
        this.$message.error('文件路径不存在~');
        return;
      }
      // window.open(fileDownloadUrl);
      const link = document.createElement("a");
      document.body.appendChild(link);
      link.href = fileDownloadUrl;
      link.click();
      setTimeout(function () {
        document.body.removeChild(link);
      }, 50);
    }
  },
}
</script>

<style lang="scss" scoped>
.tips {
  display: inline-block;
  font-size: 12px;
  padding: 6px 8px;
  background-color: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 3px;
  line-height: 14px;
}
</style>
