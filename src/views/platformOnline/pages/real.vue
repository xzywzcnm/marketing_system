<template>
  <div class="page-main plr10 tabPage">
    <div class="search-content">
      <el-form ref="realForm" :inline="true" :model="searchOptions" label-width="100px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="店铺">
            <dyt-inputSelect v-model="searchOptions.commonStoreIdList" :reset-all="isResetAll" :params="{
              sLabel: 'accountCode',
              label: 'accountCode',
              value: 'commonStoreId',
            }" :multiple="true" :show-all="true" :list="shopList" @change="storeChange" @blur="storeChange" />
          </el-form-item>
          <el-form-item label="品牌">
            <dyt-select v-model="searchOptions.manufacturerList" :multiple="true">
              <el-option v-for="(item, index) in brandList" :key="index + 'brand'" :label="item" :value="item" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea v-model="searchOptions.erpSpuList" placeholder="请输入SPU，支持模糊查询" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-mulSearch :preciseValue.sync="searchOptions.skuList" :vagueValue.sync="searchOptions.likeSku"
              placeholder="请输入SKU/平台SKU" vaguePlaceholder="模糊查询仅支持单个查询" />
          </el-form-item>
          <el-form-item label="EAN">
            <dyt-mulSearch :preciseValue.sync="searchOptions.eanList" :vagueValue.sync="searchOptions.likeEan"
              placeholder="请输入EAN" vaguePlaceholder="模糊查询仅支持单个查询" />
          </el-form-item>
          <el-form-item label="状态">
            <dyt-select v-model="searchOptions.status">
              <el-option v-for="(item, index) in saleList" :key="index + 'status'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="商品状态">
            <dyt-select v-model="searchOptions.goodsStatusList" multiple>
              <el-option v-for="(item, index) in goodsStatusArr" :key="index + 'products'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="产品类型">
            <dyt-select v-model="searchOptions.productTypeCode">
              <el-option v-for="(item, index) in productTypeList" :key="index + 'brand'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="标题">
            <dyt-textarea v-model="searchOptions.titleList" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="商品中文名称">
            <dyt-textarea v-model="searchOptions.cnNameList" placeholder="请输入商品中文名称，支持模糊查询" />
          </el-form-item>
          <el-form-item label="自动补货">
            <dyt-select v-model="searchOptions.autoReplenishmentStatus">
              <el-option v-for="(item, index) in deliveryTList" :key="index + 'autoReplenishmentStatus'"
                :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="运输组">
            <dyt-select v-model="searchOptions.shippingGroupIdList" :multiple="true" placeholder="选择单个店铺可筛选">
              <el-option v-for="(item, index) in transportGroupList" :key="index + 'brand'" :label="item.name"
                :value="item.shippingGroupId" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="仓库">
            <dyt-select v-model="searchOptions.warehouseIdList" :multiple="true">
              <el-option v-for="(item, index) in allWarehouseList" :key="index" :label="item.warehouseName"
                :value="item.id" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="库存助手">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option v-for="(item, index) in inventAssistant" :key="index + 'syncInventoryStatus'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="商品匹配">
            <dyt-select v-model="searchOptions.isSkuArtificially">
              <el-option v-for="(item, index) in mateList" :key="index + 'isSkuArtificially'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="上架时间">
            <dyt-timePicker type="datetimerange" v-model="arraySearch.shelvedTime" @change="shelvedTimeChange"
              value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
          <el-form-item label="自动调整物流">
            <dyt-select v-model="searchOptions.syncDeliveryInfoStatus">
              <el-option v-for="(item, index) in commonList" :key="index" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="配送类型">
            <dyt-select v-model="searchOptions.fulfillmentType">
              <el-option v-for="(item, index) in fulfillmentTypeList" :key="index + 'fulfillmentType'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 选项卡 -->
    <div class="table-main-view">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane :label="item.name" :name="item.id" v-for="(item, index) in tabList" :key="index">
          <template v-if="item.componentName">
            <component :is="item.componentName" :ref="item.componentName" :search-options="searchOptions"
              @refreshAll="filterBtn"></component>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import {
  saleList,
  mateList,
  inventAssistant,
  deliveryTList,
  fulfillmentTypeList,
  commonList,
  productTypeList,
} from "./real/fileData.js";
import realChild from "./real/realChild";
import realcz from "./real/realcz";
import { getSalesStatus } from "@/utils/staticDataOrigin";

