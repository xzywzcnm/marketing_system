<template>
  <div class="page-main mainPage">
    <dyt-table
      ref="dytTable"
      :column-info="columnInfo"
      :table-head="mainTableHead"
      :table-search="tableSearch"
      :sort-button-list="sortButtonList"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
      @getAllData="getAllData"
    >
      <!-- 排序，按钮 -->
      <div slot="operatorLeft">
        <dyt-dropdown
          v-for="(item, index) in operationList"
          :key="index"
          :dropdown-list="commonList(item)"
          class="mr10"
          @commandChange="item.commandChange"
        />
      </div>
      <!-- 日志 -->
      <template slot="log" slot-scope="{ row }">
        <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
      </template>
      <!-- 库存管理 -->
      <template slot="inventoryManage" slot-scope="{ row }">
        <span
          v-if="power.inventoryManage"
          class="lapa icon-chilun listIcon"
          :class="{ blueIcon: row.autoReplenishment > 0 || row.syncInventoryStatus > 0 || row.ignoreInitialization > 0 }"
          @click="inventoryOpen(row)"
        />
      </template>
      <!-- 图片 -->
      <template slot="pictureState" slot-scope="{ row }">
        <preview-image :url="row.thumbUrl">
          <div v-if="row.saleRegion && siteDataJson[row.saleRegion]">
            {{ siteDataJson[row.saleRegion].label }}
          </div>
        </preview-image>
      </template>
      <!-- 店铺/SPU ID -->
      <template slot="storeInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.accountCode || "-" }}</div>
          <!-- <div class="clipContent flex-jcCenter">
            <div v-if="row.accountCode" class="highCursor clipText" @click="itemGo(row)">
              {{ row.accountCode }}
            </div>
            <div v-else>
              -
            </div>
          </div> -->
          <div class="clipContent flex-jcCenter">
            <span class="clipText">{{ row.spuId || "-" }}</span>
            <i v-if="row.spuId" class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.spuId)" />
          </div>
          <!-- <div class="clipContent flex-jcCenter">
            <span class="highCursor clipText" @click="itemGo(row)">{{ row.itemId || "-" }}</span>
            <i v-if="row.itemId" class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.itemId)" />
          </div> -->
        </div>
      </template>
      <!-- 标题/平台类目 -->
      <template slot="titleCategory" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.title || "-" }}</div>
          <div class="highLine">
            {{ row.platformCategory || "-" }}
          </div>
        </div>
      </template>
      <!-- 价格 -->
      <template slot="prices" slot-scope="{ row }">
        <div class="mt4Content">
          <numInterval
            style="display: inline-block; vertical-align: top; line-height: initial;"
            :options="{
              name: '',
              minNumber: row.minPrice,
              maxNumber: row.maxPrice,
            }"
          />
          <div style="display: inline-block; vertical-align: top;">
            {{ row.currency || "" }}
          </div>
        </div>
      </template>
      <!-- 库存 -->
      <template slot="availQuantity" slot-scope="{ row }">
        {{ $common.isEmpty(row.inventoryQuantity) ? '0' : row.inventoryQuantity }}
      </template>
      <!-- 状态 -->
      <template slot="status" slot-scope="{ row }">
        <div v-if="!$common.isEmpty(saleList[row.status])" :style="saleList[row.status].style">
          {{ saleList[row.status].label }}
        </div>
      </template>
      <!-- 上架时间 -->
      <template slot="times" slot-scope="{ row }">
        <div class="flexCenter flex-jcCenter">
          <div class="timeWidth">
            {{ row.shelvedTime || "-" }}
          </div>
        </div>
      </template>
    </dyt-table>

    <!-- 日志 -->
    <common-log :model-visible.sync="logData.visible" :request-info="logData.data" />
    <!-- 修改库存/自动补货/防超卖 -->
    <batchOperation
      ref="batchOperation"
      :model-visible.sync="operationUpdate.visible"
      :data="operationUpdate"
      @batchOperatReturn="batchOperatReturn"
    />
    <!-- 库存管理 -->
    <replenishmenTable :model-visible.sync="replenishment.visible" :data="replenishment.data" :platform-code="platformCode" @search="refreshAll" />
  </div>
</template>

