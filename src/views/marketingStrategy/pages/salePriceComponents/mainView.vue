<template>
  <div class="page-main ebaySpuViewPage">
    <dyt-table ref="dytTable" :column-info="columnInfo" :table-head="mainTableHead" :table-search="tableSearch"
      :sort-button-list="sortButtonList" @selection-change="handleSelectionChange" @getAllData="getAllData"
      @getSortInfoAndFetch="getSortInfoAndFetch" v-bind="$attrs">
      <!-- 排序 -->
      <div slot="operatorLeft">
        <dyt-dropdown v-for="(item, index) in operationList" :key="index" :dropdown-list="commonList(item)"
          @commandChange="item.commandChange" class="mr10" />
      </div>
      <template slot="log" slot-scope="{ row }">
        <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
      </template>
      <template slot="picture" slot-scope="{ row }">
        <preview-image :url="row.mainPictureUrl">
          <div>{{ siteExsit[row.siteCode] ? siteExsit[row.siteCode].label : row.siteCode }}</div>
        </preview-image>
      </template>
      <template slot="storeInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.accountCode || "-" }}</div>
          <div class="clipContent flex-jcCenter">
            <span class="clipText">{{ row.platformSpu || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" v-if="row.platformSpu"
              @click="$common.copyActiveCode($event, row.platformSpu)" />
          </div>
          <div class="clipContent flex-jcCenter">
            <span class="highCursor clipText" @click="itemGo(row)">{{ row.itemId || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" v-if="row.itemId"
              @click="$common.copyActiveCode($event, row.itemId)" />
          </div>
          <div>{{ row.storeCategoryName || "" }}</div>
          <div>{{ row.storeCategoryName2 || "" }}</div>
        </div>
      </template>
      <template slot="productInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div class="clipContent flex-jcCenter" v-if="row.erpSpu">
            <div class="clipText" title="SPU">{{ row.erpSpu }}</div>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.erpSpu)" />
          </div>
          <span class="highLine" title="商品中文名称">{{ row.productName || "-" }}</span>
          <numInterval v-if="row.minAllDiscount && row.maxAllDiscount" :options="{
            name: '成本折扣率：',
            minNumber: row.minAllDiscount,
            maxNumber: row.maxAllDiscount,
            unit: '%',
          }" :class="{ redStyle: !row.allIgnoreDiscountList.includes('1') }" />
          <el-tag size="mini" v-if="row.originSaleName" title="设置折扣原价售卖后，估价/改价将按照不打折成本计算">
            {{ row.originSaleName }}
          </el-tag>
        </div>
      </template>
      <template slot="titleCategory" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.title || "-" }}</div>
          <span class="highLine">{{ row.platformCategory || "-" }}</span>
        </div>
      </template>
      <template slot="prices" slot-scope="{ row }">
        <numInterval :options="{
          minNumber: row.minLinkDetailPrice,
          maxNumber: row.maxLinkDetailPrice,
          unit: row.currency,
        }">
        </numInterval>
        <numInterval :options="{
          name: '利润：',
          minNumber: row.minEstimateProfit,
          maxNumber: row.maxEstimateProfit,
          unit: '%',
        }">
        </numInterval>
        <div v-if="row.ebayStoreLinkAd !== null">
          <el-tooltip placement="bottom-start" effect="light"
            :content="`广告名称：${row.ebayStoreLinkAd.campaignName || ''}，广告费率：${row.ebayStoreLinkAd.bidPercentage}`">
            <el-tag type="warning" size="mini">广告</el-tag>
          </el-tooltip>
        </div>
      </template>
      <!-- 最低价=最高价，则只显示一个值，少于0的值标红 -->
      <template slot="salePrices" slot-scope="{ row }">
        <numInterval v-if="row.minCalDiscount && row.maxCalDiscount" :options="{
          name: '成本折扣率：',
          minNumber: row.minCalDiscount,
          maxNumber: row.maxCalDiscount,
          unit: '%',
        }" class="black12Style" />
        <numInterval :options="{
          name: '估算价格：',
          minNumber: row.minEstimatePrice,
          maxNumber: row.maxEstimatePrice,
          unit: row.currency,
        }" class="mt4">
        </numInterval>
        <numInterval :options="{
          name: '利润率：',
          minNumber: row.minTemplateProfit,
          maxNumber: row.maxTemplateProfit,
          unit: '%',
        }" class="mt4" />
        <numInterval :options="{
          name: '差值：',
          minNumber: row.minProfitGap,
          maxNumber: row.maxProfitGap,
          unit: '%',
        }" class="mt4" />
        <div class="mt4">
          <el-link type="primary" style="text-decoration: underline" @click="replaceTemplateCommand(3, row)">
            更换模板
          </el-link>
        </div>
      </template>
      <template slot="lastAjust" slot-scope="{ row }">
        <numInterval :options="{
          name: '原价：',
          minNumber: row.minLastUpdatePrice,
          maxNumber: row.maxLastUpdatePrice,
        }" />
        <numInterval :options="{
          name: '调整比例：',
          minNumber: row.minLastUpdateRate,
          maxNumber: row.maxLastUpdateRate,
          unit: '%',
        }" class="mt4" />
        <div class="wordflexCenter mt4"
          v-if="!([null, undefined].includes(row.minLastUpdatePrice) && [null, undefined].includes(row.maxLastUpdatePrice))">
          <span>(</span>
          <numInterval :options="{
            minNumber: row.minLastUpdatePrice,
            maxNumber: row.maxLastUpdatePrice,
          }" />
          <span>)</span>
        </div>
        <div v-if="row.lastUpdateResultTotal > 0" class="mt4">
          <el-link type="danger" :underline="false">
            修改失败
          </el-link>
        </div>
      </template>
      <template slot="mulTime" slot-scope="{ row }">
        <div class="timeWidth">
          <div class="mb6">
            {{ row.estimateTime || "-" }}
          </div>
          <div>
            {{ row.lastUpdateTime || "-" }}
          </div>
        </div>
      </template>
      <template slot="lastTime" slot-scope="{ row }">
        <div class="timeWidth">
          <div class="mb6">
            {{ row.shelvedTime || "-" }}
          </div>
          <div>
            {{ row.gmtUpdated || "-" }}
          </div>
        </div>
      </template>
      <template slot="warning" slot-scope="{ row }">
        <div v-if="row.estimatedProfitStatusList" class="flexColumnCenter">
          <div v-if="row.estimatedProfitStatusList.includes('0')" style="color: #fc2d1a" class="flexCenter">
            <span class="lapa icon-jinggao mr4" />负利润
          </div>
          <div v-if="row.estimatedProfitStatusList.includes('1')" style="color: #fcca00" class="flexCenter mt4">
            <span class="lapa icon-jinggao mr4" />低利润
          </div>
          <div v-if="row.estimatedProfitStatusList.includes('2')" style="color: #81b337" class="flexCenter mt4">
            <span class="lapa icon-jinggao mr4" />高利润
          </div>
          <div v-if="row.estimatedProfitStatusList.includes('3')" style="color: #c0c4cc" class="flexCenter mt4">
            利润相等
          </div>
        </div>
      </template>
      <!-- 头部 -->
      <template slot="soldQuantityHead" slot-scope="scope">
        <div class="flexAllcenter">
          <span>销量信息</span>
          <el-tooltip class="item" effect="dark" content="对应时间已付款/未取消的订单销量" placement="bottom">
            <span class="lapa icon-bangzhu ml6 questIcon" />
          </el-tooltip>
        </div>
      </template>
      <template slot="grossProfitRateHead" slot-scope="scope">
        <div class="flexAllcenter">
          <span>预估毛利信息</span>
          <el-tooltip class="item" effect="dark" content="对应时间的总毛利润/总订单金额（备注：只统计已发货的单品订单）" placement="bottom">
            <span class="lapa icon-bangzhu ml6 questIcon" />
          </el-tooltip>
        </div>
      </template>
      <template slot="refundFeeRateHead" slot-scope="scope">
        <div class="flexAllcenter">
          <span>退款率信息</span>
          <el-tooltip class="item" effect="dark" content="对应时间的退款金额/付款金额（备注：只统计已发货的单品订单）" placement="bottom">
            <span class="lapa icon-bangzhu ml6 questIcon" />
          </el-tooltip>
        </div>
      </template>
    </dyt-table>
    <!-- 更换模板 -->
    <replace-template ref="replaceTemplate" :model-visible.sync="templateInfo.visible"
      :template-type="templateInfo.templateType" :template-num="templateInfo.templateNum"
      :template-data="templateInfo.templateData" @templateReturn="templateReturn" />
    <!-- 日志 -->
    <ebay-common-log v-if="['ebay'].includes(searchOptions.platformCode)" :model-visible.sync="logInfo.visible"
      :request-info="logInfo.data" />
    <common-log v-else :model-visible.sync="logInfo.visible" :request-info="logInfo.data" />
    <!-- 价格锁定 -->
    <priceLock :model-visible.sync="priceLockData.visible" :data="priceLockData.data" @refreshReturn="refreshReturn" />
    <!-- 折扣原价售卖 -->
    <discountOriginPrice :model-visible.sync="discountData.disVisible" :discount-data="discountData.data"
      :total="discountData.total" :child-loading="discountData.loading" @refreshReturn="refreshReturn" />
  </div>
