<template>
  <div class="page-main walmartMainPage">
    <dyt-table ref="dytTable" :column-info="columnInfo" :table-head="mainTableHead" :table-search="tableSearch"
      :sort-button-list="sortButtonList" @selection-change="handleSelectionChange" @getAllData="getAllData"
      v-bind="$attrs">
      <div slot="operatorLeft">
        <dyt-dropdown v-for="(item, index) in operationList" :key="index" :dropdown-list="commonList(item)" class="mr10"
          @commandChange="item.commandChange" />
      </div>

      <template slot="log" slot-scope="{ row }">
        <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
      </template>
      <template slot="inventoryManage" slot-scope="{ row }">
        <span v-if="power.inventoryManage" class="lapa icon-chilun listIcon" :class="{
          blueIcon:
            row.autoReplenishment > 0 ||
            row.syncInventoryStatus > 0,
        }" @click="inventoryOpen(row)" />
      </template>
      <template slot="pictureState" slot-scope="{ row }">
        <preview-image :url="row.mainPictureUrlQuikly" :fileList="[row.mainPictureUrl]">
          <div v-if="row.averageRating || row.reviewsCount">
            {{ row.averageRating || 0 }} / {{ row.reviewsCount || 0 }}
          </div>
        </preview-image>
      </template>
      <template slot="storeInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.accountCode || "-" }}</div>
          <div class="clipContent flex-jcCenter">
            <div class="highLine clipText">{{ row.erpSpu || "-" }}</div>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.erpSpu)"
              v-if="row.erpSpu" />
          </div>
          <div class="clipContent flex-jcCenter">
            <span class="clipText">{{ row.platformSpu || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.platformSpu)"
              v-if="row.platformSpu" />
          </div>
          <div class="clipContent flex-jcCenter">
            <span class="highCursor clipText" @click="itemGo(row)">{{ row.itemId || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.itemId)"
              v-if="row.itemId" />
          </div>
        </div>
      </template>
      <template slot="titleCategory" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.title || "-" }}</div>
          <div class="highLine">{{ row.platformCategory || "-" }}</div>
        </div>
      </template>
      <template slot="prices" slot-scope="{ row }">
        <div class="mt4Content">
          <numInterval :options="{
            name: '',
            minNumber: row.minPrice,
            maxNumber: row.maxPrice,
          }" />
          <div style="text-decoration:line-through;">
            <numInterval :options="{
              name: '',
              minNumber: row.minComparisonPrice,
              maxNumber: row.maxComparisonPrice,
            }" />
          </div>
          <div>{{ row.currency || "" }}</div>
        </div>
      </template>
      <template slot="times" slot-scope="{ row }">
        <div class="flexCenter flex-jcCenter">
          <div class="timeWidth">{{ row.shelvedTime || "-" }}</div>
        </div>
      </template>
    </dyt-table>

    <!-- 日志 -->
    <common-log :model-visible.sync="logData.visible" :request-info="logData.data" />
    <!-- 修改库存/自动补货/防超卖 -->
    <batchOperation ref="batchOperation" :model-visible.sync="batchOperation.visible" :data="batchOperation"
      @batchOperatReturn="batchOperatReturn" />
    <!-- 库存管理 -->
    <replenishmenTable :model-visible.sync="replenishment.visible" :data="replenishment.data" @search="refreshAll" />
  </div>
</template>

