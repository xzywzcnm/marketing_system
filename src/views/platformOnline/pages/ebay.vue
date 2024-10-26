<template>
  <div class="page-main ebayPage tabPage">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="70px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="店铺">
            <dyt-inputSelect v-model="searchOptions.accountCodeList" :reset-all="filterType === 'refresh'" :params="{
              sLabel: 'labelName',
              label: 'accountCode',
              value: 'accountCode',
            }" :multiple="true" :show-all="true" :list="shopList" />
          </el-form-item>
          <el-form-item label="站点">
            <dyt-select v-model="searchOptions.siteCodeList" :multiple="true">
              <el-option v-for="item in stationList" :key="item" :label="item" :value="item" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea v-model="searchOptions.erpSpuList" placeholder="请输入SPU" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-textarea v-model="searchOptions.erpSkuList" placeholder="请输入SKU或店铺SKU" />
          </el-form-item>
          <el-form-item label="状态">
            <dyt-select v-model="searchOptions.status">
              <template v-for="(item, index) in saleList">
                <el-option v-if="!item.hidden" :key="index + 'status'" :label="item.label" :value="item.value" />
              </template>
            </dyt-select>
          </el-form-item>
          <el-form-item label="商品状态">
            <dyt-select v-model="searchOptions.goodsStatusList" multiple>
              <el-option v-for="(item, index) in goodsStatusArr" :key="index + 'goodsStatusList'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="ItemID">
            <dyt-textarea v-model="searchOptions.itemIdList" placeholder="请输入ItemID" />
          </el-form-item>
          <el-form-item label="更新时间">
            <dyt-timePicker v-model="arraySearch.finishTime" @change="beginTimeChange" />
          </el-form-item>
          <el-form-item label="上架时间">
            <dyt-timePicker v-model="arraySearch.shelfTime" @change="shelfTimeChange" />
          </el-form-item>
          <el-form-item label="防超卖">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option v-for="(item, index) in syncInventoryStatusList" :key="index + 'syncInventoryStatus'"
                :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="自动补货">
            <dyt-select v-model="searchOptions.autoReplenishment">
              <el-option v-for="(item, index) in syncInventoryStatusList" :key="index + 'autoReplenishment'"
                :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="初始化">
            <dyt-select v-model="searchOptions.ignoreInitialization">
              <el-option v-for="(item, index) in initList" :key="index + 'ignoreInitialization'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="仓库">
            <dyt-select v-model="searchOptions.warehouseIdList" multiple>
              <el-option v-for="(item, index) in allWarehouseList" :key="index + 'warehouseIdList'"
                :label="item.warehouseName" :value="item.id" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="链接受限">
            <dyt-select v-model="searchOptions.constrainStatus">
              <el-option v-for="(item, index) in limitList" :key="index + 'constrainStatus'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 选项卡 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="主链接视图" name="1">
        <ebay-main ref="ebayMain" :search-options="searchOptions" :sale-list="saleList"
          @getSortInfoAndFetch="getSortInfoAndFetch" @refreshAll="filterBtn" :tab="activeName" />
      </el-tab-pane>
      <el-tab-pane label="子链接视图" name="2">
        <ebay-child ref="ebayChild" :search-options="searchOptions" :sale-list="saleList" @refreshAll="filterBtn"
          :tab="activeName" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import ebayMain from "./ebay/ebayMain";
import ebayChild from "./ebay/ebayChild";
import { getSalesStatus } from '@/utils/staticDataOrigin';
export default {
  name: "PlatformOnlineEbay",
  components: {
    ebayMain,
    ebayChild,
  },
  data() {
    return {
      searchOptions: {
        accountCodeList: [],
        siteCodeList: [],
        erpSpuList: [],
        erpSkuList: [],
        itemIdList: [],
        status: 1,
        goodsStatusList: [],
        startUpdateTime: "",
        endUpdateTime: "",
        startShelvedTime: "",
        endShelvedTime: "",
        syncInventoryStatus: "",
        autoReplenishment: "",
        ignoreInitialization: "",
        warehouseIdList: "",
        constrainStatus: ""
      },
      arraySearch: {
        shelfTime: [],
        finishTime: [],
      },
      shopList: [],
      stationList: [],
      saleList: {
        0: { label: "下架/完成", value: 0, style: "color:#F56C6C;" },
        1: { label: "上架", value: 1, style: "color:#409EFF;" },
        2: { label: "Custom", value: 2, style: "color:#F56C6C;", hidden: true },
        3: {
          label: "CustomCode",
          value: 3,
          style: "color:#F56C6C;",
          hidden: true,
        },
        4: { label: "Ended", value: 4, style: "color:#F56C6C;", hidden: true },
      },
      goodsStatusArr: getSalesStatus(['1', '2', '3', '4', '5', '6', '8', '7']), //ERP商品状态
      syncInventoryStatusList: [
        { label: "启用", value: 1 },
        { label: "停用", value: 0 },
      ],
      initList: [
        { label: "正常初始化", value: 0 },
        { label: "忽略初始化", value: 1 },
      ],
      isExpand: false,
      platformCode: "ebay", //默认
      activeName: "1", //视图
      filterType: "",
      limitList: {
        0: { label: "否", value: 0 },
        1: { label: "是", value: 1 },
      },
      allWarehouseList: [],
    };
  },
  created() {
    this.init();
  },
  methods: {
    // 选项切换
    handleClick() { },
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
          _self.$refs["ebayMain"].search();
          _self.$refs["ebayChild"].search();
        },
        // 保持分页查询
        keepPageSearch() {
          _self.$refs["ebayMain"].getList();
          _self.$refs["ebayChild"].getList();
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
    init() {
      let platformCode = this.platformCode;
      // 获取店铺列表
      this.$store
        .dispatch("platformList/getstoreList", { platformCode })
        .then((list) => {
          this.shopList = (list || []).map((k) => {
            k.labelName = k.accountCode + "[" + k.account + "]";
            return k;
          });
        });
      // 获取站点列表
      this.$store
        .dispatch("platformList/getstationList", { platformCode })
        .then((list) => {
          this.stationList = list || [];
        });
      // 获取全部仓库列表
      this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
        this.allWarehouseList = list || [];
      });
    },
    // 上架时间
    shelfTimeChange(e) {
      this.timeChange(e, "startShelvedTime", "endShelvedTime");
    },
    // 更新时间
    beginTimeChange(e) {
      this.timeChange(e, "startUpdateTime", "endUpdateTime");
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
    // 获取主链接排序方式
    getSortInfoAndFetch(Info) {
      this.$refs["ebayChild"].getSortInfoAndFetch(Info);
    },
  },
};
</script>
<style lang="scss" scoped></style>