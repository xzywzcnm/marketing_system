<template>
  <div class="page-main ottoChildPage">
    <dyt-table ref="ottoChildTable" :column-info="columnInfo" :table-head="childTableHead" :table-search="tableSearch"
      :sort-button-list="sortButtonList" v-bind="$attrs" @selection-change="handleSelectionChange"
      @getAllData="getAllData">
      <div slot="operatorLeft">
        <dyt-dropdown v-for="(item, index) in operationList" :key="index" :dropdown-list="commonList(item)" class="mr10"
          @commandChange="item.commandChange" />

        <el-button type="primary" v-if="power.matchProduct" @click="uploadExcel">匹配商品</el-button>
        <el-button type="primary" v-if="power.changeStatus" @click="statusOpen"
          :disabled="!!!multipleSelection.length">更改链接状态</el-button>
      </div>

      <template slot="log" slot-scope="{ row }">
        <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
      </template>
      <template slot="inventoryManage" slot-scope="{ row }">
        <span v-if="power.inventoryManage" class="lapa icon-chilun listIcon" :class="{
          blueIcon: row.autoReplenishment > 0 || row.syncInventoryStatus == 1,
        }" @click="inventoryOpen(row)" />
      </template>
      <template slot="priceManage" slot-scope="{ row }">
        <span v-if="power.priceManage" class="lapa icon-xiugaijiage listIcon" @click="priceOpen(row)" />
      </template>
      <template slot="storeInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.accountCode || "-" }}</div>
          <div class="clipContent flex-jcCenter">
            <div class="clipText">{{ row.platformSku }}</div>
            <i class="el-icon-copy-document clipIcon" v-if="row.platformSku"
              @click="$common.copyActiveCode($event, row.platformSku)" />
            <span v-else>-</span>
          </div>
          <div>{{ row.brandName || "-" }}</div>
        </div>
      </template>
      <template slot="productInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div class="clipContent flex-jcCenter" v-for="(item, index) in row.skuList" :key="index + 'erpSku'">
            <div class="clipText">
              <span>{{ item.sku }}</span>
              <span v-if="item.quantity">*{{ item.quantity }}</span>
            </div>
            <i class="el-icon-copy-document clipIcon" v-if="item.sku" @click="$common.copyActiveCode($event, item.sku)" />
          </div>

          <div class="clipContent flex-jcCenter">
            <div class="clipText highCursor" @click="matchSku(row)">
              {{ row.erpProductCnName }}
            </div>
            <i class="el-icon-copy-document clipIcon" v-if="row.erpProductCnName"
              @click="$common.copyActiveCode($event, row.erpProductCnName)" />
            <span class="clipIcon" v-else @click="matchSku(row)">-</span>
          </div>

          <div>
            <span v-for="(item, index) in row.skuList" :key="index + 'tag'" class="mr4">
              <el-tag :type="[0, '0'].includes(item.erpGoodsStatus) ? 'danger' : 'success'
                " size="mini" class="mb4" v-if="goodsStatusArr[item.erpGoodsStatus]">
                {{ goodsStatusArr[item.erpGoodsStatus].label }}
              </el-tag>
            </span>
          </div>
        </div>
      </template>
      <template slot="picture" slot-scope="{ row }">
        <preview-image :url="row.pictureUrl" :file-list="[row.pictureViewUrl]" />
      </template>
      <template slot="titleCategory" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.title || "-" }}</div>
          <div class="highLine">
            {{ row.platformCategory || "-" }}
          </div>
        </div>
      </template>
      <template slot="labelNameList" slot-scope="{ row }">
        <div v-if="row.labelNameList && row.labelNameList.length" class="tagList">
          <el-tag v-for="(item, key) in row.labelNameList" :key="key" class="label-tags">{{ item }}</el-tag>
        </div>
      </template>
      <template slot="warehouseList" slot-scope="{ row }">
        <div v-for="(item, index) in row.warehouseList" :key="index">
          <div class="mb6" v-if="allWarehouseList[item]">
            {{ allWarehouseList[item].warehouseName }}
          </div>
          <div v-else>{{ item }}</div>
        </div>
      </template>
      <!-- <template slot="handleTime" slot-scope="{ row }">
        <span>{{ row.deliveryTime || "" }} days</span>
      </template> -->
      <template slot="inventory" slot-scope="{ row }">
        <div class="highCursor" style="text-decoration: underline" @click="inventoryInfomationDetail(row)">
          {{ row.inventoryQuantity }}
        </div>
      </template>
      <template slot="prices" slot-scope="{ row }">
        <span>{{ row.amount || 0 }} {{ row.amountCurrency || "" }}</span>
      </template>
      <template slot="fatoryPrices" slot-scope="{ row }">
        <span>{{ row.factoryAmount || 0 }}
          {{ row.factoryAmountCurrency || "" }}</span>
      </template>
      <template slot="activityPrices" slot-scope="{ row }">
        <div v-if="$common.isEmpty(row.salePriceAmount)">-</div>
        <span v-else>
          {{ row.salePriceAmount || 0 }}
          {{ row.salePriceCurrency || "" }}
        </span>
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
    <!-- 库存管理 -->
    <replenishmenTable :model-visible.sync="replenishment.visible" :data="replenishment.data" @search="refreshAll" />
    <!-- 修改价格 -->
    <modifyPrice ref="modifyPrice" :model-visible.sync="modifyPriceInfo.visible" :data="modifyPriceInfo"
      @modifyPriceReturn="modifyPriceReturn" />
    <!-- 商品库存信息 -->
    <inventoryInformation :model-visible.sync="infomation.visible" :data="infomation.data"
      :platform-code="infomation.platformCode" />
    <!-- 标签管理 -->
    <labelManage :model-visible.sync="labelInfo.visible" :data="labelInfo.data" v-bind="$attrs" @search="refreshAll" />
    <!-- 匹配商品 -->
    <matchProduct :model-visible.sync="matchProductInfo.visible" :data="matchProductInfo.data" @search="refreshAll" />
    <!-- 上传文件 -->
    <uploadExcel :model-visible.sync="uploadInfo.visible" :title="uploadInfo.title" @downloadTemplate="downloadTemplate"
      @handleUpload="handleUpload" />
    <!-- 价格管理 -->
    <priceManage :model-visible.sync="priceManage.visible" :data="priceManage.data" @search="refreshAll" />
    <!-- 设置仓库 -->
    <setWarehouse :model-visible.sync="warehouseInfo.visible" :len="warehouseInfo.len"
      @returnWarehouse="returnWarehouse" />
    <!-- 库存助手 -->
    <iventoryAssistant :model-visible.sync="iventoryInfo.visible" :len="iventoryInfo.len" :data="iventoryInfo.data"
      @returnIventory="returnIventory" />
    <!-- 链接状态变更 -->
    <changeStatus :model-visible.sync="statusInfo.visible" :len="statusInfo.len" :data="statusInfo.data"
      @search="refreshAll" />
    <!-- 修改运输组 -->
    <changeShippingGroup :model-visible.sync="shippingGroupInfo.visible" :len="shippingGroupInfo.len"
      :data="shippingGroupInfo.data" :commonStoreId="shippingGroupInfo.commonStoreId" @search="refreshAll" />
  </div>