<script>
import previewImage from "@/components/previewImage";
import commonLog from "./commonLog";
// import commonLog from "@/views/components/commonLog";
import batchOperation from "@/views/components/batchOperation";
import replenishmenTable from "./replenishmenTable";
import { siteDataJson, saleList, mainSortButtonList, mainTableHead } from './fileData.js';
import dropdownComfun from "@/views/components/dropdownComfun";
import numInterval from "@/views/components/numInterval";
// import { processFloatPoint } from '@/utils/staticDataOrigin';
export default {
  name: "TiktokMain",
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
      shopList: [],
      platformCode: 'tiktok',
      stationList: [],
      saleList: saleList,
      multipleSelection: [], //表格选中列表
      total: 0,
      siteDataJson: siteDataJson,
      logData: { //日志
        visible: false,
        data: {},
      },
      operationUpdate: { //修改库存/自动补货/防超卖
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
        updateInventory: "productOnline_tiktok_mainUpdateInventory",
        autoReplenishment: "productOnline_tiktok_mainAutoReplenishment",
        preventOversale: "productOnline_tiktok_mainPreventOversale",
        ignorelimit: "productOnline_tiktok_childIgnorelimit",
        inventoryManage: "productOnline_tiktok_mainInventoryManage",
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
        ignorelimit: {
          label: '忽略初始化',
          power: 'ignorelimit',
          commandChange: this.commandIgnorelimit,
        },
      },
      sortButtonList: mainSortButtonList,
      tableSearch: {
        requestApi: this.api.tiktok.list,
        requestType: 'post',
        // searchParmas: this.searchParmas,
        searchParmas: {},
        handleData: true,
      },
      columnInfo: (() => {
        return {
          controlHead: false,
          platformCode: this.platformCode,
          moduleCode: 'mainPage',
        }
      })(),
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
    getSearchOptions () {
      let requerParams = this.$common.copy(this.searchOptions);
      if (this.activeName != '2') {
        delete requerParams.productTagNameList;
      }
      return requerParams;
    }
  },
  watch: {
    getSearchOptions: {
      handler(val) {
        this.tableSearch.searchParmas = {
          ...val,
          pageNum: 1,
          pageSize: 30,
          sortField: 'tsl.shelved_time',
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
      data.returnData(data.list);
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
      temp.axiosApi = this.api.tiktok.queryLinkLog;
      temp.axiosType = 'post';
      temp.paramsArr = ['linkId'];
      temp.axiosOptions = { linkId: row.linkId };
      temp.detailsInfo = this.$common.copy(row);
      this.logData.data = this.$common.copy(temp);
      this.$nextTick(() => {
        this.logData.visible = true;
      })
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
    // 忽略初始化
    commandIgnorelimit(e) {
      this.commandChange(e, 'ignorelimit');
    },
    // 库存管理
    inventoryOpen(row) {
      this.replenishment.data = this.$common.copy(row);
      this.$nextTick(() => {
        this.replenishment.visible = true;
      })
    },
    // 修改库存/自动补货/防超卖 
    async commandChange(e, type) {
      if (![1, 2].includes(e)) return;
      let data = {};
      if (e == 1) {
        data.linkIdList = this.multipleSelection.map(k => k.linkId);
      } else {
        data.tiktokStoreLinkQO = this.$common.removeEmpty(this.getSearchOptions);
      }
      if (this.limitLoading) return;
      this.limitLoading = true;
      let len = await this.getLinkLength(data);
      this.limitLoading = false;

      this.operationUpdate.len = len;
      this.operationUpdate.type = type;
      this.operationUpdate.data = data;
      this.operationUpdate.visible = true;
    },
    // 获取主链接下的子链接长度
    getLinkLength(data) {
      return new Promise(resolve => {
        this.$http.post(this.api.tiktok.countLinkDetailsNum, data).then(({ data }) => {
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
      let operationUpdate = this.operationUpdate;
      let fun = {
        inventory () {
          return { newInventoryQuantity: data.inventoryQuantity };
        },
        replenish () {
          return { newAutoReplenishment: data.replenishType == 1 ? data.autoReplenishment : 0 };
        },
        preventOversale () {
          delete data.syncInventoryWarningValue;
          return data;
        },
        ignorelimit () {
          return data;
        },
      }
      let handleData = fun[operationUpdate.type]();
      let temp = Object.assign({}, handleData, operationUpdate.data);
      // console.log(temp);
      this.$refs['batchOperation'].loading = true;
      this.$http.post(this.api.tiktok.updateBatchLinksInfo, temp).then((res) => {
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
.mainPage {
  position: relative;
}
</style>