</template>
 
<script>
import qs from "qs";
import previewImage from "@/components/previewImage";
import replaceTemplate from "@/views/components/replaceTemplate";
import recalculate_mixin from "./recalculate_mixin.js";
import template_mixin from "./template_mixin.js";
import numInterval from "@/views/components/numInterval";
import ebayCommonLog from "@/views/platformOnline/pages/ebay/commonLog";
import commonLog from "@/views/components/commonLog";
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import priceLock from './priceLock';
import discountOriginPrice from './discountOriginPrice';
import { columnHead, SupplementZero } from './columnData.js';
import dropdownComfun from "@/views/components/dropdownComfun";

export default {
  name: "SalePriceComponentsEbaySpuView",
  components: { previewImage, replaceTemplate, numInterval, commonLog, priceLock, discountOriginPrice, ebayCommonLog },
  props: {
    searchOptions: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      total: 0,
      multipleSelection: [],
      sortButtonList: [
        {
          sortHeader: "估算利润",
          sortField: "esldv.estimate_profit",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "差值",
          sortField: "esldv.profit_gap",
          sortType: "DESC",
        },
        {
          sortHeader: "更新时间",
          sortField: "esl.gmt_updated",
          sortType: "DESC",
        },
        {
          sortHeader: "售价估算时间",
          sortField: "esldv.estimate_time",
          sortType: "DESC",
        },
        {
          sortHeader: "修改时间",
          sortField: "esldv.last_update_time",
          sortType: "DESC",
        },
      ],
      siteExsit: siteExsit, //站点
      templateInfo: {
        visible: false,
        templateType: 1, //模板（1、批量，2、全部，3、单个）
        templateNum: 0, //模板数量
        templateData: [], //模板数据
      },
      logInfo: {//日志
        visible: false,
        data: {},
      },
      priceLockData: {
        visible: false, //弹框
        data: {},
      },
      discountData: {
        disVisible: false, // 折扣原价售卖弹框
        data: {},
        total: 0,
        loading: false
      },
      tableSearch: {
        requestApi: this.api.salePrice.ebayMainList,
        requestType: 'post',
        searchParmas: {},
        handleData: true,
      },
      columnInfo: {
        controlHead: true,
        platformCode: 'salePrice',
        moduleCode: 'valuationMain',
        option: {
          popperClass: 'salePriceClass'
        }
      },
      powerList: {
        spuReplaceTemplate: "marketing_strategy_salePrice_spuReplaceTemplate", //更换模板
        spuRecalculate: "marketing_strategy_salePrice_spuRecalculate", //重新计算
        mainPriceLock: "marketing_strategy_salePrice_mainPriceLock", //价格锁定
        mainDiscountOrigin: "marketing_strategy_salePrice_mainDiscountedOriginalPrice", // 折扣原价售卖
        export: "marketing_strategy_salePrice_mainExport", //导出
      },
      operationList: {
        spuReplaceTemplate: {
          label: '更换模板',
          power: 'spuReplaceTemplate',
          commandChange: this.replaceTemplateCommand,
        },
        spuRecalculate: {
          label: '售价估算',
          power: 'spuRecalculate',
          commandChange: this.restartComputedCommand,
          loading1: false,
          loading2: false,
        },
        mainPriceLock: {
          label: '价格锁定',
          power: 'mainPriceLock',
          commandChange: this.priceLockCommand,
        },
        mainDiscountOrigin: {
          label: '折扣原价售卖',
          power: 'mainDiscountOrigin',
          commandChange: this.discountOriginCommand,
        },
        export: {
          label: '导出',
          power: 'export',
          commandChange: this.exportListCommand,
          loading1: false,
          loading2: false,
        },
      }
    };
  },
  computed: {
    // 权限
    power() {
      return this.$common.getPower(this.powerList);
    },
    selectionRows() {
      let falg = false;
      Object.keys(this.powerList).forEach(k => {
        !falg && (falg = this.power[k]);
      })
      return falg;
    },
    mainTableHead() {
      let mainTableHead = columnHead[this.searchOptions.platformCode].mainTableHead;
      let list = this.$common.copy(mainTableHead);
      if (!this.selectionRows) list.splice(0, 1);
      return list;
    },
  },
  watch: {
    searchOptions: {
      handler(val) {
        this.tableSearch.searchParmas = {
          ...val,
          pageNum: 1,
          pageSize: 30,
          sortField: "esldv.estimate_profit",
          sortType: "DESC",
        };
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    search() {
      this.$refs['dytTable'].search();
    },
    getList() {
      this.$refs['dytTable'].getList();
    },
    // 公用下拉
    commonList(data) {
      return dropdownComfun.commonList(data, {
        powerList: this.power,
        multipleSelection: this.multipleSelection,
        total: this.total,
      });
    },
    // item链接跳转
    itemGo(row) {
      row.url && window.open(row.url);
    },
    // 查看详情
    detail(row) {
      let routerData = this.$router.resolve({
        path: "/online-detail",
        query: {
          platformCode: this.searchOptions.platformCode,
          linkId: row.id,
          commonStoreId: row.commonStoreId,
        },
      });
      window.open(routerData.href, "_blank");
    },
    // 售价估算
    restartComputedCommand(e) {
      if (![1, 2].includes(e)) return;
      this.operationList.spuRecalculate['loading' + e] = true;
      recalculate_mixin.restartComputedCommand(e, {
        total: this.total,
        list: this.multipleSelection,
        searchOptions: this.searchOptions,
        type: "spu",
      }).then(() => {
        this.search();
      }).finally(() => {
        this.operationList.spuRecalculate['loading' + e] = false;
      });
    },
    // 更换模板
    replaceTemplateCommand(e, row) {
      let result = template_mixin.replaceTemplateCommand(e, {
        row: row,
        total: this.total,
        list: this.multipleSelection,
      });
      if (!result) return;
      this.templateInfo.templateType = e;
      this.templateInfo.templateNum = result.templateNum;
      this.templateInfo.templateData = result.templateData;
      this.templateInfo.visible = true;
    },
    // 返回列表页数据
    getAllData(data) {
      this.total = data.total || 0;
      let fun = (list) => {
        let sortList = (list || []).sort((a, b) => a - b);
        let min = sortList[0] || 0;
        let max = sortList[sortList.length - 1] || 0;
        if (sortList.length == 1) max = min;
        return [min, max];
      };
      let list = (data.list || []).map((k) => {
        k = SupplementZero(k);//预估毛利信息、退款率情况 如无数据则前端补0；
        let productDiscountList = fun(k.productDiscountList);
        k.minAllDiscount = productDiscountList[0] * 100;
        k.maxAllDiscount = productDiscountList[1] * 100;
        let calDiscountList = fun(k.calDiscountList);
        k.minCalDiscount = calDiscountList[0] * 100;
        k.maxCalDiscount = calDiscountList[1] * 100;
        k.originSaleName = this.handleOriginPrice(k);
        return k;
      });
      data.returnData(list);
    },
    // 处理原价售卖
    handleOriginPrice(k) {
      let str = '';
      let list = k.allIgnoreDiscountList || [];//原价售卖状态：0 停用 1 启用
      // 筛选子链接存在原价售卖状态
      let originList = list.filter(k => k == 1);
      if (list.length && originList.length) {
        if (originList.length >= list.length) str = '原价售卖'; else str = '部分原价售卖';
      }
      return str;
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
    },
    // 排序方式
    getSortInfoAndFetch(Info) {
      // 全局广播到同一浏览器标签
      this.$bus.emit("marketingAdmin-salePrice", [...Info], false);
    },
    // 更换模板返回的数据
    templateReturn(data) {
      this.$refs.replaceTemplate.loading = true;
      template_mixin.restartComputedCommand({
        type: "spu",
        templateInfo: data,
        templateType: this.templateInfo.templateType,
        searchOptions: this.searchOptions,
        templateData: this.templateInfo.templateData,
      }).then(() => {
        this.$message.success("操作成功~");
        this.search();
        this.$refs.replaceTemplate.dialogVisible = false;
      }).finally(() => {
        this.$refs.replaceTemplate.loading = false;
      });
    },
    // 查看日志
    logSee(row) {
      if (['ebay'].includes(this.searchOptions.platformCode)) {
        row.linkId = row.id;
        this.logInfo.data = this.$common.copy(row);
      } else {
        let [temp] = [{}];
        temp.axiosApi = this.api.ebay.getLinkLog;
        temp.axiosType = 'get';
        temp.axiosOptions = { linkId: row.id };
        this.logInfo.data = this.$common.copy(temp);
      }
      this.logInfo.visible = true;
    },
    // 价格锁定操作
    priceLockCommand(e) {
      if (![1, 2].includes(e)) return;
      let list = this.multipleSelection;
      let [temp] = [{}];
      if (e == 1) {
        temp.linkIdList = list.map((k) => {
          return k.id;
        });
      } else {
        temp.ebayStoreValuationQO = this.$common.removeEmpty(this.searchOptions);
      }
      this.priceLockData.data = temp;
      this.priceLockData.visible = true;
    },
    // 折扣原价售卖操作
    discountOriginCommand(e) {
      if (![1, 2].includes(e)) return;
      let list = this.multipleSelection;
      let searchOptions = this.$common.removeEmpty(this.searchOptions);
      let [temp] = [{}];
      if (e == 1) {
        temp.linkIdList = list.map((k) => {
          return k.id;
        });
        this.discountData.loading = true
        let mapi = `${this.api.salePrice.getChildNumber}?${qs.stringify({ linkIdList: temp.linkIdList }, { indices: false })}`
        this.$http.post(mapi, searchOptions).then((res) => {
          this.discountData.total = res.data
        }).finally(() => {
          this.discountData.loading = false
        })
      } else {
        temp.ebayStoreValuationQO = searchOptions;
        this.discountData.loading = true
        temp.linkIdList = null
        let mapi = `${this.api.salePrice.getChildNumber}?${qs.stringify({ linkIdList: temp.linkIdList }, { indices: false })}`
        this.$http.post(mapi, searchOptions).then((res) => {
          this.discountData.total = res.data
        }).finally(() => {
          this.discountData.loading = false
        })
      }
      this.discountData.data = temp;
      this.discountData.disVisible = true;
    },
    // 刷新
    refreshReturn() {
      this.$emit('refreshAll');
    },
    // 导出列表
    exportListCommand(e) {
      if (!e) return;
      let str = e == 1 ? '导出选中链接' : '导出所有结果集';
      this.$confirm(`确认${str}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let [temp] = [{}];
        if (e == 1) {
          temp.linkIdList = this.multipleSelection.map(k => k.id);
        } else {
          temp = this.$common.removeEmpty(this.searchOptions);
        }
        // console.log(temp);
        this.operationList.export['loading' + e] = true;
        this.$http.post(this.api.salePrice.mainExport, temp).then(() => {
          this.$message.success('请在导出查看下载查看导出文件');
          this.$bus.emit('marketing-admin-headDownloadView');
          e == 1 && this.getList();
        }).finally(() => {
          this.operationList.export['loading' + e] = false;
        })
      }).catch(() => { });
    },
  },
};
</script>
<style lang="less">
.ebaySpuViewPage {
  .redStyle {
    color: red;
  }

  .black12Style {
    font-size: 12px;
    color: #515a6e;
  }

  .questIcon {
    color: #409EFF;
    cursor: pointer;
  }
}

.salePriceClass {
  width: 550px !important;

  .popverContent .content .checkboxWidth {
    width: 120px !important;
  }
}
</style>