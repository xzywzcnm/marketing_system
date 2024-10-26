<template>
  <div class="page-main aliExpressPage plr10">
    <!-- 查询 -->
    <div class="search-content">
      <el-form
        ref="aliExpress"
        :inline="true"
        :model="searchOptions"
        :rules="rules"
        label-width="70px"
        class="form-search"
      >
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="店铺">
            <dyt-inputSelect
              v-model="searchOptions.commonStoreIdList"
              :reset-all="filterType === 'refresh'"
              :params="{
                sLabel: 'accountCode',
                label: 'accountCode',
                value: 'commonStoreId',
              }"
              :multiple="true"
              :show-all="true"
              :list="shopList"
            />
          </el-form-item>
          <el-form-item label="状态">
            <dyt-select v-model="searchOptions.status">
              <el-option
                v-for="item in statusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea
              v-model="searchOptions.spuKeyList"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-textarea
              v-model="searchOptions.skuKeyList"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item label="商品状态">
            <dyt-select
              v-model="searchOptions.erpGoodsStatusList"
              :multiple="true"
            >
              <el-option
                v-for="(item, index) in goodsStatusArr"
                :key="index + 'products'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="商品ID">
            <dyt-textarea
              v-model="searchOptions.productIdList"
              placeholder="请输入"
            />
          </el-form-item>
          <el-form-item label="平台SKU">
            <dyt-textarea
              v-model="searchOptions.platformSkuList"
              placeholder="请输入"
            />
          </el-form-item>
          <!-- <el-form-item label="同步库存">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </dyt-select> 
          </el-form-item> -->
          <el-form-item label="自动补货">
            <dyt-select v-model="searchOptions.autoReplenishmentStatus">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="库存助手">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </dyt-select> 
          </el-form-item>
          <el-form-item label="库存">
            <div class="flex-align no-form-item formb0 differ">
              <el-form-item label-width="0" prop="minInventory">
                <el-input
                  v-model="searchOptions.minInventory"
                  placeholder="最小库存"
                  type="number"
                />
              </el-form-item>
              <span class="flexSpan">-</span>
              <el-form-item label-width="0" prop="maxInventory">
                <el-input
                  v-model="searchOptions.maxInventory"
                  placeholder="最大库存"
                  type="number"
                />
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item label="上架时间">
            <dyt-timePicker v-model="shelfTime" @change="shelfTimeChange" />
          </el-form-item>
          <!-- <el-form-item label="托管类型">
            <dyt-select v-model="searchOptions.managedType">
              <el-option
                v-for="item in manageTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item> -->
        </dyt-filter>
      </el-form>
    </div>
    <eliExpress-main ref="eliExpressMain" :search-options="searchOptions" />
    <!-- <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="主链接视图" name="1">
      </el-tab-pane>
    </el-tabs> -->
  </div>
</template>

<script>
import regular from "@/utils/regular";
import FetchFun from "@/utils/listPage";
import eliExpressMain from "./aliExpress/eliExpressMain";
import { statusList, manageTypeList } from "./aliExpress/fileData.js";
import { getSalesStatus } from "@/utils/staticDataOrigin";
export default {
  name: "PlatformOnlineAliExpress",
  components: {
    eliExpressMain,
  },
  data() {
    return {
      searchOptions: {
        commonStoreIdList: [],
        status: 1,
        spuKeyList: [],
        skuKeyList: [],
        productIdList: [],
        platformSkuList: [],
        // syncInventoryStatus: "",
        autoReplenishmentStatus: "",
        maxInventory: "",
        minInventory: "",
        shelvedStartTime: "",
        shelvedEndTime: "",
        erpGoodsStatusList: [],
        managedType: "",
      },
      rules: {
        minInventory: [
          { validator: this.validateMinInventory, trigger: "blur" },
        ],
        maxInventory: [
          { validator: this.validateMaxInventory, trigger: "blur" },
        ],
      },
      shelfTime: [],
      shopList: [],
      isExpand: false,
      // activeName: '1',//视图
      filterType: "",
      statusList: statusList,
      goodsStatusArr: getSalesStatus(["1", "2", "3", "4", "5", "6", "7"]), //ERP商品状态
      // manageTypeList: manageTypeList,
    };
  },
  created() {
    this.getStoreList();
  },
  methods: {
    // // 选项切换
    // handleClick() { },
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
          _self.$refs["aliExpress"].validate((valid) => {
            if (!valid) return;
            if (FetchFun.validateForm(_self.searchOptions)) return false;
            _self.$refs["eliExpressMain"].search();
          });
        },
        // 保持分页查询
        keepPageSearch() {
          _self.$refs["eliExpressMain"].getList();
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions, {
            status: 1,
          });
          _self.shelfTime = [];
        },
      };
      type && fun[type] && fun[type]();
    },
    // 上架时间
    shelfTimeChange(e) {
      this.timeChange(e, "shelvedStartTime", "shelvedEndTime");
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
    // 获取店铺
    getStoreList() {
      this.$http.get(this.api.aliExpress.combobox).then(({ data }) => {
        this.shopList = data || [];
      });
    },
    // 验证库存
    validateMinInventory(rule, value, callback) {
      let { minInventory, maxInventory } = this.searchOptions;
      let existMinScore = !!(minInventory || minInventory === 0); //是否存在小值
      if (existMinScore) {
        let existMaxScore = !!(maxInventory || maxInventory === 0); //是否存在最大值
        if (!regular.checkIsPositiveInteger.test(minInventory))
          return callback(new Error("请输入非负整数"));
        if (existMaxScore && minInventory - maxInventory > 0)
          return callback(new Error("最小值应低于最大值"));
      }
      callback();
    },
    validateMaxInventory(rule, value, callback) {
      let { minInventory, maxInventory } = this.searchOptions;
      let existMaxScore = !!(maxInventory || maxInventory === 0); //是否存在最大值
      if (existMaxScore) {
        let existMinScore = !!(minInventory || minInventory === 0); //是否存在小值
        if (!regular.checkIsPositiveInteger.test(maxInventory))
          return callback(new Error("请输入非负整数"));
        if (existMinScore && minInventory - maxInventory > 0)
          return callback(new Error("最大值应高于最小值"));
      }
      callback();
    },
  },
};
</script>
<style lang="scss" scoped></style>