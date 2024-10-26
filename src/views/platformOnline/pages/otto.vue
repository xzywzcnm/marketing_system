<template>
  <div class="page-main plr10 tabPage">
    <div class="search-content">
      <el-form ref="ottoForm" :inline="true" :rules="rules" :model="searchOptions" label-width="126px"
        class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="店铺">
            <dyt-select v-model="searchOptions.commonStoreIdList" :multiple="true" @change="storeChange">
              <el-option v-for="(item, index) in shopList" :key="index + 'store'" :label="item.accountCode"
                :value="item.commonStoreId" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="品牌">
            <dyt-select v-model="searchOptions.brandIdList" :multiple="true">
              <el-option v-for="(item, index) in brandList" :key="index + 'brand'" :label="item.name"
                :value="item.platformId" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea v-model="searchOptions.spuList" placeholder="请输入SPU/平台SPU，支持模糊查询" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-textarea v-model="searchOptions.skuList" placeholder="请输入SKU/平台SKU，支持模糊查询" />
          </el-form-item>
          <el-form-item label="状态">
            <dyt-select v-model="searchOptions.status">
              <el-option v-for="(item, index) in saleList" :key="index + 'status'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="商品状态">
            <dyt-select v-model="searchOptions.productStatusList" multiple>
              <el-option v-for="(item, index) in goodsStatusArr" :key="index + 'products'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="更新时间">
            <dyt-timePicker v-model="arraySearch.finishTime" @change="beginTimeChange" />
          </el-form-item>
          <el-form-item label="自动补货">
            <dyt-select v-model="searchOptions.autoReplenishment">
              <el-option v-for="(item, index) in commonList" :key="index + 'autoReplenishment'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <!-- <el-form-item label="处理时间">
            <div class="flex-align no-form-item formb0 differ">
              <el-form-item label-width="0" prop="deliveryTimeStart">
                <el-input
                  v-model="searchOptions.deliveryTimeStart"
                  placeholder="最小处理时间"
                  type="number"
                />
              </el-form-item>
              <span class="flexSpan">-</span>
              <el-form-item label-width="0" prop="deliveryTimeEnd">
                <el-input
                  v-model="searchOptions.deliveryTimeEnd"
                  placeholder="最大处理时间"
                  type="number"
                />
              </el-form-item>
            </div>
          </el-form-item> -->
          <el-form-item label="运输组">
            <dyt-select v-model="searchOptions.shippingProfileIdList" :multiple="true" placeholder="选择单个店铺可筛选">
              <el-option v-for="(item, index) in transportGroupList" :key="index + 'brand'"
                :label="item.platformShippingProfileName" :value="item.id" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="仓库">
            <dyt-select v-model="searchOptions.warehouseIdList" multiple>
              <el-option v-for="(item, index) in allWarehouseList" :key="index" :label="item.warehouseName"
                :value="item.id" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="库存">
            <div class="flex-align no-form-item formb0 differ">
              <el-form-item label-width="0" prop="minInventoryQuantity">
                <el-input v-model="searchOptions.minInventoryQuantity" placeholder="最小库存" type="number" />
              </el-form-item>
              <span class="flexSpan">-</span>
              <el-form-item label-width="0" prop="maxInventoryQuantity">
                <el-input v-model="searchOptions.maxInventoryQuantity" placeholder="最大库存" type="number" />
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item label="标签">
            <dyt-select v-model="searchOptions.labelIdList" multiple>
              <el-option v-for="(item, index) in labelList" :key="index + 'labelIdList'" :label="item.name"
                :value="item.id" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="匹配类型">
            <dyt-select v-model="searchOptions.matchType">
              <el-option v-for="(item, index) in mateList" :key="index + 'matchType'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="库存助手">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option v-for="(item, index) in replenishList" :key="index + 'syncInventoryStatus'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <!-- <el-form-item label="自动修改处理时间">
            <dyt-select v-model="searchOptions.syncDeliveryTimeStatus">
              <el-option v-for="(item, index) in deliveryTList" :key="index + 'syncDeliveryTimeStatus'"
                :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item> -->
          <el-form-item label="自动修改运输组">
            <dyt-select v-model="searchOptions.syncShippingProfileStatus">
              <el-option v-for="(item, index) in deliveryTList" :key="index + 'syncShippingProfileStatus'"
                :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 选项卡 -->
    <div class="table-main-view">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="主链接视图" name="1">
          <otto-main ref="ottoMain" :search-options="searchOptions" :tab="activeName" @refreshAll="filterBtn" />
        </el-tab-pane>
        <el-tab-pane label="子链接视图" name="2">
          <otto-child ref="ottoChild" :search-options="searchOptions" :tab="activeName" :label-list="labelList"
            @refreshAll="filterBtn" />
        </el-tab-pane>
      </el-tabs>
      <div class="tabs-right">
        <div v-if="power.abnormalView" class="right-item text-underline" @click="openAbnormalData">
          执行异常数据
        </div>
      </div>
    </div>
    <abnormalData :shop-list="shopList" :visible-dialog.sync="visibleAbnormalData" />
  </div>
