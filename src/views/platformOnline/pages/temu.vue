<template>
  <div class="page-main temuPage tabPage">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="70px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="店铺">
            <dyt-inputSelect v-model="searchOptions.commonStoreIdList" :reset-all="filterType === 'refresh'"
              :params="{ sLabel: 'accountCode', label: 'accountCode', value: 'commonStoreId' }" :multiple="true"
              :show-all="true" :list="shopList" />
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea v-model="searchOptions.erpSpuList" placeholder="请输入SPU" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-textarea v-model="searchOptions.skuList" placeholder="请输入SKU或店铺SKU" />
          </el-form-item>
          <el-form-item label="链接类型">
            <dyt-select v-model="searchOptions.jitModeStatus">
              <el-option v-for="(item, index) in linkTypeList" :key="index + 'jitModeStatus'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="SKC货号">
            <dyt-textarea v-model="searchOptions.platformSkcList" placeholder="请输入SKC货号" />
          </el-form-item>
          <el-form-item label="商品状态">
            <dyt-select v-model="searchOptions.goodsStatusList" multiple>
              <el-option v-for="(item, index) in goodsStatusArr" :key="index + 'goodsStatusList'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="上架时间">
            <dyt-timePicker v-model="shelfTime" @change="shelfTimeChange" />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 选项卡 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="主链接视图" name="1">
        <temu-main ref="temuMain" :search-options="searchOptions" />
      </el-tab-pane>
      <!-- <el-tab-pane label="子链接视图" name="2">
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import FetchFun from '@/utils/listPage';
import temuMain from './temu/temuMain';
import { goodsStatusArr } from "@/views/marketingStrategy/pages/components/fileData.js";
export default {
  name: "PlatformOnlineTemu",
  components: {
    temuMain,
  },
  data() {
    return {
      searchOptions: {
        commonStoreIdList: [],
        erpSpuList: [],
        platformSkcList: [],
        skuList: [],
        goodsStatusList: [],
        startShelvedTime: "",
        endShelvedTime: "",
        jitModeStatus: '',
      },
      shelfTime: [],
      shopList: [],
      goodsStatusArr: goodsStatusArr(), //ERP商品状态
      isExpand: false,
      platformCode: 'temu',//默认
      activeName: '1',//视图
      filterType: '',
      linkTypeList: {
        0: { label: 'VMI', value: 0 },
        1: { label: 'JIT', value: 1 },
      }
    }
  },
  created() {
    this.getStoreList();
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
          _self.$refs['temuMain'].search();
        },
        // 保持分页查询
        keepPageSearch() {
          _self.$refs["temuMain"].getList();
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions);
          _self.shelfTime = [];
        }
      }
      type && fun[type] && fun[type]();
    },
    // 上架时间
    shelfTimeChange(e) {
      this.timeChange(e, "startShelvedTime", "endShelvedTime");
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
    // // 获取主链接排序方式
    // getSortInfoAndFetch(Info) {
    //   this.$refs['ebayChild'].getSortInfoAndFetch(Info);
    // },
    // // 更新子链接
    // updateChildList() {
    //   this.$refs['ebayChild'].search();
    // },
    getStoreList() {
      this.$store.dispatch('platformList/getstoreList', { platformCode: 'temu' }).then(list => {
        this.shopList = (list || []);
      })
    },
  }
};
</script>
<style lang="scss" scoped></style>