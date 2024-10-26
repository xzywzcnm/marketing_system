<template>
  <div class="page-main childPage">
    <dyt-table ref="dytTable" :column-info="columnInfo" :table-head="childTableHead" :table-search="tableSearch"
      :sort-button-list="sortButtonList" v-bind="$attrs" @selection-change="handleSelectionChange"
      @getAllData="getAllData"
    >
      <!-- 按钮、排序 -->
      <div slot="operatorLeft">
        <dyt-dropdown
          v-for="(item, index) in operationList"
          :key="index"
          class="mr10"
          :dropdown-list="commonList(item)"
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
          v-if="power.inventoryManage" class="lapa icon-chilun listIcon" 
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
      <!-- 店铺/SKU ID/平台SKU -->
      <template slot="storeInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.accountCode || "-" }}</div>
          <div class="clipContent flex-jcCenter">
            <span class="clipText">{{ row.skuId || "-" }}</span>
            <i v-if="row.skuId" class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.skuId)" />
          </div>
          <div class="clipContent flex-jcCenter">
            <span class="clipText">{{ row.platformSku || "-" }}</span>
            <i v-if="row.platformSku" class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.platformSku)" />
          </div>
        </div>
      </template>
      <!-- 产品信息 -->
      <template slot="productInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div v-for="(item, index) in row.skuList" :key="index + 'erpSku'" class="clipContent flex-jcCenter">
            <div class="clipText">
              <span title="SKU">{{ item.sku }}</span>
              <span v-if="item.quantity">*{{ item.quantity }}</span>
            </div>
            <i v-if="item.sku" class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, item.sku)" />
          </div>
          <div class="highLine" title="商品中文名称">
            {{ row.productName || "-" }}
          </div>
          <div>
            <span v-for="(item, index) in row.skuList" :key="index + 'tag'">
              <el-tag
                v-if="goodsStatusLists[item.erpGoodsStatus]"
                :type="goodsStatusLists[item.erpGoodsStatus].value == 0 ? 'danger' : 'success'"
                size="mini"
                class="mb4"
              >
                {{ goodsStatusLists[item.erpGoodsStatus].label }}
              </el-tag>
              <!-- <span>-</span> -->
            </span>
          </div>
        </div>
      </template>
      <!-- 产品标签 -->
      <template slot="productTagName" slot-scope="{ row }">
        <template v-if="!$common.isEmpty(row.productGoodsTagName)">
          <div v-for="(tagName, tIndex) in (row.productGoodsTagName || '').split(',')" :key="`tag-${tIndex}`" class="mb4">
            {{ tagName }}
          </div>
        </template>
        <template v-else>
          -
        </template>
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
      <!-- 多属性 -->
      <template slot="attrs" slot-scope="{ row }">
        <div v-if="row.variationSpecifics">
          <div v-for="(item, index) in row.variationSpecifics.split(';')" :key="index" class="mb6">
            {{ item }}
          </div>
        </div>
      </template>
      <!-- 价格 -->
      <template slot="prices" slot-scope="{ row }">
        <div class="mt4Content">
          <!-- <div style="padding-bottom:4px;">
            <el-tooltip effect="dark" :content="'当前购物车价格：' + String(row.buyBoxItemPrice || 0)" placement="top"
              :disabled="row.isSellerBuyBoxWinner == 1" :open-delay="500">
              <div class="lapa icon-huaban carIcon" :class="{ highCheck: row.isSellerBuyBoxWinner == 1 }" />
            </el-tooltip>
          </div> -->
          <div style="display: inline-block; vertical-align: top; line-height: initial;">
            {{ row.price || 0 }}
          </div>
          <!-- <div v-if="row.comparisonPrice" style="text-decoration:line-through;">
            {{ row.comparisonPrice }}
          </div> -->
          <div style="display: inline-block; vertical-align: top; line-height: initial;">
            {{ row.currency || "" }}
          </div>
        </div>
      </template>
      <!-- 库存 -->
      <template slot="availQuantity" slot-scope="{ row }">
        {{ $common.isEmpty(row.inventoryQuantity) ? '0' : row.inventoryQuantity }}
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
    <!-- 修改库存/自动补货/防超卖/忽略初始化 -->
    <batchOperation
      ref="batchOperation"
      :model-visible.sync="operationUpdate.visible"
      :data="operationUpdate"
      @batchOperatReturn="batchOperatReturn"
    />
    <!-- 库存管理 -->
    <replenishmenTable
      :model-visible.sync="replenishment.visible"
      :data="replenishment.data"
      :platform-code="platformCode"
      @search="refreshAll"
    />
  </div>
</template>