</template>

<script>
import regular from "@/utils/regular";
import FetchFun from "@/utils/listPage";
import {
  saleList,
  mateList,
  replenishList,
  deliveryTList,
} from "./otto/fileData.js";
import ottoMain from "./otto/ottoMain";
import ottoChild from "./otto/ottoChild";
import abnormalData from "./otto/abnormalData";

import { getSalesStatus } from "@/utils/staticDataOrigin";
export default {
  name: "PlatformOnlineOtto",
  components: { ottoMain, ottoChild, abnormalData },
  data() {
    return {
      visibleAbnormalData: false, // 是否可见 执行异常数据
      searchOptions: {
        commonStoreIdList: [],
        brandIdList: [],
        spuList: [], //spu
        skuList: [], //sku
        status: 1,
        productStatusList: [],
        startGmtUpdated: "",
        endGmtUpdated: "",
        autoReplenishment: "",
        // deliveryTimeStart: "",
        // deliveryTimeEnd: "",
        minInventoryQuantity: "",
        maxInventoryQuantity: "",
        labelIdList: [],
        matchType: "",
        syncInventoryStatus: "",
        // syncDeliveryTimeStatus: "",
        syncShippingProfileStatus: "",
        warehouseIdList: [],
        shippingProfileIdList: [],
      },
      arraySearch: {
        finishTime: [],
      },
      saleList: saleList,
      mateList: mateList,
      replenishList: replenishList,
      deliveryTList: deliveryTList,
      shopList: [],
      brandList: [],
      goodsStatusArr: getSalesStatus(["1", "2", "3", "4", "5", "6"]), //ERP商品状态
      activeName: "1", //视图
      isExpand: false,
      platformCode: "otto", //平台
      commonList: {
        0: { label: "禁用", value: 0 },
        1: { label: "启用", value: 1 },
      },
      rules: {
        // deliveryTimeStart: [
        //   { validator: this.validateMinScore, trigger: "blur" },
        // ],
        // deliveryTimeEnd: [
        //   { validator: this.validateMaxScore, trigger: "blur" },
        // ],
        minInventoryQuantity: [
          { validator: this.validateMinInventory, trigger: "blur" },
        ],
        maxInventoryQuantity: [
          { validator: this.validateMaxInventory, trigger: "blur" },
        ],
      },
      labelList: [],
      allWarehouseList: [],
      transportGroupList: [],
    };
  },
  computed: {
    power() {
      // 权限
      return this.$common.getPower({
        abnormalView: "productOnline_otto_abnormalDataView",
      });
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      let platformCode = this.platformCode;
      // 获取店铺列表
      this.$store
        .dispatch("platformList/getstoreList", { platformCode })
        .then((list) => {
          this.shopList = list || [];
        });
      // 获取品牌列表
      this.$http.get(this.api.otto.inUseList).then(({ data }) => {
        this.brandList = data || [];
      });
      this.getLabelList();
      this.getWarehouseList();
    },
    // 选项切换
    handleClick() { },
    // 展开或收起
    expand(val) {
      this.isExpand = val.isExpand;
    },
    // 搜索栏按钮处理
    filterBtn(type) {
      let _self = this;
      let fun = {
        // 查询
        submit() {
          _self.$refs["ottoForm"].validate((valid) => {
            if (!valid) return;
            if (FetchFun.validateForm(_self.searchOptions)) return false;
            _self.$refs["ottoMain"].search();
            _self.$refs["ottoChild"].search();
          });
        },
        // 保持分页查询
        keepPageSearch() {
          _self.$refs["ottoMain"].getList();
          _self.$refs["ottoChild"].getList();
          _self.getLabelList();
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions, {
            status: 1,
          });
          _self.arraySearch = FetchFun.reset(_self.arraySearch);
        },
      };
      type && fun[type] && fun[type]();
    },
    // 更新时间
    beginTimeChange(e) {
      this.timeChange(e, "startGmtUpdated", "endGmtUpdated");
    },
    // 时间切换
    timeChange(e, start, end) {
      if (Array.isArray(e)) {
        [this.searchOptions[start], this.searchOptions[end]] = e;
        this.searchOptions[start] += " 00:00:00";
        this.searchOptions[end] += " 23:59:59";
      } else {
        this.searchOptions[start] = this.searchOptions[end] = "";
      }
    },
    // // 验证处理时间
    // validateMinScore(rule, value, callback) {
    //   let { deliveryTimeStart, deliveryTimeEnd } = this.searchOptions;
    //   let existMinScore = !!(deliveryTimeStart || deliveryTimeStart === 0); //是否存在小值
    //   if (existMinScore) {
    //     let existMaxScore = !!(deliveryTimeEnd || deliveryTimeEnd === 0); //是否存在最大值
    //     if (!regular.checkIsPositiveIntegerEx0.test(deliveryTimeStart))
    //       return callback(new Error("请输入正整数"));
    //     if (existMaxScore && deliveryTimeStart - deliveryTimeEnd > 0)
    //       return callback(new Error("最小值应低于最大值"));
    //   }
    //   callback();
    // },
    // validateMaxScore(rule, value, callback) {
    //   let { deliveryTimeStart, deliveryTimeEnd } = this.searchOptions;
    //   let existMaxScore = !!(deliveryTimeEnd || deliveryTimeEnd === 0); //是否存在最大值
    //   if (existMaxScore) {
    //     let existMinScore = !!(deliveryTimeStart || deliveryTimeStart === 0); //是否存在小值
    //     if (!regular.checkIsPositiveIntegerEx0.test(deliveryTimeEnd))
    //       return callback(new Error("请输入正整数"));
    //     if (existMinScore && deliveryTimeStart - deliveryTimeEnd > 0)
    //       return callback(new Error("最大值应高于最小值"));
    //   }
    //   callback();
    // },
    // 验证库存
    validateMinInventory(rule, value, callback) {
      let { minInventoryQuantity, maxInventoryQuantity } = this.searchOptions;
      let existMinScore = !!(
        minInventoryQuantity || minInventoryQuantity === 0
      ); //是否存在小值
      if (existMinScore) {
        let existMaxScore = !!(
          maxInventoryQuantity || maxInventoryQuantity === 0
        ); //是否存在最大值
        if (!regular.checkIsPositiveInteger.test(minInventoryQuantity))
          return callback(new Error("请输入非负整数"));
        if (existMaxScore && minInventoryQuantity - maxInventoryQuantity > 0)
          return callback(new Error("最小值应低于最大值"));
      }
      callback();
    },
    validateMaxInventory(rule, value, callback) {
      let { minInventoryQuantity, maxInventoryQuantity } = this.searchOptions;
      let existMaxScore = !!(
        maxInventoryQuantity || maxInventoryQuantity === 0
      ); //是否存在最大值
      if (existMaxScore) {
        let existMinScore = !!(
          minInventoryQuantity || minInventoryQuantity === 0
        ); //是否存在小值
        if (!regular.checkIsPositiveInteger.test(maxInventoryQuantity))
          return callback(new Error("请输入非负整数"));
        if (existMinScore && minInventoryQuantity - maxInventoryQuantity > 0)
          return callback(new Error("最大值应高于最小值"));
      }
      callback();
    },
    // 获取标签列表
    getLabelList() {
      this.$http.get(this.api.otto.getLabelList).then(({ data }) => {
        this.labelList = data || [];
      });
    },
    // 打开异常数据弹窗
    openAbnormalData() {
      this.visibleAbnormalData = true;
    },
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
        this.allWarehouseList = list || [];
      });
    },
    storeChange() {
      let e = this.searchOptions.commonStoreIdList;
      this.transportGroupList = [];
      this.searchOptions.shippingProfileIdList = [];
      if (this.$common.isEmpty(e) || !(e.length == 1)) return;
      this.$store.dispatch("otto/getTransportGroupList", { commonStoreId: e[0] }).then((list) => {
        this.transportGroupList = list;
      });
    },
  },
};
</script>
<style lang="less" scoped>
.table-main-view {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: auto;

  .tabs-right {
    position: absolute;
    top: 10px;
    right: 0;
    height: 39px;
    padding: 0 15px;
    line-height: 39px;
    user-select: none;

    .right-item {
      margin-left: 10px;
      cursor: pointer;

      &:first-child {
        margin-left: 0;
      }
    }

    .text-underline {
      font-weight: bold;
      color: #409eff;
      text-decoration: underline;
      text-underline-position: under;
    }
  }
}
</style>