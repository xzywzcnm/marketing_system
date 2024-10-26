<template>
  <div class="salePricePage page-main tabPage">
    <!-- 查询 -->
    <div class="search-content">
      <el-form
        ref="salePriceForm"
        :inline="true"
        :model="searchOptions"
        label-width="96px"
        class="form-search"
        :show-message="false"
      >
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="平台">
            <dyt-select v-model="searchOptions.platformCode" :clearable="false">
              <el-option
                v-for="(item, index) in platformList"
                :key="index + 'platformCode'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="站点">
            <dyt-select v-model="searchOptions.siteCodeList" :multiple="true">
              <el-option
                v-for="(item, index) in stationList"
                :key="index + 'siteCodeList'"
                :label="item"
                :value="item"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺">
            <dyt-inputSelect
              v-model="searchOptions.commonStoreIdList"
              :reset-all="filterType === 'refresh'"
              :params="{
                sLabel: 'labelName',
                label: 'accountCode',
                value: 'commonStoreId',
              }"
              :multiple="true"
              :show-all="true"
              :list="shopList"
              @change="getCommonStoreCategory"
            />
          </el-form-item>
          <el-form-item label="估算利润">
            <dyt-select
              v-model="searchOptions.estimatedProfitStatusList"
              :multiple="true"
            >
              <el-option
                v-for="(item, index) in estimatedProfitList"
                :key="index + 'estimatedProfitStatusList'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea v-model="searchOptions.erpSpuList" placeholder="请输入SPU" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-textarea v-model="searchOptions.erpSkuList" placeholder="请输入SKU" />
          </el-form-item>
          <el-form-item label="ItemID">
            <dyt-textarea v-model="searchOptions.itemIdList" placeholder="请输入ItemID" />
          </el-form-item>
          <el-form-item label="店铺类目">
            <el-cascader
              v-model="searchOptions.storeCategoryIdList"
              :options="commonStoreCategoryList"
              :props="{
                multiple: true,
                label: 'name',
                value: 'platformId',
                emitPath: false,
                children: 'childCategoryList',
              }"
              :show-all-levels="false"
              :placeholder="placeholderText"
              filterable
              collapse-tags
              popper-class="cascaderStyle"
            />
          </el-form-item>
          <el-form-item label="产品状态">
            <dyt-select v-model="searchOptions.goodsStatusList" :multiple="true">
              <template v-for="(item, index) in goodsStatusLists">
                <el-option
                  v-if="!item.hidden"
                  :key="index + 'goodsStatusList'"
                  :label="item.label"
                  :value="item.value"
                />
              </template>
            </dyt-select>
          </el-form-item>
          <el-form-item label="产品类目">
            <el-cascader
              v-model="searchOptions.productCategoryIdList"
              :options="productCategoryList"
              :props="{
                multiple: true,
                label: 'name',
                value: 'productCategoryId',
                emitPath: false,
              }"
              :show-all-levels="false"
              filterable
              collapse-tags
            />
          </el-form-item>
          <el-form-item label="产品标签">
            <dyt-select v-model="searchOptions.productTagNameList" :multiple="true">
              <el-option
                v-for="(item, index) in productTagList"
                :key="index"
                :label="item.name"
                :value="item.name"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="产品克重">
            <div class="flex-align no-form-item formb0 differ">
              <el-form-item label-width="0">
                <el-input
                  v-model="searchOptions.minWeight"
                  placeholder="最小克重"
                  type="number"
                ></el-input>
              </el-form-item>
              <span class="flexSpan">-</span>
              <el-form-item label-width="0">
                <el-input
                  v-model="searchOptions.maxWeight"
                  placeholder="最大克重"
                  type="number"
                ></el-input>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item label="广告费率">
            <div class="flex-align no-form-item formb0 differ">
              <el-form-item label-width="0">
                <el-input
                  v-model="searchOptions.minBidPercentage"
                  placeholder="最小广告费率"
                  type="number"
                >
                  <i slot="suffix">%</i>
                </el-input>
              </el-form-item>
              <span class="flexSpan">-</span>
              <el-form-item label-width="0">
                <el-input
                  v-model="searchOptions.maxBidPercentage"
                  placeholder="最大广告费率"
                  type="number"
                >
                  <i slot="suffix">%</i>
                </el-input>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item label="差值">
            <div class="flex-align no-form-item formb0 differ">
              <el-form-item label-width="0">
                <el-input
                  v-model="otherOptions.minGap"
                  placeholder="最小差值"
                  type="number"
                >
                  <i v-if="btnType == 1" slot="suffix">%</i>
                </el-input>
              </el-form-item>
              <span class="flexSpan">-</span>
              <el-form-item label-width="0" class="noborderForm">
                <el-input
                  v-model="otherOptions.maxGap"
                  placeholder="最大差值"
                  type="number"
                >
                  <i v-if="btnType == 1" slot="suffix">%</i>
                </el-input>
              </el-form-item>
              <el-button class="btnStyle" @click="inputChange">
                {{ btnType == 0 ? "数值" : "比例" }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="售价模板">
            <dyt-select
              v-model="searchOptions.templateIdList"
              :multiple="true"
              @change="templateIdListChange"
            >
              <el-option
                v-for="(item, index) in salePriceTemplateList"
                :key="index + 'templateIdList'"
                :label="item.name"
                :value="item.templateId"
                :class="{ unbindTem: item.name === unbindTemplate }"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="修改状态">
            <dyt-select v-model="searchOptions.updateStatus">
              <el-option
                v-for="(item, index) in editList"
                :key="index + 'updateStatus'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="价格锁定">
            <dyt-select v-model="searchOptions.lockPriceStatus">
              <el-option
                v-for="(item, index) in priceLockList"
                :key="index + 'lockPriceStatus'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="成本折扣率">
            <div class="flex-align no-form-item formb0 differ">
              <el-form-item label-width="0">
                <el-input
                  v-model="searchOptions.minCostDiscount"
                  placeholder="最小折扣率"
                  type="number"
                >
                  <i slot="suffix">%</i>
                </el-input>
              </el-form-item>
              <span class="flexSpan">-</span>
              <el-form-item label-width="0">
                <el-input
                  v-model="searchOptions.maxCostDiscount"
                  placeholder="最大折扣率"
                  type="number"
                >
                  <i slot="suffix">%</i>
                </el-input>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item label="折扣原价售卖">
            <dyt-select v-model="searchOptions.ignoreDiscount">
              <el-option
                v-for="(item, index) in discountList"
                :key="index + 'discountList'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="是否分销">
            <dyt-select v-model="searchOptions.isDistribution">
              <el-option label="是" :value="1" />
              <el-option label="否" :value="0" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="上架时间">
            <dyt-timePicker
              v-model="otherOptions.shelvedTime"
              @change="shelfTimeChange"
            />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 选项卡:active-name="activeName" -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="主链接视图" name="1">
        <main-view
          ref="mainView"
          :search-options="searchOptionsCopy"
          :tab="activeName"
          @refreshAll="refreshAll"
        />
      </el-tab-pane>
      <el-tab-pane label="子链接视图" name="2">
        <child-view
          ref="childView"
          :search-options="searchOptionsCopy"
          :tab="activeName"
          @refreshAll="refreshAll"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import regular from "@/utils/regular.js";
import { getSalesStatus } from "@/utils/staticDataOrigin";
import mainView from "./salePriceComponents/mainView.vue";
import childView from "./salePriceComponents/childView.vue";
import { priceLockList, discountList } from "./components/fileData";
export default {
  name: "MarketingStrategySalePrice",
  components: { mainView, childView },
  data() {
    return {
      searchOptions: {
        platformCode: "ebay",
        siteCodeList: [],
        commonStoreIdList: [],
        estimatedProfitStatusList: [],
        erpSpuList: [],
        erpSkuList: [],
        itemIdList: [],
        goodsStatusList: [],
        storeCategoryList: [],
        templateIdList: [],
        updateStatus: "",
        minPriceGap: "",
        maxPriceGap: "",
        minProfitGap: "",
        maxProfitGap: "",
        productCategoryIdList: [], //产品类目
        productTagNameList: [], //产品标签
        notHaveTemplate: null, //是否绑定模板
        minCostDiscount: "",
        maxCostDiscount: "",
        lockPriceStatus: "",
        minBidPercentage: "",
        maxBidPercentage: "",
        ignoreDiscount: "", // 折扣原价售卖
        startShelvedTime: "",
        endShelvedTime: "",
        isDistribution: "",
        minWeight: "",
        maxWeight: "",
      },
      otherOptions: {
        minGap: "",
        maxGap: "",
        shelvedTime: [],
      },
      platformList: [
        {
          label: "Ebay",
          value: "ebay",
        },
      ], //平台列表
      estimatedProfitList: [
        {
          label: "低利润",
          value: 1,
        },
        {
          label: "负利润",
          value: 0,
        },
        {
          label: "高利润",
          value: 2,
        },
        {
          label: "利润相等",
          value: 3,
        },
      ], //风险列表
      goodsStatusLists: getSalesStatus(), //产品状态
      productCategoryList: [], //产品类目
      salePriceTemplateList: [], //售价模板
      editList: [
        {
          label: "忽略",
          value: "",
        },
        {
          label: "上一次修改失败链接",
          value: "1",
        },
      ], //修改状态
      activeName: "1", //视图
      isExpand: false,
      shopList: [], //店铺列表
      stationList: [], //站点列表
      commonStoreCategoryList: [],
      placeholderText: "选择单个店铺可筛选",
      productTagList: [],
      filterType: "",
      btnType: 0, //0数值，1比例
      unbindTemplate: "未绑定售价模板",
      searchOptionsCopy: {},
      priceLockList: priceLockList,
      discountList: discountList,
    };
  },
  watch: {
    "searchOptions.platformCode": {
      deep: true,
      immediate: true,
      handler(val) {
        if (!val) return;
        let { platformCode } = this.searchOptions;
        this.$store
          .dispatch("platformList/getstoreList", { platformCode })
          .then((list) => {
            this.shopList = (list || []).map((k) => {
              k.labelName = k.accountCode + "[" + k.account + "]";
              return k;
            });
          });
        this.$store
          .dispatch("platformList/getstationList", { platformCode })
          .then((list) => {
            this.stationList = list || [];
          });
      },
    },
  },
  created() {
    this.getCategoryList();
    this.getTemplate();
    this.getAllProductTag();
    this.setSearchOptions(); //初始化searchOptionsCopy
  },
  methods: {
    // 选项切换
    handleClick() {},
    //获取店铺类目
    getCommonStoreCategory(val) {
      if (val && val.length == 1) {
        this.placeholderText = "请选择";
        this.$http
          .get(`${this.api.salePrice.getCommonStoreCategory}?commonStoreId=${val[0]}`)
          .then(({ data }) => {
            this.commonStoreCategoryList = data.childCategoryList;
          });
      } else {
        this.placeholderText = "选择单个店铺可筛选";
        this.commonStoreCategoryList = [];
      }
    },
    //获取产品标签
    getAllProductTag() {
      this.$http.get(this.api.salePrice.getAllProductTag).then(({ data }) => {
        this.productTagList = data;
      });
    },
    // 获取产品类目
    getCategoryList() {
      this.$http.get(this.api.salePrice.getTreeList).then(({ data }) => {
        let fun = (itemList) => {
          if (itemList.children.length > 0) {
            itemList.children.forEach((item) => {
              fun(item);
            });
            return;
          }
          delete itemList.children;
          return;
        };
        (data || []).forEach((itemList) => {
          fun(itemList);
        });
        this.productCategoryList = data || [];
      });
    },
    // 获取模板列表
    getTemplate() {
      this.$store.dispatch("platformList/gettemplateList").then((list) => {
        let arr = [
          {
            name: this.unbindTemplate,
            templateId: this.unbindTemplate,
          },
          ...(list || []),
        ];
        this.salePriceTemplateList = arr;
      });
    },
    // 搜索栏按钮处理
    filterBtn(type) {
      let [_self, searchOptions] = [this, this.searchOptions];
      this.filterType = type;
      let fun = {
        validateWeight() {
          //校验重量
          return fun.validateCommon({
            minNum: searchOptions.minWeight,
            maxNum: searchOptions.maxWeight,
            label: "克重",
            reg: "positiveFloat",
            regMsg: "克重请填入大于0的值，允许两位小数",
          });
        },
        validateGap() {
          //校验差值
          return fun.validateCommon({
            minNum: _self.otherOptions.minGap,
            maxNum: _self.otherOptions.maxGap,
            label: "差值",
            reg: "isMoney",
            regMsg: "差值格式错误，保留两位小数的数~",
          });
        },
        validateCommon(params) {
          return new Promise((resolve, reject) => {
            let { minNum, maxNum, label, reg, regMsg } = params;
            if (_self.$common.isEmpty(minNum) && _self.$common.isEmpty(maxNum))
              return resolve(true);
            if (_self.$common.isEmpty(minNum)) {
              _self.$message.error("请输入最小" + label);
              return reject(false);
            }
            if (_self.$common.isEmpty(maxNum)) {
              _self.$message.error("请输入最大" + label);
              return reject(false);
            }
            if (!regular[reg].test(minNum) || !regular[reg].test(maxNum)) {
              _self.$message.error(regMsg || "格式错误!");
              return reject(false);
            }
            if (minNum - maxNum > 0) {
              _self.$message.error(label + "最小值不能大于最大值");
              return reject(false);
            }
            resolve(true);
          });
        },
        validateCost() {
          //校验成本折扣率
          return new Promise((resolve, reject) => {
            let { minCostDiscount, maxCostDiscount } = searchOptions;
            if (
              _self.$common.isEmpty(minCostDiscount) &&
              _self.$common.isEmpty(maxCostDiscount)
            )
              return resolve(true);
            if (_self.$common.isEmpty(minCostDiscount)) {
              _self.$message.error("请输入最小折扣率");
              return reject(false);
            }
            if (_self.$common.isEmpty(maxCostDiscount)) {
              _self.$message.error("请输入最大折扣率");
              return reject(false);
            }
            if (minCostDiscount > 100 || maxCostDiscount > 100) {
              _self.$message.error("折扣率只允许输入0-100的数字~");
              return reject(false);
            }
            let reg = /^(?:0|[1-9][0-9]?|100)(\.[0-9]{0,2})?$/;
            if (!reg.test(minCostDiscount) || !reg.test(maxCostDiscount)) {
              _self.$message.error("折扣率保留两位小数的数~");
              return reject(false);
            }
            if (minCostDiscount - maxCostDiscount > 0) {
              _self.$message.error("最小折扣率不能大于最大折扣率");
              return reject(false);
            }
            resolve(true);
          });
        },
        validateAdRate() {
          //校验广告费率
          return new Promise((resolve, reject) => {
            let { minBidPercentage, maxBidPercentage } = searchOptions;
            if (
              _self.$common.isEmpty(minBidPercentage) &&
              _self.$common.isEmpty(maxBidPercentage)
            )
              return resolve(true);
            if (_self.$common.isEmpty(minBidPercentage)) {
              _self.$message.error("请输入最小广告费率");
              return reject(false);
            }
            if (_self.$common.isEmpty(maxBidPercentage)) {
              _self.$message.error("请输入最大广告费率");
              return reject(false);
            }
            if (minBidPercentage > 100 || maxBidPercentage > 100) {
              _self.$message.error("广告费率只允许输入0-100的数字~");
              return reject(false);
            }
            let reg = /^(?:0|[1-9][0-9]?|100)(\.[0-9]{0,2})?$/;
            if (!reg.test(minBidPercentage) || !reg.test(maxBidPercentage)) {
              _self.$message.error("广告费率保留两位小数的数~");
              return reject(false);
            }
            if (minBidPercentage - maxBidPercentage > 0) {
              _self.$message.error("最小广告费率不能大于最大广告费率");
              return reject(false);
            }
            resolve(true);
          });
        },
        //判断差值是数值还是比例来赋值
        setGap() {
          return new Promise((resolve) => {
            let typeList = { 0: "PriceGap", 1: "ProfitGap" };
            let type = typeList[_self.btnType] || "";
            searchOptions["min" + type] = _self.otherOptions.minGap;
            searchOptions["max" + type] = _self.otherOptions.maxGap;
            resolve(true);
          });
        },
        // 验证
        async validWait() {
          let validateList = [
            "validateGap",
            "validateCost",
            "validateAdRate",
            "validateWeight",
            "setGap",
          ];
          let resultList = await Promise.all([
            ...validateList.map((k) => fun[k]()),
            _self.setSearchOptions(),
          ]);
          if (!(Array.isArray(resultList) && resultList.every((k) => k === true)))
            return false;
          if (FetchFun.validateForm(_self.searchOptionsCopy)) return false;
          return true;
        },
        // 查询
        submit() {
          this.validWait().then(() => {
            _self.$refs["mainView"].search();
            _self.$refs["childView"].search();
          });
        },
        // 保持分页查询
        keepPageSearch() {
          this.validWait().then(() => {
            _self.$refs["mainView"].getList();
            _self.$refs["childView"].getList();
          });
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions, {
            platformCode: "ebay",
          });
          _self.otherOptions = FetchFun.reset(_self.otherOptions);
        },
      };
      type && fun[type] && fun[type]();
    },
    divRate(num) {
      if (!num) return num;
      let list = String(num).split(".");
      if (!list[1]) return num / 100;
      let len = list[1].length;
      let rate = 1;
      for (let i = 0; i < len; i++) {
        rate += "0";
      }
      let mulNum = num * Number(rate); //处理成整数
      let result = mulNum / Number(rate + "00"); //再除以100
      return result;
    },
    // 处理数据
    setSearchOptions() {
      return new Promise((resolve, reject) => {
        let searchOptionsCopy = this.$common.copy(this.searchOptions);
        let { templateIdList, minCostDiscount, maxCostDiscount } = searchOptionsCopy;
        // 处理未绑定模板
        let isUnbind = templateIdList.includes(this.unbindTemplate);
        searchOptionsCopy.notHaveTemplate = isUnbind ? 0 : null;
        searchOptionsCopy.templateIdList = isUnbind ? [] : templateIdList;
        // 处理折扣率/100
        searchOptionsCopy.minCostDiscount = this.divRate(minCostDiscount);
        searchOptionsCopy.maxCostDiscount = this.divRate(maxCostDiscount);
        this.searchOptionsCopy = searchOptionsCopy;
        resolve(true);
      });
    },
    // 展开或收起
    expand(val) {
      this.isExpand = val.isExpand;
    },
    inputChange() {
      this.btnType = this.btnType == 0 ? 1 : 0;
      let arr = ["minProfitGap", "maxProfitGap", "minPriceGap", "maxPriceGap"];
      arr.forEach((k) => {
        this.searchOptions[k] = "";
      });
    },
    // 未绑定模板处理
    templateIdListChange(e) {
      if (!(Array.isArray(e) && e.length)) return;
      let item = e[e.length - 1];
      if (item === this.unbindTemplate) {
        this.searchOptions.templateIdList = [this.unbindTemplate];
      } else {
        this.searchOptions.templateIdList = e.filter((k) => {
          return k !== this.unbindTemplate;
        });
      }
    },
    // 主链接或者子链接更新，则同时更新接口
    refreshAll() {
      this.filterBtn("keepPageSearch");
    },
    // 上架时间
    shelfTimeChange(e) {
      if (Array.isArray(e)) {
        this.searchOptions.startShelvedTime = e[0] + " 00:00:00";
        this.searchOptions.endShelvedTime = e[1] + " 23:59:59";
      } else {
        this.searchOptions.startShelvedTime = this.searchOptions.endShelvedTime = "";
      }
    },
  },
};
</script>
<style lang="scss">
.cascaderStyle {
  .el-cascader-panel .el-scrollbar .el-cascader-menu__wrap {
    min-height: 100px;
  }
}

.unbindTem {
  color: red;
}
</style>
