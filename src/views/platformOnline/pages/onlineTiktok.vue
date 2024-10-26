<template>
  <div class="page-main plr10 tabPage">
    <div class="search-content">
      <el-form ref="tiktokForm" :inline="true" :rules="rules" :model="searchOptions" label-width="90px"
        class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="店铺">
            <dyt-inputSelect v-model="searchOptions.commonStoreIdList" :reset-all="isResetAll" :params="{
              sLabel: 'accountCode',
              label: 'accountCode',
              value: 'commonStoreId',
            }" :multiple="true" :show-all="true" :list="shopList" />
          </el-form-item>
          <el-form-item label="站点">
            <dyt-select v-model="searchOptions.siteCode">
              <el-option v-for="(item, index) in siteDataJson" :key="`site-${index}`" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="状态">
            <dyt-select v-model="searchOptions.statusList" :multiple="true">
              <el-option v-for="(item, index) in saleList" :key="index + 'status'" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="SPU ID">
            <dyt-textarea v-model="searchOptions.spuIdList" placeholder="请输入SPU ID" />
          </el-form-item>
          <el-form-item label="SKU ID">
            <dyt-textarea v-model="searchOptions.skuIdList" placeholder="请输入SKU ID" />
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea v-model="searchOptions.erpSpuList" placeholder="请输入SPU/平台SPU" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-textarea v-model="searchOptions.erpSkuList" placeholder="请输入SKU/平台SKU" />
          </el-form-item>
          <el-form-item v-if="activeName == '2'" label="产品标签">
            <dyt-select v-model="searchOptions.productTagNameList" multiple>
              <!-- <el-option v-for="(item, index) in productCategoryData" :key="index + 'tagName'" :label="item.name" :value="item.productCategoryId" /> -->
              <el-option v-for="(item, index) in productCategoryData" :key="index + 'tagName'" :label="item" :value="item" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="商品状态">
            <dyt-select v-model="searchOptions.goodsStatusList" multiple>
              <el-option v-for="(item, index) in goodsStatusArr" :key="index + 'goodsStatusList'" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="防超卖">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option v-for="(item, index) in commonList" :key="index + 's'" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="自动补货">
            <dyt-select v-model="searchOptions.autoReplenishment">
              <el-option v-for="(item, index) in commonList" :key="index + 'a'" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="初始化">
            <dyt-select v-model="searchOptions.ignoreInitialization">
              <el-option v-for="(item, index) in commonList" :key="index + 'i'" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="上架时间">
            <dyt-timePicker v-model="arraySearch.shelfTime" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" @change="shelfTimeChange" />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 选项卡 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="主链接视图" name="1">
        <tiktok-main ref="tiktokMain" :search-options="searchOptions" :tab="activeName" @refreshAll="filterBtn" />
      </el-tab-pane>
      <el-tab-pane label="子链接视图" name="2">
        <tiktok-child ref="tiktokChild" :search-options="searchOptions" :tab="activeName" @refreshAll="filterBtn" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
// import regular from '@/utils/regular.js';
import tiktokMain from './tiktok/mainPage';
import tiktokChild from './tiktok/childPage';
import { getSalesStatus } from '@/utils/staticDataOrigin';
import { siteDataJson, saleList } from './tiktok/fileData.js';
export default {
  name: "PlatformOnlineWalmart",
  components: { tiktokMain, tiktokChild },
  data() {
    return {
      searchOptions: {
        commonStoreIdList: [],
        siteCode: '',
        statusList: [1],
        spuIdList: [],
        skuIdList: [],
        erpSpuList: [], //spu
        erpSkuList: [], //sku
        productTagNameList: [], // 产品标签
        goodsStatusList: [],
        startShelvedTime: null,
        endShelvedTime: null,
        syncInventoryStatus: "",
        autoReplenishment: "",
        ignoreInitialization: '',
      },
      productCategoryData: [],
      siteDataJson: siteDataJson,
      arraySearch: {
        shelfTime: [],
      },
      filterType: "",
      shopList: [],
      saleList: saleList,
      goodsStatusArr: getSalesStatus(['1', '2', '3', '4', '5', '6', '7']), //ERP商品状态
      activeName: "1", //视图
      isExpand: false,
      platformCode: "tiktok", //平台
      commonList: {
        0: { label: "禁用", value: 0 },
        1: { label: "启用", value: 1 },
      },
      rules: {}
    };
  },
  computed: {
    isResetAll() {
      return this.filterType === 'refresh';
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.$common.promiseAll([
        this.getShopList,
        this.getProductCategory
      ]).finally(() => {

      })
    },
    // 获取店铺列表
    getShopList () {
      return new Promise((resolve) => {
        let platformCode = this.platformCode;
        this.$store.dispatch("platformList/getstoreList", { platformCode }).then((list) => {
          this.shopList = list || [];
          resolve(list || []);
        }).catch(() => {
          resolve([]);
        });
      })
    },
    // 获取所有产品类目
    getProductCategory () {
      return new Promise((resolve) => {
        this.productCategoryData = [];
        this.$http.get(this.api.tiktok.getAllProductCategory).then((res) => {
          if (this.$common.isEmpty(res.data)) return resolve([]);
          this.productCategoryData = this.$common.arrRemoveRepeat(res.data.map(item => item.name));
          resolve(res.data);
        }).catch(() => {
          resolve();
        })
      })
    },
    // 选项切换
    handleClick() {},
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
          _self.$refs['tiktokForm'].validate((valid) => {
            if (!valid) return;
            if (FetchFun.validateForm(_self.searchOptions)) return false;
            _self.$refs["tiktokMain"].search();
            _self.$refs["tiktokChild"].search();
          });
        },
        // 保持分页查询
        keepPageSearch() {
          _self.$refs["tiktokMain"].getList();
          _self.$refs["tiktokChild"].getList();
        },
        // 重置
        refresh() {
          _self.$refs['tiktokForm'].resetFields();
          _self.searchOptions = FetchFun.reset(_self.searchOptions, { statusList: [1] });
          _self.arraySearch = FetchFun.reset(_self.arraySearch);
        },
      };
      type && fun[type] && fun[type]();
    },
    // 上架时间
    shelfTimeChange(e) {
      this.timeChange(e, "startShelvedTime", "endShelvedTime", false);
    },
    // 时间切换
    timeChange(e, start, end, isPush = true) {
      if (Array.isArray(e)) {
        [this.searchOptions[start], this.searchOptions[end]] = e;
        if (isPush) {
          this.searchOptions[start] += " 00:00:00";
          this.searchOptions[end] += " 23:59:59";
        }
      } else {
        this.searchOptions[start] = this.searchOptions[end] = null;
      }
    }
  },
};
</script>