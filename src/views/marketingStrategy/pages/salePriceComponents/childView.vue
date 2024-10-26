<template>
  <div class="page-main ebaySkuViewPage">
    <dyt-table ref="dytTable" :column-info="columnInfo" :table-head="childTableHead" :table-search="tableSearch"
      @selection-change="handleSelectionChange" @getAllData="getAllData" v-bind="$attrs">
      <!-- 排序 -->
      <div slot="operatorLeft">
        <dyt-dropdown v-for="(item, index) in computOperaList" :key="index" :dropdown-list="commonList(item)"
          @commandChange="item.commandChange" class="mr10" />
      </div>
      <template slot="log" slot-scope="{ row }">
        <span class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
      </template>
      <template slot="picture" slot-scope="{ row }">
        <preview-image :url="row.mainPictureUrl">
          <div>
            {{
              siteExsit[row.siteCode]
              ? siteExsit[row.siteCode].label
              : row.siteCode
            }}
          </div>
        </preview-image>
      </template>
      <template slot="storeInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.accountCode || "-" }}</div>
          <div class="clipContent flex-jcCenter">
            <span class="clipText">{{ row.platformSku || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" v-if="row.platformSku"
              @click="$common.copyActiveCode($event, row.platformSku)" />
          </div>
          <div class="clipContent flex-jcCenter">
            <span class="highCursor clipText" @click="itemGo(row)">{{
              row.itemId || "-"
            }}</span>
            <i class="el-icon-copy-document clipIcon" v-if="row.itemId"
              @click="$common.copyActiveCode($event, row.itemId)" />
          </div>
          <div>{{ row.storeCategoryName || "" }}</div>
          <div>{{ row.storeCategoryName2 || "" }}</div>
        </div>
      </template>
      <template slot="productInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div class="clipContent flex-jcCenter" v-for="(item, index) in row.skuList" :key="index + 'erpSku'">
            <div class="clipText">
              <span title="SKU">{{ item.sku }}</span>
              <span v-if="item.quantity">*{{ item.quantity }}</span>
            </div>
            <i class="el-icon-copy-document clipIcon" v-if="item.sku" @click="$common.copyActiveCode($event, item.sku)" />
          </div>
          <span class="highLine" title="商品中文名称">{{
            row.productName || "-"
          }}</span>
          <div v-if="row.weight">克重：{{ row.weight }} g</div>
          <numInterval v-if="row.allDiscount" :options="{
            name: '成本折扣率：',
            minNumber: row.allDiscount * 100,
            maxNumber: row.allDiscount * 100,
            unit: '%',
          }" :class="{ redStyle: row.allIgnoreDiscount === '0' }" />
          <div>
            <el-tag size="mini" v-if="row.allIgnoreDiscount === '1'" class="mb4" title="设置折扣原价售卖后，估价/改价将按照不打折成本计算">
              原价售卖
            </el-tag>
            <span v-for="(item, index) in row.skuList" :key="index + 'tag'">
              <el-tag type="success" size="mini" class="mb4" v-if="goodsStatusLists[item.erpGoodsStatus]">
                {{ goodsStatusLists[item.erpGoodsStatus].label }}
              </el-tag>
            </span>
            <el-tag size="mini" class="mb4 purpleTag" title="链接销售其他事业部产品" v-if="row.isDistribution == 1">
              分销
            </el-tag>
          </div>
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
          minNumber: row.linkDetailPrice,
          maxNumber: row.linkDetailPrice,
          unit: row.currency,
        }">
        </numInterval>
        <numInterval :options="{
          name: '利润：',
          minNumber: row.estimateProfit,
          maxNumber: row.estimateProfit,
          unit: '%',
        }">
        </numInterval>
        <div class="mt6 flexCenter">
          <div v-if="row.ebayStoreLinkAd !== null" class="mr4">
            <el-tooltip placement="bottom-start" effect="light" :content="`广告名称：${row.ebayStoreLinkAd.campaignName || ''
              }，广告费率：${row.ebayStoreLinkAd.bidPercentage}`">
              <el-tag type="warning" size="mini">广告</el-tag>
            </el-tooltip>
          </div>
          <div v-if="row.allLockPriceStatus == 1">
            <el-tag type="danger" size="mini" title="已锁定价格的链接无法直接在营销系统操作改价，如有需要，先停用价格锁定，再进行操作">价格锁定</el-tag>
          </div>
        </div>
      </template>
      <template slot="salePrices" slot-scope="{ row }">
        <div class="mt4Content">
          <div class="flexCenter">
            <span style="white-space: nowrap">模板：</span>
            <el-tooltip v-if="row.templateName" class="item text-ellipsis" :content="row.templateName" placement="top">
              <span class="no-undeline" @click="replaceTemplateCommand(3, row, 'detail')">
                {{ row.templateName || "" }}
              </span>
            </el-tooltip>
          </div>
          <numInterval v-if="row.calDiscount" :options="{
            name: '成本折扣率：',
            minNumber: row.calDiscount * 100,
            maxNumber: row.calDiscount * 100,
            unit: '%',
          }" class="black12Style" />
          <numInterval :options="{
            name: '利润率：',
            minNumber: row.templateProfit,
            maxNumber: row.templateProfit,
            unit: '%',
          }" />
          <numInterval :options="{
            name: '估算价格：',
            minNumber: row.estimatePrice,
            maxNumber: row.estimatePrice,
            unit: row.currency,
          }">
          </numInterval>
          <div class="wordflexCenter">
            <numInterval :options="{
              name: '差值：',
              minNumber: row.profitGap,
              maxNumber: row.profitGap,
              unit: '%',
            }" />
            <div class="wordflexCenter" v-if="row.priceGap || row.priceGap === 0">
              (
              <numInterval :options="{
                minNumber: row.priceGap,
                maxNumber: row.priceGap,
              }" />
              )
            </div>
          </div>
          <div>
            <span class="underline primaryColor mr10" @click="replaceTemplateCommand(3, row)">更换模板</span>
            <span class="underline primaryColor mr10" @click="seeDetail(row)">查看明细</span>
          </div>
        </div>
      </template>
      <template slot="lastAjust" slot-scope="{ row }">
        <div class="mb4">
          {{
            typeList[row.lastUpdateStatus] &&
            typeList[row.lastUpdateStatus].label
          }}
        </div>
        <div v-if="row.lastUpdateTemplateName" class="text-ellipsis mb4">
          <el-tooltip class="item" :content="row.lastUpdateTemplateName" placement="top">
            <span class="no-undeline">
              {{ row.lastUpdateTemplateName || "" }}
            </span>
          </el-tooltip>
        </div>
        <numInterval :options="{
          name: '原价：',
          minNumber: row.lastUpdateOriginalPrice,
          maxNumber: row.lastUpdateOriginalPrice,
        }" class="mb4" />
        <div class="wordflexCenter mb4">
          <numInterval :options="{
            name: '调整比例：',
            minNumber: row.lastUpdateRate,
            maxNumber: row.lastUpdateRate,
            unit: '%',
          }" />
          <div class="wordflexCenter" v-if="![null, undefined].includes(row.lastUpdatePrice)">
            (
            <numInterval :options="{
              minNumber: row.lastUpdatePrice,
              maxNumber: row.lastUpdatePrice,
            }" />)
          </div>
        </div>
        <div v-if="row.lastUpdateResult == 1">
          <el-link type="danger" :underline="false"> 修改失败 </el-link>
        </div>
      </template>
      <template slot="productTag" slot-scope="{ row }">
        <div v-for="(item, index) in row.productTagNameList" :key="index">
          {{ item }}
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
        <div class="flexColumnCenter">
          <div v-if="row.estimatedProfitStatus === '0'" style="color: #fc2d1a" class="flexCenter">
            <span class="lapa icon-jinggao mr4" />负利润
          </div>
          <div v-if="row.estimatedProfitStatus === '1'" style="color: #fcca00" class="flexCenter mt4">
            <span class="lapa icon-jinggao mr4" />低利润
          </div>
          <div v-if="row.estimatedProfitStatus === '2'" style="color: #81b337" class="flexCenter mt4">
            <span class="lapa icon-jinggao mr4" />高利润
          </div>
          <div v-if="row.estimatedProfitStatus === '3'" style="color: #c0c4cc" class="flexCenter mt4">
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
      :template-data="templateInfo.templateData" :template-edit="templateInfo.templateEdit"
      @templateReturn="templateReturn" />
    <!-- 修改价格 -->
    <modify-price :model-visible.sync="priceData.priceDialog" :price-data="priceData" @search="refreshReturn" />
    <!-- 售价估算明细 -->
    <estimation-details :model-visible.sync="estimation.visible" :detail-data="estimation.data" />
    <!-- 日志 -->
    <ebay-common-log v-if="['ebay'].includes(searchOptions.platformCode)" :model-visible.sync="logInfo.visible"
      :request-info="logInfo.data" />
    <common-log v-else :model-visible.sync="logInfo.visible" :request-info="logInfo.data" />
    <!-- 价格锁定 -->
    <priceLock :model-visible.sync="priceLockData.visible" :data="priceLockData.data" @refreshReturn="refreshReturn" />
    <!-- 折扣原价售卖 -->
    <discountOriginPrice :model-visible.sync="discountData.disVisible" :discount-data="discountData.data"
      :total="discountData.total" @refreshReturn="refreshReturn" />
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import modifyPrice from "./modifyPrice";
import estimationDetails from "./estimationDetails";
import previewImage from "@/components/previewImage";
import replaceTemplate from "@/views/components/replaceTemplate";
import { getSalesStatus } from "@/utils/staticDataOrigin";
import recalculate_mixin from "./recalculate_mixin.js";
import template_mixin from "./template_mixin.js";
import numInterval from "@/views/components/numInterval";
import ebayCommonLog from "@/views/platformOnline/pages/ebay/commonLog";
import commonLog from "@/views/components/commonLog";
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import priceLock from "./priceLock";
import discountOriginPrice from "./discountOriginPrice.vue";
import { columnHead, SupplementZero } from "./columnData.js";
import dropdownComfun from "@/views/components/dropdownComfun";

export default {
  name: "SalePriceComponentsEbaySkuView",
  components: {
    previewImage,
    replaceTemplate,
    modifyPrice,
    estimationDetails,
    numInterval,
    commonLog,
    priceLock,
    discountOriginPrice,
    ebayCommonLog,
  },
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
        templateEdit: "edit", //模板是否可编辑
      },
      priceData: {
        data: {},
        priceDialog: false, //价格弹框
        priceType: 1, //价格类型 1批量 2全部
        priceLength: 0, //链接长度
        isExistLock: false, //是否存在价格锁定
        priceVerify: false, //是否链接数量确认
      },
      estimation: {
        visible: false,
        data: {},
      },
      typeList: {
        0: {
          label: "按售价模板调整",
          value: 0,
        },
        1: {
          label: "按链接绑定模板调整",
          value: 1,
        },
        2: {
          label: "按数值调整",
          value: 2,
        },
        3: {
          label: "按比例调整",
          value: 3,
        },
      }, //修改类型
      logInfo: {
        //日志
        visible: false,
        data: {},
      },
      priceLockData: {
        visible: false, //弹框
        data: {},
        unLock: false, //是否存在未锁定
        priceLoading: false,
      },
      discountData: {
        disVisible: false, //折扣原价售卖弹框
        data: {},
        total: 0,
      },
      tableSearch: {
        requestApi: this.api.salePrice.ebaySubList,
        requestType: "post",
        searchParmas: {},
        handleData: true,
      },
      columnInfo: {
        controlHead: true,
        platformCode: "salePrice",
        moduleCode: "valuationChild",
        option: {
          popperClass: "salePriceClass",
        },
      },
      powerList: {
        spuReplaceTemplate: "marketing_strategy_salePrice_skuReplaceTemplate", //更换模板
        spuRecalculate: "marketing_strategy_salePrice_skuRecalculate", //重新计算
        skuModifyPrice: "marketing_strategy_salePrice_skuModifyPrice", //修改价格
        export: "marketing_strategy_salePrice_childExport", //导出
        childPriceLock: "marketing_strategy_salePrice_childPriceLock", //价格锁定
        childDiscountOrigin:
          "marketing_strategy_salePrice_childDiscountedOriginalPrice", // 折扣原价售卖
      },
      operationList: {
        spuReplaceTemplate: {
          label: "更换模板",
          power: "spuReplaceTemplate",
          commandChange: this.replaceTemplateCommand,
        },
        spuRecalculate: {
          label: "售价估算",
          power: "spuRecalculate",
          commandChange: this.restartComputedCommand,
          loading1: false,
          loading2: false,
        },
        childPriceLock: {
          label: "价格锁定",
          power: "childPriceLock",
          commandChange: this.priceLockCommand,
        },
        export: {
          label: "导出",
          power: "export",
          commandChange: this.exportListCommand,
          loading1: false,
          loading2: false,
        },
        childDiscountOrigin: {
          label: "折扣原价售卖",
          power: "childDiscountOrigin",
          commandChange: this.discountOriginCommand,
        },
      },
    };
  },
  computed: {
    // 权限
    power() {
      return this.$common.getPower(this.powerList);
    },
    computOperaList() {
      let modifyPriceDisabled1 = !(
        this.multipleSelection.length && this.unlockList.length
      );
      let modifyPriceDisabled2 = !(this.total && this.priceLockData.unLock);
      return {
        ...this.operationList,
        skuModifyPrice: {
          label: "修改价格",
          power: "skuModifyPrice",
          commandChange: this.modifyPriceCommand,
          disabled: [false, modifyPriceDisabled1, modifyPriceDisabled2],
        },
      };
    },
    // 未锁定价格的链接
    unlockList() {
      return this.multipleSelection.filter((k) => {
        return k.allLockPriceStatus === "0";
      });
    },
    goodsStatusLists() {
      let list = getSalesStatus(["1", "2", "3", "4", "5", "6", "8"]);
      let statusObj = {};
      list.forEach((k) => (statusObj[k.value] = k));
      return statusObj;
    },
    selectionRows() {
      let falg = false;
      Object.keys(this.powerList).forEach((k) => {
        !falg && (falg = this.power[k]);
      });
      return falg;
    },
    childTableHead() {
      let childTableHead =
        columnHead[this.searchOptions.platformCode].childTableHead;
      let list = this.$common.copy(childTableHead);
      if (!this.selectionRows) list.splice(0, 1);
      return list;
    },
  },
  created() {
    // 监听广播
    this.$bus.on("marketingAdmin-salePrice", this.getSortInfoAndFetch);
  },
  beforeDestroy() {
    // 关闭广播监听
    this.$bus.off("marketingAdmin-salePrice", this.getSortInfoAndFetch);
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
      this.$refs["dytTable"].search();
    },
    getList() {
      this.$refs["dytTable"].getList();
    },
    // 公用下拉
    commonList(data) {
      return dropdownComfun.commonList(data, {
        powerList: this.power,
        multipleSelection: this.multipleSelection,
        total: this.total,
      });
    },
    // 重新计算
    restartComputedCommand(e) {
      if (![1, 2].includes(e)) return;
      this.operationList.spuRecalculate["loading" + e] = true;
      recalculate_mixin
        .restartComputedCommand(e, {
          total: this.total,
          list: this.multipleSelection,
          searchOptions: this.searchOptions,
          type: "sku",
        })
        .then(() => {
          this.search();
        })
        .finally(() => {
          this.operationList.spuRecalculate["loading" + e] = false;
        });
    },
    // 更换模板
    replaceTemplateCommand(e, row, templateEdit) {
      let result = template_mixin.replaceTemplateCommand(e, {
        row: row,
        total: this.total,
        list: this.multipleSelection,
      });
      if (!result) return;
      this.templateInfo.templateType = e;
      this.templateInfo.visible = true;
      this.templateInfo.templateNum = result.templateNum;
      this.templateInfo.templateData = result.templateData;
      this.templateInfo.templateEdit = templateEdit || "edit";
    },
    // 计算价格
    async modifyPriceCommand(e) {
      if (![1, 2].includes(e)) return;
      if (this.priceLockData.priceLoading)
        return this.$message.warning("请稍等~");
      FetchFun.reset(this.priceData, {
        priceType: 1,
      });
      let [temp, len, isExistLock] = [null, 0, false];
      let [unlockList] = [this.unlockList];
      let lockList = this.multipleSelection.filter((k) => {
        return k.allLockPriceStatus === "1";
      }); // 存在价格锁定
      if (e == 1) {
        temp = { list: unlockList };
        len = unlockList.length;
        isExistLock = !!lockList.length;
      } else {
        temp = this.searchOptions;
        len = await this.getUnlockNum(1); //获取全部结果集
        isExistLock = this.total - len > 0;
      }
      this.priceData.data = temp;
      this.priceData.priceType = e;
      this.priceData.priceLength = len;
      this.priceData.isExistLock = isExistLock;
      this.priceData.priceVerify = !(e == 1);
      this.priceData.priceDialog = true;
    },
    // 导出列表
    exportListCommand(e) {
      if (!e) return;
      let str = e == 1 ? "导出选中链接" : "导出所有结果集";
      this.$confirm(`确认${str}吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let temp = {};
          if (e == 1) {
            temp.linkDetailIdList = this.multipleSelection.map((k) => k.id);
          } else {
            temp = this.$common.removeEmpty(this.searchOptions);
          }
          this.operationList.export["loading" + e] = true;
          this.$http
            .post(this.api.salePrice.detailExport, temp)
            .then(() => {
              this.$message.success("请在导出查看下载查看导出文件");
              this.$bus.emit("marketing-admin-headDownloadView");
              e == 1 && this.getList();
            })
            .finally(() => {
              this.operationList.export["loading" + e] = false;
            });
        })
        .catch(() => { });
    },
    // 返回列表页数据
    getAllData(data) {
      this.total = data.total || 0;
      let list = (data.list || []).map((k) => {
        k = SupplementZero(k); //预估毛利信息、退款率情况 如无数据则前端补0；
        // 正常状态SKU和映射SKU处理统一格式
        let skuList = [];
        const goodsStatus = k.status;
        if ([6].includes(goodsStatus)) {
          // goodsStatus为6展示无状态SKU
          skuList.push({
            sku: null,
            erpGoodsStatus: goodsStatus,
          });
        } else if ([7].includes(goodsStatus)) {
          // goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
          let erpSkuMappingVO = k.erpSkuMappingVO || [];
          let blindBox = false; //是否盲盒
          erpSkuMappingVO.forEach((vo) => {
            if (blindBox) return;
            // 映射类型，0：组合产品，1：随机发一个SKU产品
            blindBox = vo.skuType == 1;
            // blindBox && (k.productName = vo.name);
            k.productName = vo.name;
            const sku = blindBox ? k.erpSku : vo.erpSku;
            skuList.push({
              sku: sku,
              quantity: blindBox ? null : vo.quantity,
              erpGoodsStatus: blindBox ? 8 : vo.erpGoodsStatus,
            });
          });
        } else {
          // goodsStatus为0-5展示erpSku 或者不在其中状态的也展示最基础的
          skuList.push({
            sku: k.erpSku,
            erpGoodsStatus: goodsStatus,
          });
        }
        k.skuList = skuList;
        return k;
      });
      data.returnData(list);
      this.getUnlockNum(0).then((data) => {
        this.priceLockData.unLock = data === 0 ? true : false; //数量或是否有未锁定（0：有 1：无）
      });
    },
    // 获取子链接全量修改价格，未锁定价格数量
    getUnlockNum(type) {
      return new Promise((resolve, reject) => {
        let temp = this.$common.removeEmpty(this.searchOptions);
        // temp.lockPriceStatus = lockPriceStatus;//锁定价格状态：0 不锁定 1 锁定
        let apiUrl = `${this.api.salePrice.getNotLockPriceNumber}?type=${type}`; //type:0列表1详情
        type && (this.priceLockData.priceLoading = true);
        this.$http
          .post(apiUrl, temp)
          .then(({ data }) => {
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            type && (this.priceLockData.priceLoading = false);
          });
      });
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.$refs["dytTable"].getSortInfoAndFetch(Info);
    },
    // item链接跳转
    itemGo(row) {
      row.url && window.open(row.url);
    },
    // 查看售价估算明细
    seeDetail(row) {
      this.estimation.visible = true;
      this.estimation.data = row;
    },
    // 更换模板
    templateReturn(templateInfo) {
      this.$refs.replaceTemplate.loading = true;
      template_mixin
        .restartComputedCommand({
          type: "sku",
          templateInfo: templateInfo,
          templateType: this.templateInfo.templateType,
          searchOptions: this.searchOptions,
          templateData: this.templateInfo.templateData,
        })
        .then(() => {
          this.$message.success("操作成功~");
          this.search();
          this.$refs.replaceTemplate.dialogVisible = false;
        })
        .finally(() => {
          this.$refs.replaceTemplate.loading = false;
        });
    },
    // 查看日志
    logSee(row) {
      if (["ebay"].includes(this.searchOptions.platformCode)) {
        this.logInfo.data = this.$common.copy(row);
      } else {
        let [temp] = [{}];
        temp.axiosApi = this.api.ebay.getLinkLog;
        temp.axiosType = "get";
        temp.axiosOptions = { linkId: row.linkId };
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
        temp.linkDetailIdList = list.map((k) => {
          return k.id;
        });
      } else {
        temp.ebayStoreValuationQO = this.$common.removeEmpty(
          this.searchOptions
        );
      }
      this.priceLockData.data = temp;
      this.priceLockData.visible = true;
    },
    // 折扣原价售卖操作
    discountOriginCommand(e) {
      if (![1, 2].includes(e)) return;
      let list = this.multipleSelection;
      let [temp] = [{}];
      if (e == 1) {
        this.discountData.total = this.multipleSelection.length;
        temp.linkDetailIdList = list.map((k) => {
          return k.id;
        });
      } else {
        temp.ebayStoreValuationQO = this.$common.removeEmpty(
          this.searchOptions
        );
        this.discountData.total = this.total;
      }
      this.discountData.data = temp;
      this.discountData.disVisible = true;
    },
    // 刷新
    refreshReturn() {
      this.$emit("refreshAll");
    },
  },
};
</script>
<style lang="scss">
.ebaySkuViewPage {
  .flexColumnCenter {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .redStyle {
    color: red;
  }

  .black12Style {
    font-size: 12px;
    color: #515a6e;
  }

  .questIcon {
    color: #409eff;
    cursor: pointer;
  }
}

.salePriceClass {
  width: 600px !important;

  .popverContent .content .checkboxWidth {
    width: 130px !important;
  }
}
</style>