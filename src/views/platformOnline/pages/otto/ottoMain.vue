<template>
  <div class="page-main ottoMainPage">
    <dyt-table ref="ottoMainTable" :column-info="columnInfo" :table-head="mainTableHead" :table-search="tableSearch"
      :sort-button-list="sortButtonList" v-bind="$attrs" @selection-change="handleSelectionChange"
      @getAllData="getAllData">
      <div slot="operatorLeft">
        <dyt-dropdown v-for="(item, index) in operationList" :key="index" class="mr10" :dropdown-list="commonList(item)"
          @commandChange="item.commandChange" />
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
            <div class="clipText">{{ row.platformSpu }}</div>
            <i class="el-icon-copy-document clipIcon" v-if="row.platformSpu"
              @click="$common.copyActiveCode($event, row.platformSpu)" />
            <span v-else>-</span>
          </div>
          <div>{{ row.brandName || "-" }}</div>
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
      <template slot="warehouseList" slot-scope="{ row }">
        <div v-for="(item, index) in row.warehouseList" :key="index">
          <div class="mb6" v-if="allWarehouseList[item]">
            {{ allWarehouseList[item].warehouseName }}
          </div>
          <div v-else>{{ item }}</div>
        </div>
      </template>
      <template slot="profileNameList" slot-scope="{ row }">
        <div v-for="(item, index) in row.profileNameList" :key="index" :class="index === 0 ? '' : 'mt10'">{{ item }}</div>
      </template>
      <!-- <template slot="handleTime" slot-scope="{ row }">
        <numInterval :options="{
          minNumber: row.minDeliveryTime,
          maxNumber: row.maxDeliveryTime,
          hideError: true,
        }">
          <span class="ml2">days</span>
        </numInterval>
      </template> -->
      <template slot="prices" slot-scope="{ row }">
        <numInterval :options="{
          minNumber: row.minAmount,
          maxNumber: row.maxAmount,
          hideError: true,
        }">
          <span class="ml2">{{ row.amountCurrency || "" }}</span>
        </numInterval>
      </template>
      <template slot="fatoryPrices" slot-scope="{ row }">
        <numInterval :options="{
          minNumber: row.minFactoryAmount,
          maxNumber: row.maxFactoryAmount,
          hideError: true,
        }">
          <span class="ml2">{{ row.factoryAmountCurrency || "" }}</span>
        </numInterval>
      </template>
      <template slot="activityPrices" slot-scope="{ row }">
        <div v-if="$common.isEmpty(row.minSalePriceAmount) &&
          $common.isEmpty(row.maxSalePriceAmount)
          ">
          -
        </div>
        <numInterval :options="{
          minNumber: row.minSalePriceAmount,
          maxNumber: row.maxSalePriceAmount,
          hideError: true,
        }" v-else>
          <span class="ml2">{{ row.salePriceCurrency || "" }}</span>
        </numInterval>
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
    <!-- 价格管理 -->
    <priceManage :model-visible.sync="priceManage.visible" :data="priceManage.data" @search="refreshAll" />
    <!-- 修改运输组 -->
    <changeShippingGroup :model-visible.sync="shippingGroupInfo.visible" :len="shippingGroupInfo.len"
      :data="shippingGroupInfo.data" :commonStoreId="shippingGroupInfo.commonStoreId" @search="refreshAll" />
  </div>
</template>

<script>
import previewImage from "@/components/previewImage";
import commonLog from "@/views/components/commonLog";
import numInterval from "@/views/components/numInterval";
import batchOperation from "@/views/components/batchOperation";
import replenishmenTable from "./replenishmenTable";
import dropdownComfun from "@/views/components/dropdownComfun";
import { saleList, mainSortButtonList, mainTableHead } from "./fileData.js";
import { processFloatPoint } from "@/utils/staticDataOrigin";
import modifyPrice from "./modifyPrice";
import priceManage from "./priceManage";
import changeShippingGroup from "./changeShippingGroup";