<script>
import previewImage from "@/components/previewImage";
import commonLog from "@/views/components/commonLog";
import batchOperation from "@/views/components/batchOperation";
import replenishmenTable from "./replenishmenTable";
import { mainSortButtonList, mainTableHead } from './fileData.js';
import { saleList } from '../components/fileData.js';
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import dropdownComfun from "@/views/components/dropdownComfun";
import numInterval from "@/views/components/numInterval";
import { processFloatPoint } from '@/utils/staticDataOrigin';
export default {
  name: "WalmartWalmartMain",
  components: { previewImage, commonLog, batchOperation, replenishmenTable, numInterval },
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
      siteExsit: siteExsit,
      shopList: [],
      stationList: [],
      saleList: saleList,
      multipleSelection: [], //表格选中列表
      total: 0,
      logData: { //日志
        visible: false,
        data: {},
      },
      batchOperation: { //修改库存/自动补货/防超卖
        visible: false,
        len: 0,
        type: null,//类型
        data: {},
      },
      replenishment: { //库存管理
        visible: false,
        data: null,
      },
      powerList: {
        updateInventory: "productOnline_walmart_mainUpdateInventory",
        autoReplenishment: "productOnline_walmart_mainAutoReplenishment",
        preventOversale: "productOnline_walmart_mainPreventOversale",
        inventoryManage: "productOnline_walmart_mainInventoryManage",
      },
      operationList: {
        inventory: {
          label: '修改库存',
          power: 'updateInventory',
          commandChange: this.inventoryCommand,
        },
        replenish: {
          label: '设置自动补货',
          power: 'autoReplenishment',
          commandChange: this.replenishCommand,
        },
        preventOversale: {
          label: '设置防超卖',
          power: 'preventOversale',
          commandChange: this.preventOversaleCommand,
        },
      },
      sortButtonList: mainSortButtonList,
      tableSearch: {
        requestApi: this.api.walmart.list,
        requestType: 'post',
        // searchParmas: this.searchParmas,
        searchParmas: {},
        handleData: true,
      },
      columnInfo: {
        controlHead: true,
        platformCode: 'walmart',
        moduleCode: 'walmartMain',
      },
      limitLoading: false,//受限loading
    };
  },
  computed: {
    power() { // 权限
      return this.$common.getPower(this.powerList);
    },
    selectionRows() {
      let falg = false;
      Object.keys(this.powerList).forEach(k => {
        if (k == 'inventoryManage') return;//跳过库存管理
        !falg && (falg = this.power[k]);
      })
      return falg;
    },
    mainTableHead() {
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
          sortField: 'wsl.shelved_time',
          sortType: "DESC",
        };
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 公用下拉
    commonList(data) {
      return dropdownComfun.commonList(data, {
        powerList: this.power,
        multipleSelection: this.multipleSelection,
        total: this.total,
      });
    },
    search() {
      this.$refs['dytTable'].search();
    },
    getList() {
      this.$refs['dytTable'].getList();
    },
    // 返回列表页数据
    getAllData(data) {
      this.total = data.total || 0;
      let list = data.list.map(k => {
        k.linkId = k.id;
        let rateList = ['grossProfitRateTotalYesterday', 'grossProfitRateTotalThreeDay', 'grossProfitRateTotalSevenDay', 'grossProfitRateTotalFifteenDay', 'grossProfitRateTotalMonth', 'refundFeeRateTotalMonth', 'refundFeeRateTotalSixtyDay', 'refundFeeRateTotaNinetyDay'];
        rateList.forEach(ak => {
          let num = processFloatPoint(k[ak] || 0, 2, 100);
          (ak in k) && (k[ak] = num + '%');
        })
        k.mainPictureUrlQuikly = this.$common.handleSmallPicture(k.mainPictureUrl);
        return k;
      })
      data.returnData(list);
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
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
          spu: row.spu,
        },
      });
      window.open(routerData.href, "_blank");
    },
    // 查看日志
    logSee(row) {
      let [temp] = [{}];
      temp.axiosApi = this.api.walmart.getLinkLogs;
      temp.axiosType = 'get';
      temp.axiosOptions = { linkId: row.linkId };
      this.logData.data = this.$common.copy(temp);
      this.logData.visible = true;
    },
    // 修改库存
    inventoryCommand(e) {
      this.commandChange(e, 'inventory');
    },
    // 自动补货
    replenishCommand(e) {
      this.commandChange(e, 'replenish');
    },
    // 防超卖
    preventOversaleCommand(e) {
      this.commandChange(e, 'preventOversale');
    },
    // 库存管理
    inventoryOpen(row) {
      this.replenishment.data = this.$common.copy(row);
      this.replenishment.visible = true;
    },
    // 修改库存/自动补货/防超卖 
    async commandChange(e, type) {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        data.linkIdList = this.multipleSelection.map(k => k.id);
      } else {
        data.walmartStoreLinkQO = this.$common.removeEmpty(this.searchOptions);
      }
      if (this.limitLoading) return;
      this.limitLoading = true;
      len = await this.getLinkLength(data);
      this.limitLoading = false;

      this.batchOperation.len = len;
      this.batchOperation.type = type;
      this.batchOperation.data = data;
      this.batchOperation.visible = true;
    },
    // 获取主链接下的子链接长度
    getLinkLength(data) {
      return new Promise(resolve => {
        this.$http.post(this.api.walmart.countLinkDetailsNum, data).then(({ data }) => {
          let num = data || 0;
          resolve(num);
        }).catch(() => {
          resolve(0);
        })
      })
    },
    // 更新主子链接列表
    refreshAll() {
      this.$emit("refreshAll", "keepPageSearch");
    },
    // 操作返回
    batchOperatReturn(data) {
      let batchOperation = this.batchOperation;
      let fun = {
        inventory() {
          return { newInventoryQuantity: data.inventoryQuantity };
        },
        replenish() {
          return { newAutoReplenishment: data.replenishType == 1 ? data.autoReplenishment : 0 };
        },
        preventOversale() {
          return data;
        },
      }
      let handleData = fun[batchOperation.type]();
      let temp = Object.assign({}, handleData, batchOperation.data);
      // console.log(temp);
      this.$refs['batchOperation'].loading = true;
      this.$http.post(this.api.walmart.updateBatchLinksInfo, temp).then((res) => {
        this.$message.success("操作成功~");
        this.$refs['batchOperation'].dialogVisible = false;
        this.refreshAll();
      }).finally(() => {
        this.$refs['batchOperation'].loading = false;
      })
    },
  },
};
</script>
<style lang="less" scoped>
.walmartMainPage {}
</style>