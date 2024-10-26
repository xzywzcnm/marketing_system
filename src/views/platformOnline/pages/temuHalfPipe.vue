<template>
  <div class="page-main temuPage tabPage">
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="96px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="店铺">
            <dyt-inputSelect v-model="searchOptions.commonStoreIdList" :reset-all="filterType === 'refresh'"
              :params="{ sLabel: 'accountCode', label: 'accountCode', value: 'commonStoreId' }" :multiple="true"
              :show-all="true" :list="shopList" />
          </el-form-item>
          <el-form-item label="平台SPU">
            <dyt-textarea v-model="searchOptions.platformSpuList" placeholder="支持多个查询" />
          </el-form-item>
          <el-form-item label="平台SKC">
            <dyt-textarea v-model="searchOptions.platformSkcList" placeholder="支持多个查询" />
          </el-form-item>
          <el-form-item label="平台SKC货号">
            <dyt-textarea v-model="searchOptions.platformSkcItemNumberList" placeholder="支持多个查询" />
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea v-model="searchOptions.erpSpuList" placeholder="支持多个查询" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-textarea v-model="searchOptions.erpSkuList" placeholder="支持多个查询" />
          </el-form-item>
          <el-form-item label="商品中文名称">
            <dyt-textarea v-model="searchOptions.productNameList" placeholder="请输入商品中文名称，支持模糊查询" />
          </el-form-item>
          <el-form-item label="仓库">
            <dyt-select v-model="searchOptions.warehouseIdList" :multiple="true">
              <el-option v-for="(item, index) in allWarehouseList" :key="index" :label="item.warehouseName"
                :value="item.id" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="库存助手">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option v-for="(item, index) in replenishList" :key="index + 'syncInventoryStatus'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="匹配类型">
            <dyt-select v-model="searchOptions.isMatch">
              <el-option v-for="(item, index) in mateList" :key="index + 'isMatch'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <dyt-timePicker v-model="createdTime" @change="createdTimeChange" />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <div class="table-main-view">
      <halfPiperChild ref="halfPiperChild" :search-options="searchOptions" @refreshAll="filterBtn" />
    </div>
  </div>
</template>

<script>
import FetchFun from '@/utils/listPage';
import halfPiperChild from './temuHalfPipe/halfPiperChild.vue';
export default {
  name: "PlatformOnlineTemuHalfPipe",
  components: { halfPiperChild },
  data() {
    return {
      activeName: '1',
      createdTime: [],
      searchOptions: {
        commonStoreIdList: [],
        platformSpuList: [],
        platformSkcList: [],
        platformSkcItemNumberList: [],
        erpSpuList: [],
        erpSkuList: [],
        productNameList: [],
        syncInventoryStatus: null,
        isMatch: null,
        startPlatformCreateTime: null,
        endPlatformCreateTime: null,
        warehouseIdList: [],
      },
      shopList: [],
      isExpand: false,
      filterType: null,
      replenishList: {
        1: { label: "启用", value: 1 },
        0: { label: "停用", value: 0 },
      },
      mateList: {
        0: { label: "未匹配", value: 0 },
        1: { label: "已匹配", value: 1 },
      },
      allWarehouseList: [],
    }
  },
  created() {
    this.getStoreList();
    this.getAllWarehouseList();
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
          // if (FetchFun.validateForm(_self.searchOptions)) return false;
          _self.$refs['halfPiperChild'].search();
        },
        // 保持分页查询
        keepPageSearch() {
          _self.$refs["halfPiperChild"].getList();
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions);
          _self.createdTime = [];
        }
      }
      type && fun[type] && fun[type]();
    },
    // 上架时间
    createdTimeChange(e) {
      this.timeChange(e, "startPlatformCreateTime", "endPlatformCreateTime");
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
    getStoreList() {
      this.$store.dispatch('platformList/getstoreList', { platformCode: 'temuHalfPipe' }).then(list => {
        this.shopList = (list || []);
      })
    },
    // 获取仓库列表
    getAllWarehouseList() {
      this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
        this.allWarehouseList = list || [];
      });
    },
  }
};
</script>
<style lang="less" scoped>
.table-main-view {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: auto;
}
</style>