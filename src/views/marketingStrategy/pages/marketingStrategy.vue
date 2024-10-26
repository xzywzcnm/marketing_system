<template>
  <div class="page-main plr10 marketingStrategyPage">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="80px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="状态" label-width="50px">
            <dyt-select v-model="searchOptions.strategyStatus">
              <el-option v-for="(item, index) in strategyStatuslist" :key="'s' + index" :label="item.name"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="策略名称">
            <el-input v-model="searchOptions.strategyName" placeholder="请输入" clearable />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>

    <!-- 排序 -->
    <div class="operator-sort">
      <div>
        <el-button v-if="$common.getPower('marketing_strategy_manage_add')" type="primary"
          @click="editPolicy(null, { isEdit: true })">
          新增策略
        </el-button>
      </div>
      <div class="sort-main" />
    </div>

    <!-- 内容展示栏 begin -->
    <div v-loading="pageLoading" class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass"
          :default-sort="{ prop: 'priority', order: 'descending' }">
          <el-table-column label="操作" width="190">
            <template slot-scope="{row}">
              <span v-for="(item, index) in operationList" :key="'o' + index" style="font-size: 14px;">
                <span v-if="$common.getPower(item.permission) || !item.permission"
                  style="font-size: 14px;min-width:22px;display:inline-block;" class="mr10">
                  <span v-if="userInfo.userId === row.createBy || item.ignoreSuperadmin"
                    :title="item.title || item.statusTemp[row.strategyStatus].title" @click="totalFun(item, row)">
                    <template v-if="item.icon">
                      <span class="lapa blueIcon markIcon" :class="'icon-' + item.icon" />
                    </template>
                    <template v-else>
                      <span class="lapa markIcon" :class="'icon-' + item.statusTemp[row.strategyStatus].icon"
                        :style="{ color: item.statusTemp[row.strategyStatus].color }" />
                    </template>
                  </span>
                </span>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="strategyName" label="策略名称" min-width="200" />
          <el-table-column label="策略类型" width="120">
            <template slot-scope="{row}">
              {{ policyType[row.strategyType] && policyType[row.strategyType].name }}
            </template>
          </el-table-column>
          <el-table-column prop="account" label="触发频次" width="120">
            <template slot-scope="{row}">
              {{ triggerFrequencyList[row.triggerFrequency] && triggerFrequencyList[row.triggerFrequency].name }}
            </template>
          </el-table-column>
          <el-table-column prop="rangeNum" label="幅度" width="120">
            <template slot-scope="{row}">
              <span>
                {{ conditionalSymbolText[row.rangeStatus] && conditionalSymbolText[row.rangeStatus].symbol }}
                {{ row.rangeNum || 0 }}
                {{ row.rangeMode == 0 ? '%' : '' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template slot-scope="{row}">
              {{ strategyStatuslist[row.strategyStatus] && strategyStatuslist[row.strategyStatus].name }}
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="100" />
          <el-table-column prop="spuTotal" label="应用SPU数量" width="120" />
          <el-table-column prop="commonStoreNum" label="应用店铺数量" width="120" />
          <el-table-column prop="modificationTimes" label="触发修改次数" width="120" />
          <el-table-column prop="createName" label="创建人" min-width="160" />
          <el-table-column prop="gmtCreate" label="创建时间" width="150" />
        </el-table>
      </div>
      <div class="pageBox">
        <el-pagination :current-page="searchOptions.pageNum" :page-sizes="Globalsize" :page-size="searchOptions.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 详情页 -->
    <policy-editing :detail-visible.sync="detailVisible" :detail-row="detailRow" :is-editdetail="isEditdetail"
      @search="operatReturn" />
    <!-- 日志 -->
    <common-log :model-visible.sync="logInfo.visible" :request-info="logInfo.data" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import FETCH from "@/mixins/fetch";
import commonLog from '@/views/components/commonLog';
import policyEditing from './marketingStrategyCompont/policyEditing';
import { policyType, triggerFrequencyList, strategyStatuslist, conditionalSymbolText } from './components/fileData.js';
export default {
  name: "MarketingStrategyIndex",
  components: { policyEditing, commonLog },
  mixins: [FETCH],
  data() {
    return {
      searchOptions: {
        strategyStatus: 1,
        strategyName: '',
        superAdmin: 0,//是否超级管理员 0：不是 1：是
        pageNum: 1,
        pageSize: 30,
      },
      resetOption: {
        strategyStatus: 1,
        superAdmin: 0,
      },
      tableData: [],
      // ignoreSuperadmin 超级管理员可看;isEdit 是否可编辑;permission 权限
      operationList: [
        { icon: 'yingyong', fun: 'application', title: '应用', permission: 'marketing_strategy_manage_application', ignoreSuperadmin: true },
        { icon: 'yanjing', fun: 'editPolicy', title: '查看', permission: 'marketing_strategy_manage_detail', isEdit: false, ignoreSuperadmin: true },
        { icon: 'caozuorizhi', fun: 'logSee', title: '日志', ignoreSuperadmin: true },
        { icon: 'bianji', fun: 'editPolicy', title: '编辑', permission: 'marketing_strategy_manage_edit', isEdit: true },
        {
          fun: 'strategyStop', permission: 'marketing_strategy_manage_status',
          statusTemp: {
            0: { icon: 'qiyong', title: '启用', color: '#67C23A' },
            1: { icon: 'Icon-jinyong', title: '禁用', color: '#F56C6C' }
          },
        },
      ],//操作栏
      policyType: policyType,//策略类型
      strategyStatuslist: strategyStatuslist,//状态
      triggerFrequencyList: triggerFrequencyList,//触发频次
      conditionalSymbolText: conditionalSymbolText,//条件符号文字
      detailVisible: false,//添加编辑策略弹框
      detailRow: {},//详情数据
      isEditdetail: false,//详情是否可编辑
      logInfo: {
        visible: false,//日志弹框
        data: {},//日志信息
      },
    }
  },
  computed: { ...mapGetters(["userInfo"]) },
  created() {
    // 是否超级管理员
    const superAdmin = this.$common.getPower('marketing_strategy_manage_superAdmin');
    this.resetOption.superAdmin = this.searchOptions.superAdmin = superAdmin ? 1 : 0;
    // this.init();
    this.fetch(this.api.marketingStrategy.queryByParm, "post");
  },
  methods: {
    init() {
      this.apiType = "post";
      this.mapi = this.api.marketingStrategy.queryByParm;
    },
    // 新增/编辑/详情策略
    editPolicy(row, item) {
      this.isEditdetail = item && item.isEdit;
      this.detailVisible = true;
      setTimeout(() => {
        this.detailRow = this.$common.copy(row || {});
      }, 100);
    },
    // 方法中间跳转
    totalFun(item, row) {
      item.fun && this[item.fun](row, item);
    },
    // 应用
    application(row) {
      let routerData = this.$router.resolve({
        path: '/strategy-application',
        query: {
          strategyId: row.strategyId,
          userId: row.createBy,
        }
      })
      window.open(routerData.href, '_blank');
    },
    // 禁用/启用
    strategyStop(row) {
      let str = row.strategyStatus == 1 ? '禁用' : '启用';
      this.$confirm(`确认要${str}该策略？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let temp = {};
        temp.strategyId = row.strategyId;
        temp.strategyStatus = row.strategyStatus == 1 ? 0 : 1;
        this.loading = true;
        this.$http.post(this.api.marketingStrategy.updateStrategyStatus, temp).then((res) => {
          this.$message.success('操作成功~');
          this.fetch();
        }).finally(() => {
          this.loading = false;
        })
      }).catch(() => { });
    },
    // 查看日志
    logSee(row) {
      let [temp] = [{}];
      temp.axiosApi = this.api.marketingStrategy.getStatrategyLog;
      temp.axiosType = 'post';
      temp.axiosOptions = { strategyId: row.strategyId };
      this.logInfo.data = this.$common.copy(temp);
      this.logInfo.visible = true;
    },
    operatReturn(data) {
      // 保存刷新列表返回第一页，否则保持原页刷新
      if (data === 'saveCommonStrategy') {
        this.search();
      } else {
        this.fetch();
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.marketingStrategyPage {
  .markIcon {
    font-size: 22px;
    line-height: 22px;
    cursor: pointer;
  }
}
</style>
