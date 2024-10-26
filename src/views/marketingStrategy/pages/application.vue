<template>
  <div class="page-main application plr10">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="80px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="SPU" label-width="60">
            <dyt-textarea v-model="searchOptions.erpSpuList" placeholder="请输入SPU" />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>

    <!-- 排序 -->
    <div class="operator-sort">
      <div>
        <span v-for="item in operationList" :key="'operationList' + item.permission">
          <template v-if="$common.getPower(item.permission)">
            <el-button v-if="ownStrategy || (superAdmin && !item.hideSuperadmin)" class="mr10" @click="totalFun(item)">
              {{ item.label }}</el-button>
          </template>
        </span>
      </div>
      <div class="sort-main" />
    </div>

    <!-- 内容展示栏 begin -->
    <div v-loading="pageLoading" class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass"
          @selection-change="handleSelectionChange">
          <el-table-column v-if="ownStrategy" type="selection" width="55" />
          <!-- 暂时屏蔽，日志暂时没决定好怎么做 -->
          <!-- <el-table-column label="日志" width="60">
            <template slot-scope="{row}">
              <span class="el-icon-document-copy" style="font-weight:bold;font-size:16px;"></span>
            </template>
          </el-table-column> -->
          <el-table-column prop="erpSpu" label="SPU" />
          <el-table-column prop="bindTime" label="绑定时间" />
          <!-- <el-table-column prop="lastRunTime" label="上次执行时间" />
          <el-table-column prop="runTimes" label="成功执行次数" />
          <el-table-column prop="modifyTimes" label="触发修改次数" /> -->
        </el-table>
      </div>
      <div class="pageBox">
        <span class="tips">提示：<span>所有策略都将于次日凌晨2点执行,周策略于每周一凌晨2点执行。策略会根据绑定的SPU，店铺进行执行，请务必设定好相关信息。</span></span>
        <el-pagination :current-page="searchOptions.pageNum" :page-sizes="Globalsize"
          :page-size="searchOptions.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 绑定spu -->
    <bind-spu :model-visible.sync="spuVisible" :strategy-id="strategyId" @search="search" />
    <!-- 绑定店铺 -->
    <bind-store :model-visible.sync="storeVisible" :strategy-id="strategyId" :is-edit="ownStrategy" />
    <!-- 白名单 -->
    <white-list :model-visible.sync="whiteVisible" :strategy-id="strategyId" :is-edit="ownStrategy" />
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import FETCH from "@/mixins/fetch";
import bindStore from "./applicationComponents/bindStore";
import whiteList from "./applicationComponents/whiteList";
import bindSpu from "./applicationComponents/bindSpu";
export default {
  name: "MarketingStrategyApplication",
  components: { bindStore, whiteList, bindSpu },
  mixins: [FETCH],
  data() {
    return {
      strategyId: '',//策略id
      searchOptions: {
        erpSpuList: [],
        strategyId: '',
        pageNum: 1,
        pageSize: 30,
      },
      resetOption: {
        strategyId: '',
      },
      storeVisible: false,
      whiteVisible: false,
      spuVisible: false,
      isneedValidateForm: false,
      //操作栏 hideSuperadmin: 不是本人策略，不能看
      operationList: [
        { label: '绑定SPU', fun: 'bindSpuFun', permission: 'marketing_strategy_application_bindSpu', hideSuperadmin: true },
        { label: '解绑SPU', fun: 'unbindSPUFun', permission: 'marketing_strategy_application_unbindSpu', hideSuperadmin: true },
        { label: '绑定店铺', fun: 'bindStoreFun', permission: 'marketing_strategy_application_bindStore' },
        { label: 'Item白名单', fun: 'bindWhiteFun', permission: 'marketing_strategy_application_itemWhiteList' },
      ],
      superAdmin: false,// 是否超级管理员
      ownStrategy: false,// 是否本人策略
    }
  },
  computed: { ...mapGetters(["userInfo"]) },
  created() {
    let { strategyId, userId } = this.$route.query || {};
    if (!(strategyId && userId)) return;
    this.superAdmin = this.$common.getPower('marketing_strategy_manage_superAdmin');
    this.ownStrategy = Number(userId) === this.userInfo.userId;
    if (!(this.superAdmin || this.ownStrategy)) return;
    this.resetOption.strategyId = this.searchOptions.strategyId = this.strategyId = strategyId;
    this.init();
  },
  methods: {
    init() {
      this.fetch(this.api.marketingStrategy.productRelationqueryByParm, 'post');
    },
    totalFun(item) {
      if (!item) return;
      this[item.fun]();
    },
    // 绑定店铺
    bindStoreFun() {
      this.storeVisible = true;
    },
    // itemid绑定白名单
    bindWhiteFun() {
      this.whiteVisible = true;
    },
    // 绑定SPU
    bindSpuFun() {
      this.spuVisible = true;
    },
    // 解绑SPU
    unbindSPUFun() {
      let list = this.multipleSelection || [];
      if (!list.length) {
        this.$message.error('请选择要解绑的SPU');
        return;
      }
      this.$confirm('确认要解绑选中的SPU?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        let temp = list.map(k => { return k.id });
        this.$http.post(this.api.marketingStrategy.removeSpu, temp).then((res) => {
          this.$message.success('操作成功~');
          this.search()
        })
      }).catch(() => { });
    }
  },
}
</script>
<style lang="scss" scoped>
.application {
  .pageBox {
    position: relative;

    .tips {
      font-size: 12px;
      position: absolute;
      left: 0;
      bottom: 6px;

      >span {
        color: #de2910;
      }
    }
  }
}
</style>