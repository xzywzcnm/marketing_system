<template>
  <div class="page-main realChildPage">
    <dyt-table ref="realChildTable" :column-info="columnInfo" :table-head="childTableHead" :table-search="tableSearch"
      :sort-button-list="sortButtonList" v-bind="$attrs" @selection-change="handleSelectionChange"
      @getAllData="getAllData">
      <div slot="operatorLeft" class="displayFlex">
        <span v-for="(item, index) in operationList" :key="index">
          <dyt-dropdown :dropdown-list="commonList(item)" class="mr4" @commandChange="item.commandChange"
            v-if="'commandChange' in item" />
          <span v-if="'clickFun' in item && item.power">
            <el-button type="primary" @click="item.clickFun" class="mr4" :disabled="returnDisabled(item)">{{ item.label
            }}</el-button>
          </span>
        </span>
      </div>
      <template slot="log" slot-scope="{ row }">
        <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
      </template>
      <template slot="picture" slot-scope="{ row }">
        <preview-image :url="row.mainPictureUrl" :file-list="[row.mainPictureUrl]" />
      </template>
      <template slot="storeInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div title="店铺">{{ row.accountCode || "" }}</div>
          <div class="clipContent" style="justify-content:center;">
            <div class="highCursor clipText" @click="itemGo(row)">{{ row.platformSku }}</div>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.platformSku)" />
          </div>
          <div title="EAN">{{ row.ean || "" }}</div>
          <div title="品牌">{{ row.manufacturer || "" }}</div>
        </div>
      </template>
      <template slot="productInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div class="clipContent flex-jcCenter" v-for="(item, index) in row.skuList" :key="index + 'erpSku'">
            <div class="clipText">
              <span>{{ item.sku }}</span>
              <span v-if="item.quantity">*{{ item.quantity }}</span>
            </div>
          </div>
          <div class="clipContent flex-jcCenter">
            <div class="clipText highLine">{{ row.productName }}</div>
          </div>
          <div>
            <span v-for="(item, index) in row.statusList" :key="index + 'tag'" class="mr4">
              <el-tag :type="[0, '0'].includes(item) ? 'danger' : 'success'
                " size="mini" class="mb4" v-if="goodsStatusArr[item]">
                {{ goodsStatusArr[item].label }}
              </el-tag>
            </span>
            <span class="mr4" v-if="[1, '1'].includes(row.productTypeCode) && productTypeList[row.productTypeCode]">
              <el-tag type="warning" size="mini" class="mb4">{{ productTypeList[row.productTypeCode].label }}</el-tag>
            </span>
          </div>
        </div>
      </template>
      <template slot="titleCategory" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.title }}</div>
        </div>
      </template>
      <template slot="warehouseList" slot-scope="{ row }">
        <div v-for="(item, index) in row.erpWarehouseVOList" :key="index">
          <div class="mb6">{{ item.warehouseName }}</div>
        </div>
      </template>
      <template slot="fulfillmentType" slot-scope="{ row }">
        <div v-if="fulfillmentTypeList[row.fulfillmentType]">
          {{ fulfillmentTypeList[row.fulfillmentType].label }}
        </div>
      </template>
      <template slot="inventory" slot-scope="{ row }">
        <dyt-inputEdit :values="row.inventoryQuantity"
          :disabled="power.updateInventory && [0].includes(row.fulfillmentType)" :data="row" @emitValue="quantityChange"
          @textClick="inventoryInfomationDetail" />
        <el-tag v-if="row.syncInventoryStatus == 1" type="success">
          库存助手
        </el-tag>
        <div v-if="row.autoReplenishment > 0" class="mb10">
          <el-tag type="success" size="mini">
            自动补货 {{ row.autoReplenishment || 0 }}
          </el-tag>
        </div>
      </template>
      <template slot="logisticInfo" slot-scope="{ row }">
        <div class="mt4Content" style="text-align:left;">
          <div>
            <span class="fixWidth100">处理时间：</span>
            <span>{{ row.handlingTime || 0 }}天</span>
          </div>
          <div>
            <span class="fixWidth100">运输组：</span>
            <span>{{ row.name || '' }}</span>
          </div>
          <div>
            <span class="fixWidth100">总交货时间：</span>
            <span>{{ calDeliverTime(row) }}</span>
          </div>
          <div v-if="row.syncDeliveryInfoStatus == 1" style="text-align:center;">
            <el-tag type="success" size="mini" class="mb4">自动调整物流</el-tag>
          </div>
        </div>
      </template>
      <template slot="prices" slot-scope="{ row }">
        <span>{{ row.price || 0 }} {{ row.currency || "" }}</span>
      </template>
      <template slot="shelvedTime" slot-scope="{ row }">
        <span>{{ row.shelvedTime || "" }}</span>
      </template>
      <template slot="status" slot-scope="{ row }">
        <div v-if="saleList[row.status]" :style="saleList[row.status].style">
          {{ saleList[row.status].label }}
        </div>
      </template>
    </dyt-table>

    <!-- 日志 -->
    <common-log :model-visible.sync="logData.visible" :request-info="logData.data" />
    <!-- 修改库存/自动补货/防超卖 -->
    <batchOperation ref="batchOperation" :model-visible.sync="batchOperation.visible" :data="batchOperation"
      @batchOperatReturn="batchOperatReturn" />
    <!-- 商品库存信息 -->
    <inventoryInformation :model-visible.sync="infomation.visible" :data="infomation.data"
      :platform-code="infomation.platformCode" />
    <!-- 上传文件 -->
    <uploadExcel :model-visible.sync="uploadInfo.visible" :title="uploadInfo.title" @downloadTemplate="downloadTemplate"
      @handleUpload="handleUpload" />
    <!-- 设置仓库 -->
    <setWarehouse :model-visible.sync="warehouseInfo.visible" :len="warehouseInfo.len"
      @returnWarehouse="returnWarehouse" />
    <!-- 库存助手 -->
    <iventoryAssistant :model-visible.sync="iventoryInfo.visible" :len="iventoryInfo.len"
      @returnIventory="returnIventory" />
    <!-- 链接状态变更 -->
    <changeStatus :model-visible.sync="statusInfo.visible" :data="statusInfo.data" @search="getList" />
    <!-- 修改物流信息 -->
    <setLogisticsInformation :model-visible.sync="logisticsInfo.visible" :data="logisticsInfo.data"
      :len="logisticsInfo.len" @search="getList" />
    <!-- 设置自动调整物流 -->
    <setAdjustLogisticsInfo :model-visible.sync="adjustLogisticsInfo.visible" :data="adjustLogisticsInfo.data"
      :len="adjustLogisticsInfo.len" @search="getList" />
    <!-- 修改价格 -->
    <modifyPrice :model-visible.sync="priceInfo.visible" :len="priceInfo.len" :data="priceInfo.data"
      :priceVerify="priceInfo.priceVerify" @search="getList" />
  </div>