<script>
import previewImage from "@/components/previewImage";
import commonLog from "./commonLog";
// import commonLog from "@/views/components/commonLog";
import batchOperation from "@/views/components/batchOperation";
import replenishmenTable from "./replenishmenTable";
import { siteDataJson, saleList, childSortButtonList, childTableHead } from './fileData.js';
import { getSalesStatus } from '@/utils/staticDataOrigin';
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import dropdownComfun from "@/views/components/dropdownComfun";
import { deliveryTypeList } from './fileData.js';
export default {
  name: "TiktokChild",
  components: { previewImage, commonLog, replenishmenTable, batchOperation },
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
      saleList: saleList,
      platformCode: 'tiktok',
      siteDataJson: siteDataJson,
      siteExsit: siteExsit,
      multipleSelection: [], //表格选中列表
      total: 0,
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
        updateInventory: "productOnline_tiktok_childMainUpdateInventory",
        autoReplenishment: "productOnline_tiktok_childMainAutoReplenishment",
        preventOversale: "productOnline_tiktok_childMainPreventOversale",
        ignorelimit: "productOnline_tiktok_childIgnorelimit",
        inventoryManage: "productOnline_tiktok_childMainInventoryManage"
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
        }
      },
      sortButtonList: childSortButtonList,
      tableSearch: {
        requestApi: this.api.tiktok.childList,
        requestType: 'post',
        searchParmas: {},
        handleData: true,
      },
      columnInfo: (() => {
        return {
          controlHead: false,
          platformCode: this.platformCode,
          moduleCode: 'childPage',
        }
      })(),
      deliveryTypeList: deliveryTypeList
    };
  },
  computed: {
    power() {// 权限
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
    childTableHead() {
      let list = this.$common.copy(childTableHead);
      if (!this.selectionRows) list.splice(0, 1);
      return list;
    },
    goodsStatusLists() {
      let list = getSalesStatus(['1', '2', '3', '4', '5', '6', '8']);
      let statusObj = {};
      list.forEach(k => statusObj[k.value] = k);
      return statusObj;
    }
  },
  watch: {
    searchOptions: {
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
  created() {},
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
      let list = (data.list || []).map(k => {
        // 正常状态SKU和映射SKU处理统一格式
        let skuList = [];
        const goodsStatus = k.erpGoodsStatus;
        if ([6].includes(goodsStatus)) {
          k.productName = null;
          k.productGoodsTagName = null;
          // goodsStatus为6展示无状态SKU
          skuList.push({
            sku: null,
            erpGoodsStatus: goodsStatus,
          })
        } else if ([7].includes(goodsStatus)) {
          // goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
          let erpSkuMappingVO = k.erpSkuMappingVO || [];
          let blindBox = false;//是否盲盒
          erpSkuMappingVO.forEach(vo => {
            if (blindBox) return;
            // 映射类型，0：组合产品，1：随机发一个SKU产品
            blindBox = vo.skuType == 1;
            // blindBox && (k.productName = vo.name);
            k.productName = vo.name || null;
            k.productGoodsTagName = vo.productGoodsTagName || null;
            const sku = blindBox ? k.erpSku : vo.erpSku;
            skuList.push({
              sku: sku,
              quantity: blindBox ? null : vo.quantity,
              erpGoodsStatus: blindBox ? 8 : vo.erpGoodsStatus,
            })
          })
        } else {
          // goodsStatus为0-5展示erpSku 或者不在其中状态的也展示最基础的
          skuList.push({
            sku: k.erpSku,
            erpGoodsStatus: goodsStatus,
          })
        }
        k.skuList = skuList;
        return k;
      });
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
      temp.axiosApi = this.api.tiktok.queryLinkLog;
      temp.axiosType = 'post';
      temp.paramsArr = ['linkId'];
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
    // 忽略初始化
    commandIgnorelimit(e) {
      this.commandChange(e, 'ignorelimit');
    },
    // 库存管理
    inventoryOpen(row) {
      this.replenishment.data = this.$common.copy(row);
      this.replenishment.visible = true;
    },
    // 下拉框操作
    commandChange(e, type, objType = 'operationUpdate') {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        len = this.multipleSelection.length;
        data.linkDetailIdList = this.multipleSelection.map(k => k.linkDetailId);
      } else {
        len = this.total;
        data.tiktokStoreLinkQO = this.$common.removeEmpty(this.searchOptions);
      }
      this[objType].len = len;
      this[objType].type = type;
      this[objType].data = data;
      this[objType].visible = true;
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
      this.commonReturn('batchOperation', this.api.tiktok.updateBatchLinksInfo, temp);
    },
    /*
      componentName: 组件名;
      operateApi：请求api;
      temp：请求数据;
    */
    commonReturn (componentName, operateApi, temp) {
      this.$refs[componentName].loading = true;
      this.$http.post(operateApi, temp).then(() => {
        this.$message.success("操作成功~");
        this.$refs[componentName].dialogVisible = false;
        this.refreshAll();
      }).finally(() => {
        this.$refs[componentName].loading = false;
      })
    }
  }
};
</script>
<style lang="less" scoped>
.childPage {
  .carIcon {
    font-size: 26px;
  }

  .highCheck {
    color: #009BED;
  }
}
</style>