export default {
  name: "PlatformOnlineReal",
  components: { realChild, realcz },
  data() {
    return {
      searchOptions: {
        commonStoreIdList: [],
        erpSpuList: [], //spu
        skuList: [], //sku
        status: 1,
        fulfillmentType: 0,
        goodsStatusList: [],
        autoReplenishmentStatus: null,
        syncInventoryStatus: null,
        isSkuArtificially: null,
        startShelvedTime: null,
        endShelvedTime: null,
        likeSku: null,//模糊查询sku
        manufacturerList: [],
        shippingGroupIdList: [],
        warehouseIdList: [],
        syncDeliveryInfoStatus: null,
        productTypeCode: null,
        site: null,
        cnNameList: [],
        titleList: [],
        eanList: [],
        likeEan: null,
      },
      arraySearch: {
        shelvedTime: [],
      },
      saleList: saleList,
      mateList: mateList,
      inventAssistant: inventAssistant,
      deliveryTList: deliveryTList,
      fulfillmentTypeList: fulfillmentTypeList,
      shopList: [],
      goodsStatusArr: getSalesStatus(["1", "2", "3", "4", "5", "6"]), //ERP商品状态
      isExpand: false,
      platformCode: "real", //平台
      filterType: "",
      brandList: [],
      productTypeList: productTypeList,
      transportGroupList: [],
      allWarehouseList: [],
      commonList: commonList,
      activeName: null,
    };
  },
  created() {
    this.init();
  },
  computed: {
    isResetAll() {
      return this.filterType === 'refresh';
    },
    stationList() {
      return this.$store.state.real.defaultStationList;
    },
    tabList() {
      let mapList = {
        de: { name: 'realChild' },
        cz: { name: 'realcz' },
      }
      let list = this.stationList.map((k, i) => {
        return {
          ...k,
          componentName: mapList[k.id] ? mapList[k.id].name : '',
        }
      })
      return list;
    },
  },
  watch: {
    activeName: {
      handler(val) {
        this.searchOptions.site = val || null;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    init() {
      // 获取店铺列表
      this.$store.dispatch("platformList/getstoreList", { platformCode: this.platformCode }).then((list) => {
        this.shopList = list || [];
      });
      // 获取品牌列表
      this.$http.get(this.api.real.queryManufacturerInfo).then(({ data }) => {
        this.brandList = data || [];
      });
      this.getAllWarehouseList();
      let tabData = this.tabList[0] || {};
      this.activeName = tabData.id;
    },
    // 获取仓库列表
    getAllWarehouseList() {
      this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
        this.allWarehouseList = list || [];
      });
    },
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
          if (FetchFun.validateForm(_self.searchOptions)) return false;
          let temp = _self.$common.arrayToObj(_self.tabList, 'id');
          let component = temp[_self.activeName];
          if (!component.componentName) {
            _self.$message.warning('找不到对应组件！请联系管理员');
            return;
          }
          let list = _self.$refs[component.componentName];
          list.length && list[0] && list[0].search();
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions, {
            status: 1,
            fulfillmentType: 0,
          });
          _self.arraySearch = FetchFun.reset(_self.arraySearch);
        },
      };
      type && fun[type] && fun[type]();
    },
    // 更新时间
    shelvedTimeChange(e) {
      this.timeChange(e, "startShelvedTime", "endShelvedTime");
    },
    // 时间切换
    timeChange(e, start, end) {
      let valArr = e || [];
      this.searchOptions[start] = valArr[0];
      this.searchOptions[end] = valArr[1];
    },
    storeChange() {
      let e = this.searchOptions.commonStoreIdList;
      this.transportGroupList = [];
      this.searchOptions.shippingGroupIdList = [];
      if (this.$common.isEmpty(e) || !(e.length == 1) || !this.activeName) return;
      this.$store.dispatch("real/getTransportGroupList", { commonStoreId: e[0] }).then((list) => {
        this.transportGroupList = list[this.activeName] || [];
      });
    },
    handleClick(tab, event) {
      this.storeChange();
      // this.filterBtn('submit');
    }
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