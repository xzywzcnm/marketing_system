<template>
  <div class="page-main walmartChildPage">
    <dyt-table ref="dytTable" :column-info="columnInfo" :table-head="childTableHead" :table-search="tableSearch"
      :sort-button-list="sortButtonList" @selection-change="handleSelectionChange" @getAllData="getAllData"
      v-bind="$attrs">
      <div slot="operatorLeft">
        <dyt-dropdown v-for="(item, index) in operationList" :key="index" class="mr10" :dropdown-list="commonList(item)"
          @commandChange="item.commandChange" />
        <el-button type="primary" v-if="power.childOffShelfLink" @click="offshelfLink" :loading="offShelfLoading"
          :disabled="!!(!multipleSelection.length)">下架链接</el-button>
        <el-button type="primary" v-if="power.modifyPrice" @click="modifyPriceCommand(1)"
          :disabled="!!(!multipleSelection.length)">修改价格</el-button>
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
          <div class="mt4Content">
            <div v-if="saleList[row.status]" :style="saleList[row.status].style">
              {{ saleList[row.status].label }}
            </div>
            <div v-if="row.averageRating || row.reviewsCount">
              {{ row.averageRating || 0 }} / {{ row.reviewsCount || 0 }}
            </div>
          </div>
        </preview-image>
      </template>
      <template slot="storeInfo" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.accountCode || "-" }}</div>
          <div class="clipContent flex-jcCenter">
            <span class="clipText">{{ row.platformSku || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.platformSku)"
              v-if="row.platformSku" />
          </div>
          <div class="clipContent flex-jcCenter">
            <span class="highCursor clipText" @click="itemGo(row)">{{ row.itemId || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.itemId)"
              v-if="row.itemId" />
          </div>
          <div class="clipContent flex-jcCenter">
            <div class="clipText">{{ row.gtin || "-" }}</div>
            <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.gtin)" v-if="row.gtin" />
          </div>
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
          <span class="highLine">{{ row.productName || "-" }}</span>
          <div>
            <span v-for="(item, index) in row.statusList" :key="index + 'status'" class="mr4">
              <el-tag type="success" size="mini" class="mb4" v-if="goodsStatusArr[item]">
                {{ goodsStatusArr[item].label }}
              </el-tag>
            </span>
          </div>
        </div>
      </template>
      <template slot="titleCategory" slot-scope="{ row }">
        <div class="mt4Content">
          <div>{{ row.title || "-" }}</div>
          <div class="highLine">{{ row.platformCategory || "-" }}</div>
        </div>
      </template>
      <template slot="attrs" slot-scope="{ row }">
        <div v-if="row.variationSpecifics">
          <div v-for="(item, index) in row.variationSpecifics.split(';')" :key="index" class="mb6">
            {{ item }}
          </div>
        </div>
      </template>
      <template slot="prices" slot-scope="{ row }">
        <div class="mt4Content">
          <div style="padding-bottom:4px;">
            <el-tooltip effect="dark" :content="'当前购物车价格：' + String(row.buyBoxItemPrice || 0)" placement="top"
              :disabled="row.isSellerBuyBoxWinner == 1" :open-delay="500">
              <div class="lapa icon-huaban carIcon" :class="{ highCheck: row.isSellerBuyBoxWinner == 1 }" />
            </el-tooltip>
          </div>
          <div>{{ row.price || 0 }}</div>
          <div style="text-decoration:line-through;" v-if="row.comparisonPrice">{{ row.comparisonPrice }}</div>
          <div>{{ row.currency || "" }}</div>
        </div>
      </template>
      <template slot="fulfillmentType" slot-scope="{ row }">
        <div v-if="deliveryTypeList[row.fulfillmentType]">{{ deliveryTypeList[row.fulfillmentType].label }}</div>
      </template>
      <template slot="warehouse" slot-scope="{ row }">
        <div v-for="(item, index) in row.erpWarehouseVOList" :key="index" class="mb6">
          {{ item.warehouseName || '' }}
        </div>
      </template>
      <template slot="inventory" slot-scope="{ row }">
        <div v-if="deliveryTypeList[row.fulfillmentType]" class="highCursor" style="text-decoration:underline;"
          @click="inventoryInfomationDetail(row)">
          {{ row[deliveryTypeList[row.fulfillmentType].inventory] || 0 }}
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
    <!-- 自动补货/防超卖/忽略初始化 -->
    <batchOperation ref="batchOperation" :model-visible.sync="batchOperation.visible" :data="batchOperation"
      @batchOperatReturn="batchOperatReturn" />
    <!-- 库存管理 -->
    <replenishmenTable :model-visible.sync="replenishment.visible" :data="replenishment.data" @search="refreshAll" />
    <!-- 设置仓库 -->
    <wareSetting ref="wareSetting" :model-visible.sync="wareSetInfo.visible" :total="wareSetInfo.len"
      @wareSettingReturn="wareSettingReturn" />
    <!-- 修改库存 -->
    <modifyInventory ref="modifyInventory" :model-visible.sync="modifyInventoryInfo.visible"
      :total="modifyInventoryInfo.len" @modifyInventoryReturn="modifyInventoryReturn" />
    <!-- 商品库存信息 -->
    <inventoryInformation :model-visible.sync="infomation.visible" :data="infomation.data"
      :platform-code="infomation.platformCode" />
    <!-- 修改价格 -->
    <modifyPrice ref="modifyPrice" :model-visible.sync="modifyPriceInfo.visible" :data="modifyPriceInfo"
      @modifyPriceReturn="modifyPriceReturn" />
  </div>
</template>

<script>
import previewImage from "@/components/previewImage";
import commonLog from "@/views/components/commonLog";
import batchOperation from "@/views/components/batchOperation";
import replenishmenTable from "./replenishmenTable";
import { childSortButtonList, childTableHead } from './fileData.js';
import { saleList } from '../components/fileData.js';
import { getSalesStatus, processFloatPoint } from '@/utils/staticDataOrigin';
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import dropdownComfun from "@/views/components/dropdownComfun";
import { deliveryTypeList } from './fileData.js';
import wareSetting from "@/views/components/wareSetting";
import modifyInventory from "@/views/components/modifyInventory";
import inventoryInformation from "@/views/components/inventoryInformation";
import modifyPrice from "@/views/components/modifyPrice";
export default {
  name: "WalmartWalmartChild",
  components: { previewImage, commonLog, batchOperation, replenishmenTable, wareSetting, modifyInventory, inventoryInformation, modifyPrice },
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
      siteExsit: siteExsit,
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
        updateInventory: "productOnline_walmart_childUpdateInventory",
        autoReplenishment: "productOnline_walmart_childAutoReplenishment",
        preventOversale: "productOnline_walmart_childPreventOversale",
        inventoryManage: "productOnline_walmart_childInventoryManage",
        childOffShelfLink: "productOnline_walmart_childOffShelfLink",
        ignorelimit: "productOnline_walmart_childIgnorelimit",
        settingWarehouse: "productOnline_walmart_childSettingWarehouse",
        modifyPrice: "productOnline_walmart_childModifyPrice",
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
        settingWarehouse: {
          label: '设置仓库',
          power: 'settingWarehouse',
          commandChange: this.warehouseCommand,
        },
        // modifyPrice: {
        //   label: '修改价格',
        //   power: 'modifyPrice',
        //   commandChange: this.modifyPriceCommand,
        // },
      },
      sortButtonList: childSortButtonList,
      tableSearch: {
        requestApi: this.api.walmart.listSub,
        requestType: 'post',
        searchParmas: {},
        handleData: true,
      },
      columnInfo: {
        controlHead: true,
        platformCode: 'walmart',
        moduleCode: 'walmartChild',
      },
      offShelfLoading: false,
      deliveryTypeList: deliveryTypeList,
      wareSetInfo: {//仓库设置
        visible: false,
        data: {},
        len: 0,
      },
      allWarehouseList: [],
      modifyInventoryInfo: {//修改库存
        visible: false,
        data: {},
        len: 0,
      },
      infomation: {
        platformCode: "walmart",
        data: {},
        visible: false,
      },//商品库存信息
      modifyPriceInfo: {
        visible: false,
        len: 0,
        data: {},
      },//修改价格
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
    goodsStatusArr() {
      let list = getSalesStatus(['1', '2', '3', '4', '5', '6', '8']);
      let statusObj = {};
      list.forEach(k => statusObj[k.value] = k);
      return statusObj;
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
  created() {
    // 获取全部仓库列表
    this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
      this.allWarehouseList = list || [];
    });
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
      const allWarehouseList = this.allWarehouseList;
      let list = data.list.map(k => {
        let rateList = ['grossProfitRateTotalYesterday', 'grossProfitRateTotalThreeDay', 'grossProfitRateTotalSevenDay', 'grossProfitRateTotalFifteenDay', 'grossProfitRateTotalMonth', 'refundFeeRateTotalMonth', 'refundFeeRateTotalSixtyDay', 'refundFeeRateTotaNinetyDay'];
        rateList.forEach(ak => {
          let num = processFloatPoint(k[ak] || 0, 2, 100);
          (ak in k) && (k[ak] = num + '%');
        })
        const warehouseIdList = k.warehouseIds ? k.warehouseIds.split(',') : [];
        k.erpWarehouseVOList = warehouseIdList.map(k => Number(k)).map(k => {
          let item = { warehouseId: k, warehouseName: k };
          allWarehouseList.forEach(uk => {
            k === uk.id && (item = uk);
          })
          return item;
        })
        k.mainPictureUrlQuikly = this.$common.handleSmallPicture(k.mainPictureUrl);

        // 正常状态SKU和映射SKU处理统一格式
        let [skuList, goodsStatus, statusList] = [[], k.erpGoodsStatus, []];
        if ([6].includes(goodsStatus)) {// goodsStatus为6展示无状态SKU
          skuList.push({ sku: null });
          statusList.push(goodsStatus);
        } else if ([7].includes(goodsStatus)) {// goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
          let erpSkuMappingVO = k.erpSkuMappingVO || [];
          let blindBox = false;//是否盲盒
          erpSkuMappingVO.forEach(vo => {
            if (blindBox) return;
            blindBox = vo.skuType == 1;// 映射类型，0：组合产品，1：随机发一个SKU产品
            k.productName = vo.name;
            const sku = blindBox ? k.erpSku : vo.erpSku;
            skuList.push({
              sku: sku,
              quantity: blindBox ? null : vo.quantity,
            })
            statusList.push(blindBox ? 8 : vo.erpGoodsStatus);
          })
        } else { // goodsStatus为0-5展示erpSku 或者不在其中状态的也展示最基础的
          skuList.push({ sku: k.erpSku });
          statusList.push(goodsStatus);
        }
        k.skuList = skuList;
        k.statusList = Array.from(new Set(statusList));
        // console.log(k.statusList, k.goodsStatus, 11)
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
      this.commandChange(e, 'inventory', 'modifyInventoryInfo');
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
    // 修改价格
    modifyPriceCommand(e) {
      this.commandChange(e, 'modifyPrice', 'modifyPriceInfo');
    },
    // 库存管理
    inventoryOpen(row) {
      this.replenishment.data = this.$common.copy(row);
      this.replenishment.visible = true;
    },
    // 下拉框操作
    commandChange(e, type, objType = 'batchOperation') {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        len = this.multipleSelection.length;
        data.linkDetailIdList = this.multipleSelection.map(k => k.id);
      } else {
        len = this.total;
        data.walmartStoreLinkQO = this.$common.removeEmpty(this.searchOptions);
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
        ignorelimit() {
          return data;
        },
      }
      let handleData = fun[batchOperation.type]();
      let temp = Object.assign({}, handleData, batchOperation.data);
      // console.log(temp);
      this.commonReturn('batchOperation', this.api.walmart.updateBatchLinksInfo, temp);
    },
    // 下架链接
    offshelfLink() {
      let list = this.multipleSelection;
      this.$confirm(`您选择的 <span style="color:#F56C6C;font-size:16px;">${list.length}</span> 子链接将从平台上下架`, '下架链接', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        dangerouslyUseHTMLString: true,
      }).then(() => {
        let temp = list.map(k => {
          return {
            commonStoreId: k.commonStoreId,
            linkId: k.linkId,
            linkDetailId: k.id,
            itemId: k.itemId,
            platformSku: k.platformSku,
          }
        })
        // console.log(temp);
        this.offShelfLoading = true;
        this.$http.post(this.api.walmart.endItem, temp).then((res) => {
          this.$message.success("操作成功~");
          this.refreshAll();
        }).finally(() => {
          this.offShelfLoading = false;
        })
      }).catch(() => { });
    },
    // 仓库设置
    warehouseCommand(e) {
      this.commandChange(e, 'settingWarehouse', 'wareSetInfo');
    },
    // 仓库设置返回
    wareSettingReturn(data) {
      let temp = {
        ...this.wareSetInfo.data,
        newWarehouseIdList: data.warehouseIdList,
      }
      // console.log(temp);
      this.commonReturn('wareSetting', this.api.walmart.updateBatchLinksInfo, temp);
    },
    // 库存修改返回
    modifyInventoryReturn(data) {
      let temp = {
        ...this.modifyInventoryInfo.data,
        ...data
      }
      // console.log(temp);
      this.commonReturn('modifyInventory', this.api.walmart.updateBatchInventory, temp);
    },
    // 商品库存信息
    inventoryInfomationDetail(row) {
      this.infomation.data = row;
      this.infomation.visible = true;
    },
    // 修改价格返回
    modifyPriceReturn(data) {
      let temp = {
        ...this.modifyPriceInfo.data,
        newPriceValue: data.editNum,
        updatePriceType: data.type,
        updatePriceSymbol: data.editType,
      }
      // console.log(temp, 33);
      this.commonReturn('modifyPrice', this.api.walmart.updateBatchLinksPrice, temp);
    },
    /*
      componentName: 组件名;
      operateApi：请求api;
      temp：请求数据;
    */
    commonReturn(componentName, operateApi, temp) {
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
.walmartChildPage {
  .carIcon {
    font-size: 26px;
  }

  .highCheck {
    color: #009BED;
  }
}
</style>