export default {
  name: "OttoMain",
  components: {
    previewImage,
    commonLog,
    batchOperation,
    replenishmenTable,
    numInterval,
    modifyPrice,
    priceManage,
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
      sortButtonList: mainSortButtonList,
      exportLoading: false,
      tableSearch: {
        requestApi: this.api.otto.list,
        requestType: "post",
        searchParmas: {},
        handleData: true,
      },
      saleList: saleList, //状态列表
      multipleSelection: [], //表格选中列表
      columnInfo: {
        controlHead: true,
        platformCode: "otto",
        moduleCode: "ottoMain",
      },
      total: 0,
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
        updateInventory: "productOnline_otto_mainUpdateInventory",
        autoReplenishment: "productOnline_otto_mainAutoreplenishment",
        // deliveryTime: "productOnline_otto_mainProcessingTime",
        inventoryManage: "productOnline_otto_mainInventoryManage",
        modifyPrice: "productOnline_otto_mainModifyPrice",
        export: "productOnline_otto_mainExport",
        priceManage: "productOnline_otto_mainPriceManage",
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
        export: {
          label: "导出",
          power: "export",
          commandChange: this.exportCommand,
        },
      },
      modifyPriceInfo: {
        visible: false,
        len: 0,
        data: {},
      },
      priceManage: {
        visible: false,
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
    power() {
      // 权限
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
      this.$refs["ottoMainTable"].search();
    },
    getList() {
      this.$refs["ottoMainTable"].getList();
    },
    // 返回列表页数据
    getAllData(data) {
      this.total = data.total;
      let list = data.list.map((k) => {
        // 价格区间(降序排列)
        let amountList = k.amountList || [];
        k.minAmount = amountList[amountList.length - 1] || 0;
        k.maxAmount = amountList[0] || 0;
        // 工厂建议价区间(降序排列)
        let factoryAmountList = k.factoryAmountList || [];
        k.minFactoryAmount = factoryAmountList[factoryAmountList.length - 1] || 0;
        k.maxFactoryAmount = factoryAmountList[0] || 0;
        // // 处理时间区间(降序排列)
        // let deliveryTimeList = k.deliveryTimeList || [];
        // k.minDeliveryTime = deliveryTimeList[deliveryTimeList.length - 1] || "";
        // k.maxDeliveryTime = deliveryTimeList[0] || "";
        // 预估毛利信息、退款率情况
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
        // 运输组去重
        let profileNameList = [];
        if (!this.$common.isEmpty(k.platformShippingProfileName)) {
          profileNameList = Array.from(new Set(k.platformShippingProfileName.split(',')));
        }
        k.profileNameList = profileNameList;
        return k;
      });
      data.returnData(list);
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
      if (![1, 2].includes(e)) return;
      if (e == 1) {
        let storeList = this.multipleSelection.map((k) => k.commonStoreId);
        storeList = Array.from(new Set(storeList));
        // ③只允许同店铺的SKU修改，跨店铺提示"批量修改运输组只允许同时操作同一店铺链接"；
        if (storeList.length > 1) {
          this.$message.warning("批量修改运输组只允许同时操作同一店铺链接");
          return;
        }
      }
      this.commandChange(e, "shippingGroup", "shippingGroupInfo");
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
          linkIdList: this.multipleSelection.map((k) => k.linkId),
        },
        2: {
          ottoLinkQO: this.searchOptions,
        },
      };
      this.$http
        .post(this.api.otto.mainExport, paramObj[e])
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
      this.commandChange(e, "modifyPrice", "modifyPriceInfo");
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
    // 修改库存/自动补货/防超卖
    async commandChange(e, type, objData = "batchOperation") {
      if (![1, 2].includes(e)) return;
      let [len, data, linkData] = [0, {}, {}];
      if (e == 1) {
        data.linkIdList = this.multipleSelection.map((k) => k.linkId);
        linkData.linkIdList = data.linkIdList;
      } else {
        data.ottoLinkQO = this.$common.removeEmpty(this.searchOptions);
        linkData = data.ottoLinkQO;
      }
      if (["modifyPriceInfo"].includes(objData)) {
        this[objData].priceVerify = !(e == 1);
      }
      if (["shippingGroupInfo"].includes(objData)) {
        let commonStoreId = null;
        if (e == 1) {
          commonStoreId = this.multipleSelection[0].commonStoreId;
        }
        if (e == 2) {
          let storeList = await this.returnStoreIDList(linkData);
          // 只允许同店铺的SKU修改，跨店铺提示"批量修改运输组只允许同时操作同一店铺链接"；
          if (storeList.length > 1) {
            this.$message.warning("批量修改运输组只允许同时操作同一店铺链接");
            return;
          }
          commonStoreId = storeList[0];
        }
        this.shippingGroupInfo.commonStoreId = commonStoreId;
      }

      this.operationList[type].loading = true;
      len = await this.getLinkLength(linkData);
      this.operationList[type].loading = false;

      this[objData].len = len;
      this[objData].type = type;
      this[objData].data = data;
      this[objData].visible = true;
    },
    // 计算修改链接的店铺数量
    returnStoreIDList(data) {
      return new Promise(resolve => {
        this.$http.post(this.api.otto.countUpdateLinksStoreNum, { ottoLinkQO: data }).then(({ data }) => {
          resolve(data || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取主链接下的子链接长度
    getLinkLength(data) {
      return new Promise((resolve) => {
        this.$http
          .post(this.api.otto.queryBeforeBatchUpdate, data)
          .then(({ data }) => {
            let num = data || 0;
            resolve(num);
          })
          .catch(() => {
            resolve(0);
          });
      });
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
      if (type === "deliveryTime") {
        temp.newDeliveryTime = data.deliveryTime;
      }
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
  },
};
</script>