</template>

<script>
import previewImage from "@/components/previewImage";
import commonLog from "@/views/components/commonLog";
import batchOperation from "@/views/components/batchOperation";
import replenishmenTable from "./replenishmenTable";
import dropdownComfun from "@/views/components/dropdownComfun";
import { processFloatPoint } from "@/utils/staticDataOrigin";
import { saleList, childSortButtonList, childTableHead } from "./fileData.js";
import inventoryInformation from "@/views/components/inventoryInformation";
import labelManage from "@/views/platformOnline/pages/otto/labelManage";
import matchProduct from "./matchProduct";
import uploadExcel from "@/views/components/uploadExcel";
import modifyPrice from "./modifyPrice";
import priceManage from "./priceManage";
import setWarehouse from "./setWarehouse";
import iventoryAssistant from "./iventoryAssistant";
import changeStatus from "./changeStatus";
import { goodsStatusArr } from "./fileData.js";
import changeShippingGroup from "./changeShippingGroup";

export default {
  name: "OttoChild",
  components: {
    previewImage,
    commonLog,
    batchOperation,
    replenishmenTable,
    modifyPrice,
    inventoryInformation,
    labelManage,
    matchProduct,
    uploadExcel,
    priceManage,
    setWarehouse,
    iventoryAssistant,
    changeStatus,
    changeShippingGroup,
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
        requestApi: this.api.otto.childList,
        requestType: "post",
        searchParmas: {},
        handleData: true,
      },
      goodsStatusArr: goodsStatusArr(),
      columnInfo: {
        controlHead: true,
        platformCode: "otto",
        moduleCode: "ottoChild",
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
        //修改库存/自动补货/处理时间
        visible: false,
        len: 0,
        type: null, //类型
        data: {},
      },
      replenishment: {
        //库存管理
        visible: false,
        data: null,
      },
      powerList: {
        updateInventory: "productOnline_otto_childUpdateInventory",
        autoReplenishment: "productOnline_otto_childAutoreplenishment",
        // deliveryTime: "productOnline_otto_childProcessingTime",
        inventoryManage: "productOnline_otto_childInventoryManage",
        modifyPrice: "productOnline_otto_childModifyPrice",
        labelManage: "productOnline_otto_childLabelManage",
        export: "productOnline_otto_childExport",
        priceManage: "productOnline_otto_childPriceManage",
        setWarehouse: "productOnline_otto_childSetWarehouse",
        matchProduct: "productOnline_otto_childMatchProduct",
        inventoryAssistant: "productOnline_otto_childInventoryAssistant",
        changeStatus: "productOnline_otto_childChangeStatus",
        shippingGroup: "productOnline_otto_mainShippingGroup",
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
        replenish: {
          label: "设置自动补货",
          power: "autoReplenishment",
          commandChange: this.replenishCommand,
        },
        // deliveryTime: {
        //   label: "修改处理时间",
        //   power: "deliveryTime",
        //   commandChange: this.deliveryTimeCommand,
        // },
        shippingGroup: {
          label: "修改运输组",
          power: "shippingGroup",
          commandChange: this.shippingGroupCommand,
        },
        labelManage: {
          label: "标签管理",
          power: "labelManage",
          commandChange: this.labelManageCommand,
        },
        export: {
          label: "导出",
          power: "export",
          commandChange: this.exportCommand,
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
      },
      modifyPriceInfo: {
        visible: false,
        len: 0,
        data: {},
      },
      infomation: {
        platformCode: "otto",
        data: {},
        visible: false,
      }, //商品库存信息
      labelInfo: {
        data: {},
        visible: false,
      },
      matchProductInfo: {
        data: {},
        visible: false,
      },
      uploadInfo: {
        title: "导入商品关联",
        visible: false,
      },
      priceManage: {
        visible: false,
        data: {},
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
      statusInfo: {
        visible: false,
        len: 0,
        data: {},
      },
      shippingGroupInfo: {
        visible: false,
        len: 0,
        data: {},
        commonStoreId: null,
      },
      allWarehouseList: {},
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
        if (["priceManage", "inventoryManage"].includes(k)) return; //跳过库存管理
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
          sortField: "osl.gmt_updated",
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
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
        this.allWarehouseList = this.$common.arrayToObj(list || [], "id");
      });
    },
    search() {
      this.$refs["ottoChildTable"].search();
    },
    getList() {
      this.$refs["ottoChildTable"].getList();
    },
    // 返回列表页数据
    getAllData(data) {
      this.total = data.total;
      let list = data.list.map((k) => {
        let arr = ["amount", "factoryAmount", "salePriceAmount"];
        arr.forEach((name) => {
          k[name] = k[name] ? Number(Number(k[name]).toFixed(2)) : k[name];
        });

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

        // 图片处理
        let picUrl = k.platformPictureUrl;
        k.pictureUrl = picUrl || this.$common.urlMontage(k.erpPictureUrl);
        k.pictureViewUrl =
          picUrl || this.$common.urlMontage(k.erpPictureUrl, false);
        // 仓库处理
        k.warehouseList = k.warehouseIds ? k.warehouseIds.split(",") : [];
        k.skuList = this.handleMappingSku(k); //sku处理
        return k;
      });
      data.returnData(list);
    },
    // 处理映射sku关系
    handleMappingSku(k) {
      // 正常状态SKU和映射SKU处理统一格式
      let skuList = [];
      const goodsStatus = k.productStatus;
      if ([6].includes(goodsStatus)) {
        // goodsStatus为6展示无状态SKU
        skuList.push({
          sku: null,
          erpGoodsStatus: null,
        });
      } else if ([7].includes(goodsStatus)) {
        // goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
        let erpSkuMappingVO = k.erpSkuMappingVOS || [];
        let blindBox = false; //是否盲盒
        erpSkuMappingVO.forEach((vo) => {
          if (blindBox) return;
          // 映射类型，0：组合产品，1：随机发一个SKU产品
          blindBox = vo.skuType == 1;
          const sku = blindBox ? k.erpSku : vo.erpSku;
          skuList.push({
            sku: sku,
            quantity: blindBox ? null : vo.quantity,
            erpGoodsStatus: blindBox ? 8 : vo.erpGoodsStatus,
          });
          // 如是映射SKU则展示映射商品名称
          !blindBox && (k.erpProductCnName = vo.name);
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
      temp.axiosApi = this.api.otto.storeLinkLogList;
      temp.axiosType = "post";
      temp.paramsArr = ["pageNum", "pageSize", "linkId"];
      temp.axiosOptions = { linkId: row.linkId };
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
    // // 修改处理时间
    // deliveryTimeCommand(e) {
    //   this.commandChange(e, "deliveryTime");
    // },
    // 修改运输组
    shippingGroupCommand(e) {
      this.isSameStore(e, "", "shippingGroupInfo");
    },
    // 导出
    exportCommand(e) {
      if (
        ![1, 2].includes(e) ||
        (!this.$common.isEmpty(this.operationList["export"]) &&
          this.operationList["export"].loading)
      )
        return;
      this.$set(this.operationList["export"], "loading", true);
      const paramObj = {
        1: {
          linkDetailIdList: this.multipleSelection.map((k) => k.linkDetailId),
        },
        2: {
          ottoLinkQO: this.searchOptions,
        },
      };
      this.$http
        .post(this.api.otto.childExport, paramObj[e])
        .then((res) => {
          this.$message.success("请在导出查看下载查看导出文件");
          this.$bus.emit("marketing-admin-headDownloadView");
        })
        .finally(() => {
          this.$set(this.operationList["export"], "loading", false);
        });
    },
    // 修改价格
    modifyPriceCommand(e) {
      this.commandChange(e, "", "modifyPriceInfo");
    },
    // 设置仓库
    setWarehouseCommand(e) {
      this.commandChange(e, "", "warehouseInfo");
    },
    // 设置库存助手
    inventoryAssistantCommand(e) {
      this.commandChange(e, "", "iventoryInfo");
    },
    isSameStore(e, type, infoType) {
      if (![1, 2].includes(e)) return;
      if (e == 1) {
        let storeList = this.multipleSelection.map((k) => k.commonStoreId);
        storeList = Array.from(new Set(storeList));
        // 只允许同店铺的SKU修改，跨店铺提示"批量修改运输组只允许同时操作同一店铺链接"；
        if (storeList.length > 1) {
          this.$message.warning("批量修改运输组只允许同时操作同一店铺链接");
          return;
        }
      }
      this.commandChange(e, type, infoType);
    },
    // 库存管理
    inventoryOpen(row) {
      this.replenishment.data = this.$common.copy(row);
      this.replenishment.visible = true;
    },
    // 价格管理
    priceOpen(row) {
      this.priceManage.data = this.$common.copy(row);
      this.priceManage.visible = true;
    },
    // 标签管理
    labelManageCommand(e) {
      this.commandChange(e, "", "labelInfo");
    },
    // 库存管理
    statusOpen() {
      this.commandChange(1, "", "statusInfo");
    },
    // 修改库存/自动补货/防超卖
    async commandChange(e, type, objData = "batchOperation") {
      if (![1, 2].includes(e)) return;
      let [len, data, multipleSelection] = [0, {}, this.multipleSelection];
      if (e == 1) {
        len = multipleSelection.length;
        data.linkDetailIdList = multipleSelection.map((k) => k.linkDetailId);
      } else {
        len = this.total;
        data.ottoLinkQO = this.$common.removeEmpty(this.searchOptions);
      }
      if (["modifyPriceInfo"].includes(objData)) {
        this[objData].priceVerify = !(e == 1);
      }
      if (["shippingGroupInfo"].includes(objData)) {
        let commonStoreId = null;
        if (e == 1) {
          commonStoreId = multipleSelection[0].commonStoreId;
        }
        if (e == 2) {
          let storeList = await this.returnStoreIDList(data);
          // ③只允许同店铺的SKU修改，跨店铺提示"批量修改运输组只允许同时操作同一店铺链接"；
          if (storeList.length > 1) {
            this.$message.warning("批量修改运输组只允许同时操作同一店铺链接");
            return;
          }
          commonStoreId = storeList[0];
        }
        this.shippingGroupInfo.commonStoreId = commonStoreId;
      }
      this[objData].len = len;
      type && (this[objData].type = type);
      this[objData].data = data;
      this[objData].visible = true;
    },
    // 计算修改链接的店铺数量
    returnStoreIDList(data) {
      return new Promise(resolve => {
        this.$http.post(this.api.otto.countUpdateLinksStoreNum, data).then(({ data }) => {
          resolve(data || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 更新主子链接列表
    refreshAll() {
      this.$emit("refreshAll", "keepPageSearch");
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
      // if (type === "deliveryTime") {
      //   temp.newDeliveryTime = data.deliveryTime;
      // }
      this.commonReturn(
        "batchOperation",
        this.api.otto.batchUpdateSyncInventoryInfos,
        temp
      );
    },
    // 修改价格返回
    modifyPriceReturn(data) {
      let temp = {
        ...this.modifyPriceInfo.data,
        updatePrice: data.updatePrice,
        updateType: data.type,
        updateReference: data.updateReference,
        updateSymbol: data.editType,
        updateValue: data.editNum,
      };
      if (
        [2].includes(data.updatePrice) &&
        data.handleTime &&
        data.handleTime.length
      ) {
        temp.newSalePriceStartDate = data.handleTime[0];
        temp.newSalePriceEndDate = data.handleTime[1];
      }
      // console.log(data, temp);
      this.commonReturn("modifyPrice", this.api.otto.batchUpdatePrices, temp);
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
    // 商品库存信息
    inventoryInfomationDetail(row) {
      this.infomation.data = row;
      this.infomation.visible = true;
    },
    // 匹配SKU
    matchSku(row) {
      this.matchProductInfo.data = row;
      this.matchProductInfo.visible = true;
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
        .post(this.api.otto.batchUpdateSyncInventoryInfos, temp)
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
        .post(this.api.otto.batchUpdateSyncInventoryInfos, temp)
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
        .post(this.api.otto.importProductLinkRel, returnData.data)
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
      cb(this.api.common.getTemplate, 'get', { params: { type: 0 } })
    },
  },
};
</script>
<style lang="less">
.ottoChildPage {
  .tagList {
    margin-right: -4px;
    text-align: left;
  }

  .label-tags {
    background-color: #ecf8e2;
    border-color: #c0c4cc;
    color: #515a6e;
    height: auto;
    margin-right: 4px;
    white-space: inherit;

    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }
}
</style>