</template>

<script>
import Big from "big.js";
import regular from "@/utils/regular";
import previewImage from "@/components/previewImage";
import commonLog from "@/views/components/commonLog";
import batchOperation from "@/views/components/batchOperation";
import dropdownComfun from "@/views/components/dropdownComfun";
import inventoryInformation from "@/views/components/inventoryInformation";
import uploadExcel from "@/views/components/uploadExcel";
import setWarehouse from "./setWarehouse";
import iventoryAssistant from "./iventoryAssistant";
import changeStatus from "./changeStatus";
import setLogisticsInformation from "./setLogisticsInformation";
import setAdjustLogisticsInfo from "./setAdjustLogisticsInfo";
import modifyPrice from "./modifyPrice";
import {
  saleList,
  childSortButtonList,
  childTableHead,
  goodsStatusArr,
  fulfillmentTypeList,
  productTypeList
} from "./fileData.js";
import { processFloatPoint } from "@/utils/staticDataOrigin";

export default {
  name: "realcz",
  components: {
    previewImage,
    commonLog,
    batchOperation,
    inventoryInformation,
    uploadExcel,
    setWarehouse,
    iventoryAssistant,
    changeStatus,
    setLogisticsInformation,
    setAdjustLogisticsInfo,
    modifyPrice,
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
      sortButtonList: childSortButtonList,
      tableSearch: {
        requestApi: this.api.real.childList,
        requestType: "post",
        searchParmas: {},
        handleData: true,
      },
      goodsStatusArr: goodsStatusArr(),
      columnInfo: {
        controlHead: true,
        platformCode: "real",
        moduleCode: "real",
      },
      total: 0,
      saleList: saleList,
      multipleSelection: [], //表格选中列表
      logData: {
        //日志
        visible: false,
        data: {},
      },
      batchOperation: {
        //修改库存/自动补货
        visible: false,
        len: 0,
        type: null, //类型
        data: {},
      },
      statusInfo: {
        visible: false,
        data: [],
      },
      powerList: {
        updateInventory: "productOnline_real_updateInventory",
        autoReplenishment: "productOnline_real_autoreplenishment",
        setWarehouse: "productOnline_real_setWarehouse",
        matchProduct: "productOnline_real_matchProduct",
        inventoryAssistant: "productOnline_real_inventoryAssistant",
        export: "productOnline_real_export",
        changeStatus: "productOnline_real_changeStatus",
        setLogisticsInfo: "productOnline_real_setLogisticsInfo",
        autoAdjustLogistics: "productOnline_real_autoAdjustLogistics",
        modifyPrice: "productOnline_real_modifyPrice",
      },
      operationList: {
        modifyPrice: {
          label: "修改价格",
          power: "modifyPrice",
          commandChange: this.modifyPriceCommand,
        },
        inventory: {
          label: "修改库存",
          power: "updateInventory",
          commandChange: this.inventoryCommand,
        },
        setLogisticsInfo: {
          label: "修改物流信息",
          power: "setLogisticsInfo",
          commandChange: this.setLogisticsInfoCommand,
        },
        matchProduct: {
          label: "商品匹配",
          power: "matchProduct",
          clickFun: this.uploadExcel,
        },
        replenish: {
          label: "设置自动补货",
          power: "autoReplenishment",
          commandChange: this.replenishCommand,
        },
        setWarehouse: {
          label: "设置仓库",
          power: "setWarehouse",
          commandChange: this.setWarehouseCommand,
        },
        inventoryAssistant: {
          label: "设置库存助手",
          power: "inventoryAssistant",
          commandChange: this.inventoryAssistantCommand,
        },
        autoAdjustLogistics: {
          label: "设置自动调整物流",
          power: "autoAdjustLogistics",
          commandChange: this.autoAdjustLogisticsCommand,
        },
        changeStatus: {
          label: "更改链接状态",
          power: "changeStatus",
          clickFun: this.statusOpen,
        },
        export: {
          label: "导出",
          power: "export",
          commandChange: this.exportCommand,
        },
      },
      infomation: {
        platformCode: "real",
        data: {},
        visible: false,
      },
      uploadInfo: {
        visible: false,
        title: "导入商品关联",
      },
      warehouseInfo: {
        visible: false,
        len: 0,
        data: {},
      },
      iventoryInfo: {
        visible: false,
        len: 0,
        data: {},
      },
      logisticsInfo: {
        visible: false,
        len: 0,
        data: {},
      },
      adjustLogisticsInfo: {
        visible: false,
        len: 0,
        data: {},
      },
      priceInfo: {
        visible: false,
        len: 0,
        data: {},
        priceVerify: false,
      },
      allWarehouseList: {},
      fulfillmentTypeList: fulfillmentTypeList,
      productTypeList: productTypeList,
    };
  },
  computed: {
    // 权限
    power() {
      return this.$common.getPower(this.powerList);
    },
    selectionRows() {
      let falg = false;
      Object.keys(this.powerList).forEach((k) => {
        !falg && (falg = this.power[k]);
      });
      return falg;
    },
    childTableHead() {
      let list = this.$common.copy(childTableHead);
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
          sortField: "rsl.shelved_time",
          sortType: "DESC",
        };
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.getWarehouseList();
  },
  methods: {
    returnDisabled(item) {
      if (['更改链接状态'].includes(item.label)) {
        return !this.multipleSelection.length
      }
      return false;
    },
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
        this.allWarehouseList = this.$common.arrayToObj(list || [], "id");
      });
    },
    search() {
      this.$refs["realChildTable"].search();
    },
    getList() {
      this.$refs["realChildTable"].getList();
    },
    // 返回列表页数据
    getAllData(data) {
      this.total = data.total;
      let list = data.list.map((k) => {
        k.skuList = this.handleMappingSku(k); //sku处理
        k.statusList = Array.from(new Set(k.skuList.map(k => k.erpGoodsStatus)));
        let rateList = [
          "grossProfitRateTotalYesterday",
          "grossProfitRateTotalThreeDay",
          "grossProfitRateTotalSevenDay",
          "grossProfitRateTotalFifteenDay",
          "grossProfitRateTotalMonth",
          "refundFeeRateTotalMonth",
          "refundFeeRateTotalSixtyDay",
          "refundFeeRateTotaNinetyDay",
        ];
        rateList.forEach((ak) => {
          let num = processFloatPoint(k[ak] || 0, 2, 100);
          ak in k && (k[ak] = num + "%");
        });
        k.site = 'cz';
        return k;
      });
      data.returnData(list);
    },
    // 处理映射sku关系
    handleMappingSku(k) {
      // 正常状态SKU和映射SKU处理统一格式
      let skuList = [];
      const goodsStatus = k.goodsStatus;
      if ([6].includes(goodsStatus)) {
        // goodsStatus为6展示无状态SKU
        skuList.push({
          sku: null,
          erpGoodsStatus: null,
        });
      } else if ([7].includes(goodsStatus)) {
        // goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
        let erpSkuMappingVO = k.erpSkuMappingVOList || [];
        erpSkuMappingVO.forEach((vo) => {
          skuList.push({
            sku: vo.erpSku,
            quantity: vo.quantity,
            erpGoodsStatus: vo.erpGoodsStatus,
          });
        });
      } else {
        // goodsStatus为0-5展示erpSku 或者不在其中状态的也展示最基础的
        skuList.push({
          sku: k.erpSku,
          erpGoodsStatus: goodsStatus,
        });
      }
      return skuList;
    },
    // 公用下拉
    commonList(data) {
      return dropdownComfun.commonList(data, {
        powerList: this.power,
        multipleSelection: this.multipleSelection,
        total: this.total,
      });
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
    },
    // 查看日志
    logSee(row) {
      let [temp] = [{}];
      temp.axiosApi = this.api.real.storeLinkLogList;
      temp.axiosType = "get";
      temp.axiosOptions = { linkId: row.id };
      this.logData.data = this.$common.copy(temp);
      this.logData.visible = true;
    },
    // 修改库存
    inventoryCommand(e) {
      this.commandChange(e, "inventory");
    },
    // 自动补货
    replenishCommand(e) {
      this.commandChange(e, "replenish");
    },
    // 设置仓库
    setWarehouseCommand(e) {
      this.commandChange(e, "", "warehouseInfo");
    },
    // 设置库存助手
    inventoryAssistantCommand(e) {
      this.commandChange(e, "", "iventoryInfo");
    },
    // 修改物流信息
    setLogisticsInfoCommand(e) {
      this.commandChange(e, "", "logisticsInfo");
    },
    // 设置自动调整物流
    autoAdjustLogisticsCommand(e) {
      this.commandChange(e, "", "adjustLogisticsInfo");
    },
    // 库存管理
    statusOpen() {
      this.statusInfo.data = this.multipleSelection;
      this.statusInfo.visible = true;
    },
    modifyPriceCommand(e) {
      this.commandChange(e, "", "priceInfo");
    },
    // 修改库存/自动补货/防超卖
    async commandChange(e, type, objData = "batchOperation") {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        let eligibleList = this.multipleSelection;
        if (["logisticsInfo"].includes(objData)) {
          data.list = eligibleList;
        } else if (["adjustLogisticsInfo", "priceInfo"].includes(objData)) {
          data.linkIdList = eligibleList.map((k) => k.id);
        } else {
          // 过滤平台仓发货的链接
          eligibleList = eligibleList.filter(k => k.fulfillmentType === 0);
          data.linkIdList = eligibleList.map((k) => k.id);
        }
        len = eligibleList.length;
      } else {
        data.realStoreLinkQO = this.$common.removeEmpty(this.searchOptions);
        if (["logisticsInfo", "adjustLogisticsInfo", "priceInfo"].includes(objData)) {
          len = this.total;
        } else {
          len = await this.getLinkLength(data.realStoreLinkQO);
        }
      }
      if (!(len > 0)) {
        this.$message.warning('可以执行的链接条数为0!')
        return;
      }
      if (["priceInfo"].includes(objData)) {
        this[objData].priceVerify = !(e == 1);
      }
      type && (this[objData].type = type);
      this[objData].len = len;
      this[objData].data = data;
      this[objData].visible = true;
    },
    // 过滤平台仓发货的链接
    getLinkLength(data) {
      return new Promise(resolve => {
        this.$http.post(this.api.real.countUpdateLinks, data).then(({ data }) => {
          let num = data || 0;
          resolve(num);
        }).catch(() => {
          resolve(0);
        })
      })
    },
    // 操作返回
    batchOperatReturn(data) {
      let type = this.batchOperation.type;
      let temp = this.$common.copy(this.batchOperation.data);
      if (type === "inventory") {
        temp.newInventoryQuantity = data.inventoryQuantity;
      }
      if (type === "replenish") {
        temp.newAutoReplenishment = data.replenishType == 1 ? data.autoReplenishment : 0;
        delete data.replenishType;
      }
      this.commonReturn(
        "batchOperation",
        this.api.real.batchUpdateLinks,
        temp
      );
    },
    /*
      componentName: 组件名;
      operateApi：请求api;
      temp：请求数据;
    */
    commonReturn(componentName, operateApi, temp) {
      this.$refs[componentName].loading = true;
      this.$http
        .post(operateApi, temp)
        .then(() => {
          this.$message.success("操作成功~");
          this.$refs[componentName].dialogVisible = false;
          this.getList();
        })
        .finally(() => {
          this.$refs[componentName].loading = false;
        });
    },
    // 导入文件
    uploadExcel() {
      this.uploadInfo.visible = true;
    },
    // 设置仓库返回
    returnWarehouse(backData) {
      let temp = this.$common.copy(this.warehouseInfo.data);
      temp.newWarehouseIds = backData.data.join(",");
      this.$http
        .post(this.api.real.batchUpdateLinks, temp)
        .then(() => {
          this.$message.success("操作成功~");
          this.getList();
        })
        .finally(() => {
          backData.back();
        });
    },
    // 设置库存助手返回
    returnIventory(backData) {
      let temp = Object.assign({}, this.iventoryInfo.data, backData.data);
      this.$http
        .post(this.api.real.batchUpdateLinks, temp)
        .then(() => {
          this.$message.success("操作成功~");
          this.getList();
        })
        .finally(() => {
          backData.back();
        });
    },
    // 完成文件上传
    handleUpload(returnData) {
      this.$http
        .post(this.api.real.importProductLinkRel, returnData.data)
        .then(({ data }) => {
          this.$message.success("操作成功!");
          this.getList();
          returnData.fun({ valid: true });
        })
        .catch(() => {
          returnData.fun({ valid: false });
        });
    },
    downloadTemplate(cb) {
      cb(this.api.common.getTemplate, 'get', { params: { type: 1 } });
    },
    quantityChange({ propData, data, fun }) {
      let pNum = propData.inventoryQuantity || 0;
      let nNum = data.values || 0;
      if (!regular.integerZero.test(nNum)) {
        this.$message.error("请输入整数~");
        fun({ valid: false });
        return;
      }
      let subNum = new Big(nNum).minus(pNum) - 0;
      if (subNum === 0) {
        this.$message.warning("无改动~");
        fun({ valid: true });
        return;
      }
      let temp = {};
      temp.linkId = propData.id;
      temp.newInventoryQuantity = data.values - 0;
      this.$http
        .post(this.api.real.updateLinkInventory, [temp])
        .then(() => {
          fun({ valid: true });
          this.$message.success("操作成功~");
          this.tableData.forEach((k) => {
            if (k.id === propData.id) {
              k.inventoryQuantity = data.values - 0;
            }
          });
        })
        .catch(() => {
          fun({ valid: false });
        });
    },
    // 商品库存信息
    inventoryInfomationDetail(row) {
      this.infomation.data = row;
      this.infomation.visible = true;
    },
    itemGo(row) {
      row.url && window.open(row.url);
    },
    // 导出
    exportCommand(e) {
      if (![1, 2].includes(e) || (!this.$common.isEmpty(this.operationList["export"]) && this.operationList["export"].loading)) return;
      this.$set(this.operationList["export"], "loading", true);
      const paramObj = {
        1: {
          linkIdList: this.multipleSelection.map((k) => k.id),
        },
        2: {
          realStoreLinkQO: this.$common.removeEmpty(this.searchOptions),
        },
      };
      this.$http
        .post(this.api.real.export, paramObj[e])
        .then((res) => {
          this.$message.success("请在导出查看下载查看导出文件");
          this.$bus.emit("marketing-admin-headDownloadView");
        })
        .finally(() => {
          this.$set(this.operationList["export"], "loading", false);
        });
    },
    // 计算交货时间
    calDeliverTime(row = {}) {
      let deliveryTime = row.deliveryTime || 0;
      let transportTimeMin = row.transportTimeMin || 0;
      let transportTimeMax = row.transportTimeMax || 0;
      let min = new Big(transportTimeMin).plus(deliveryTime) - 0;
      let max = new Big(transportTimeMax).plus(deliveryTime) - 0;
      if (min === 0 && max === 0) {
        return '';
      }
      if (min === max) {
        return min + ' 工作日';
      }
      return min + '-' + max + ' 工作日';
    },
  },
};
</script>
<style lang="less">
.realChildPage {
  .fixWidth100 {
    display: inline-block;
    width: 72px;
    text-align: right;
  }

  .flexOne {
    flex: 1;
    overflow: hidden;
    text-align: left;
  }
}
</style>