<template>
  <div class="page-main plr10 tabPage">
    <div class="search-content">
      <el-form ref="walmartWFSForm" :inline="true" :rules="rules" :model="searchOptions" label-width="90px"
        class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="店铺">
            <dyt-inputSelect v-model="searchOptions.commonStoreIdList" :reset-all="isResetAll" :params="{
              sLabel: 'accountCode',
              label: 'accountCode',
              value: 'commonStoreId',
            }" :multiple="true" :show-all="true" :list="shopList" />
          </el-form-item>
          <el-form-item label="状态">
            <dyt-select v-model="searchOptions.status">
              <el-option v-for="(item, index) in saleList" :key="index + 'status'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-mulSearch :precise-value.sync="searchOptions.erpSpuList" :vague-value.sync="searchOptions.likeSpu"
              placeholder="请输入SPU/平台SPU" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-mulSearch :precise-value.sync="searchOptions.erpSkuList" :vague-value.sync="searchOptions.likeSku"
              placeholder="请输入SKU/平台SKU" />
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
          <el-form-item label="GTIN">
            <dyt-textarea v-model="searchOptions.gtinList" placeholder="请输入GTIN" />
          </el-form-item>
          <el-form-item label="评分">
            <div class="flex-align no-form-item formb0 differ">
              <el-form-item label-width="0" prop="minAverageRating">
                <el-input v-model="searchOptions.minAverageRating" placeholder="最低评分" type="number" />
              </el-form-item>
              <span class="flexSpan">-</span>
              <el-form-item label-width="0" prop="maxAverageRating">
                <el-input v-model="searchOptions.maxAverageRating" placeholder="最高评分" type="number" />
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item label="上架时间">
            <dyt-timePicker v-model="arraySearch.shelfTime" @change="shelfTimeChange" />
          </el-form-item>
          <el-form-item label="购物车状态">
            <dyt-select v-model="searchOptions.isSellerBuyBoxWinner">
              <el-option v-for="(item, index) in shopCartStatusList" :key="index + 'sCartStatus'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="主链接视图" name="1">
        <walmartWFSMain ref="walmartWFSMain" :search-options="searchOptions" @refreshAll="filterBtn" :tab="activeName" />
      </el-tab-pane>
      <el-tab-pane label="子链接视图" name="2">
        <walmartWFSChild ref="walmartWFSChild" :search-options="searchOptions" @refreshAll="filterBtn"
          :tab="activeName" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import FetchFun from "@/utils/listPage";
import regular from '@/utils/regular.js';
import walmartWFSMain from './walmart/walmartWFSMain';
import walmartWFSChild from './walmart/walmartWFSChild';
import { saleList } from './components/fileData.js';
import { getSalesStatus } from '@/utils/staticDataOrigin';
import { deliveryTypeList } from './walmart/fileData.js';
export default {
  name: "PlatformOnlineWalmartWFS",
  components: {
    walmartWFSMain,
    walmartWFSChild
  },
  data() {
    return {
      searchOptions: {
        commonStoreIdList: [],
        status: 1,
        erpSpuList: [], //spu
        erpSkuList: [], //sku
        goodsStatusList: [],
        itemIdList: [],
        gtinList: [],
        minAverageRating: '',
        maxAverageRating: '',
        isSellerBuyBoxWinner: '',
        startShelvedTime: "",
        endShelvedTime: "",
        likeSku: '',//模糊查询sku
        likeSpu: '',//模糊查询spu
      },
      arraySearch: {
        shelfTime: [],
      },
      filterType: "",
      shopList: [],
      saleList: saleList,
      goodsStatusArr: getSalesStatus(['1', '2', '3', '4', '5', '6']), //ERP商品状态
      activeName: "1", //视图
      isExpand: false,
      platformCode: "walmart",
      commonList: {
        0: { label: "禁用", value: 0 },
        1: { label: "启用", value: 1 },
      },
      deliveryTypeList: deliveryTypeList,
      shopCartStatusList: {
        0: { label: '失去购物车', value: 0 },
        1: { label: '获得购物车', value: 1 },
      },
      rules: {
        minAverageRating: [
          { validator: this.validateMinScore, trigger: 'blur' },
        ],
        maxAverageRating: [
          { validator: this.validateMaxScore, trigger: 'blur' },
        ],
      }
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
      let platformCode = this.platformCode;
      // 获取店铺列表
      this.$store.dispatch("platformList/getstoreList", { platformCode }).then((list) => {
        this.shopList = list || [];
      });
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
      this.filterType = type;
      let fun = {
        // 查询
        submit() {
          _self.$refs['walmartWFSForm'].validate((valid) => {
            if (!valid) return;
            _self.$refs["walmartWFSMain"].search();
            _self.$refs["walmartWFSChild"].search();
          });
        },
        // 保持分页查询
        keepPageSearch() {
          _self.$refs["walmartWFSMain"].getList();
          _self.$refs["walmartWFSChild"].getList();
        },
        // 重置
        refresh() {
          _self.$refs['walmartWFSForm'].resetFields();
          _self.searchOptions = FetchFun.reset(_self.searchOptions, { status: 1 });
          _self.arraySearch = FetchFun.reset(_self.arraySearch);
        },
      };
      type && fun[type] && fun[type]();
    },
    // 上架时间
    shelfTimeChange(e) {
      this.timeChange(e, "startShelvedTime", "endshelvedTime");
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
    // 验证评分
    validateMinScore(rule, value, callback) {
      let { minAverageRating, maxAverageRating } = this.searchOptions;
      let existMaxScore = !!(maxAverageRating || maxAverageRating === 0);//是否存在最大值
      let existMinScore = !!(minAverageRating || minAverageRating === 0);//是否存在小值
      if (existMaxScore && !existMinScore) return callback(new Error('请填写区间最小值'));
      if (existMinScore) {
        if (!regular.checkIsPositive.test(minAverageRating)) return callback(new Error('只允许属于0或者正数'));
        if (existMaxScore && (minAverageRating - maxAverageRating > 0)) return callback(new Error('最小值应低于最大值'));
      }
      callback();
    },
    validateMaxScore(rule, value, callback) {
      let { minAverageRating, maxAverageRating } = this.searchOptions;
      let existMaxScore = !!(maxAverageRating || maxAverageRating === 0);//是否存在最大值
      let existMinScore = !!(minAverageRating || minAverageRating === 0);//是否存在小值
      if (existMinScore && !existMaxScore) return callback(new Error('请填写区间最大值'));
      if (existMaxScore) {
        if (!regular.checkIsPositive.test(maxAverageRating)) return callback(new Error('只允许属于0或者正数'));
        if (existMinScore && (minAverageRating - maxAverageRating > 0)) return callback(new Error('最大值应高于最小值'));
      }
      callback();
    },
  },
}
</script>
<style lang="">
    
</style>