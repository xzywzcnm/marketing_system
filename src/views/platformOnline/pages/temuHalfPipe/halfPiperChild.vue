<template>
  <div class="page-main">
    <dyt-table ref="temuHalfPipe" :column-info="columnInfo" :table-head="mainTableHead" :table-search="tableSearch"
      :sort-button-list="sortButtonList" v-bind="$attrs" @selection-change="handleSelectionChange"
      @getAllData="getAllData" :span-method="objectSpanMethod">
      <!-- 排序，按钮 -->
      <div slot="operatorLeft">
        <span v-for="(item, index) in operationList" :key="index">
          <dyt-dropdown :dropdown-list="commonList(item)" class="mr4" @commandChange="item.commandChange"
            v-if="'commandChange' in item" />
          <span v-if="'clickFun' in item && item.power">
            <el-button type="primary" @click="item.clickFun" class="mr4">{{ item.label }}</el-button>
          </span>
        </span>
      </div>
      <!-- 日志 -->
      <template slot="log" slot-scope="{ row }">
        <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
      </template>
      <!-- 图片 -->
      <template slot="picture" slot-scope="{ row }">
        <preview-image :url="row.pictureUrl">
          <div>{{ row.accountCode }}</div>
        </preview-image>
      </template>
      <!-- 平台商品信息 -->
      <template slot="goodsInfo" slot-scope="{ row }">
        <div class="mt4Content flexColumnCenter">
          <el-tooltip class="item" effect="dark" :content="row.productName" placement="top-start">
            <div class="text-ellipsis" style="width: 100%;">{{ row.productName }}</div>
          </el-tooltip>
          <div class="clipContent">
            <span class="clipText">平台SPU：{{ row.platformSpu || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" v-if="row.platformSpu"
              @click="$common.copyActiveCode($event, row.platformSpu)" />
          </div>
          <div class="clipContent">
            <span class="clipText">平台SKC：{{ row.platformSkc || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" v-if="row.platformSkc"
              @click="$common.copyActiveCode($event, row.platformSkc)" />
          </div>
          <div class="clipContent">
            <span class="clipText">平台SKC货号：{{ row.platformSkcItemNumber || "-" }}</span>
            <i class="el-icon-copy-document clipIcon" v-if="row.platformSkcItemNumber"
              @click="$common.copyActiveCode($event, row.platformSkcItemNumber)" />
          </div>
        </div>
      </template>
      <!-- sku -->
      <template slot="erpSku" slot-scope="{ row }">
        <div v-if="Array.isArray(row.skuMappingSkuList) && row.skuMappingSkuList.length">
          <div v-for="(item, index) in row.skuMappingSkuList" :key="index">{{ item }}</div>
        </div>
        <div v-else>{{ row.erpSku }}</div>
      </template>
      <!-- 申报价格 -->
      <template slot="declarePrice" slot-scope="{ row }">
        <dyt-inputEdit :values="row.applyPrice" :disabled="power.importPrice" :data="row" @emitValue="applyPriceChange"
          :key="row.linkDetailId" />
        <div>{{ row.currency }}</div>
      </template>
      <!-- 仓库 -->
      <template slot="warehouseList" slot-scope="{ row }">
        <div v-for="(item, index) in row.warehouseIdList" :key="index">
          <div class="mb6" v-if="allWarehouseList[item]">
            {{ allWarehouseList[item].warehouseName }}
          </div>
          <div v-else>{{ item }}</div>
        </div>
      </template>
      <!-- 库存 -->
      <template slot="inventory" slot-scope="{ row }">
        <dyt-inputEdit :values="row.inventoryQuantity" :disabled="power.updateInventory" :data="row"
          @emitValue="inventoryChange" @textClick="inventoryInfomationDetail" :key="row.linkDetailId" />
        <el-tag v-if="row.syncInventoryStatus == 1" type="success">
          库存助手
        </el-tag>
        <div v-if="!$common.isEmpty(row.inventoryWarningValue)">库存警戒值：{{ row.inventoryWarningValue }}</div>
      </template>
      <!-- 创建时间 -->
      <template slot="handleTime" slot-scope="{ row }">
        <div class="flexCenter flex-jcCenter">
          <div class="timeWidth">{{ row.platformCreateTime || "-" }}</div>
        </div>
      </template>
    </dyt-table>

    <!-- 日志 -->
    <common-log :model-visible.sync="logData.visible" :request-info="logData.data" />
    <!-- 上传文件 -->
    <uploadExcel :model-visible.sync="uploadInfo.visible" :title="uploadInfo.title" @downloadTemplate="downloadTemplate"
      @handleUpload="handleUpload" accept="excel" />
    <!-- 修改库存 -->
    <batchOperation ref="batchOperation" :model-visible.sync="operationUpdate.visible" :data="operationUpdate"
      @batchOperatReturn="batchOperatReturn" />
    <!-- 设置仓库 -->
    <wareSetting ref="wareSetting" :model-visible.sync="wareSetInfo.visible" :total="wareSetInfo.len"
      @wareSettingReturn="wareSettingReturn" />
    <!-- 库存助手 -->
    <iventoryAssistant :model-visible.sync="iventoryInfo.visible" :len="iventoryInfo.len" :data="iventoryInfo.data"
      @refreshAll="refreshAll" />
    <!-- 商品库存信息 -->
    <inventoryInformation :model-visible.sync="infomation.visible" :data="infomation.data"
      :platform-code="infomation.platformCode" />
  </div>
</template>

<script>
import Big from 'big.js';
import regular from "@/utils/regular";
import previewImage from "@/components/previewImage";
import commonLog from "@/views/components/commonLog";
import uploadExcel from "@/views/components/uploadExcel";
import batchOperation from "@/views/components/batchOperation";
import wareSetting from "@/views/components/wareSetting";
import { childSortButtonList, mainTableHead, saleList } from './fileData.js';
import dropdownComfun from "@/views/components/dropdownComfun";
import numInterval from "@/views/components/numInterval";
import iventoryAssistant from "./iventoryAssistant";
import inventoryInformation from "@/views/components/inventoryInformation";

export default {
  name: "temuHalfPiperChild",
  components: {
    previewImage,
    commonLog,
    uploadExcel,
    batchOperation,
    numInterval,
    wareSetting,
    iventoryAssistant,
    inventoryInformation,
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
      platformCode: 'temuHalfPipeChild',
      tableSearch: {
        requestApi: this.api.temuHalfPipe.list,
        requestType: 'post',
        searchParmas: {},
        handleData: true,
      },
      total: 0,
      multipleSelection: [], //表格选中列表
      saleList: saleList,
      powerList: {
        importPrice: "productOnline_temuHalfPipe_importPrice",
        updateInventory: "productOnline_temuHalfPipe_updateInventory",
        setWarehouse: "productOnline_temuHalfPipe_setWarehouse",
        inventoryAssistant: "productOnline_temuHalfPipe_inventoryAssistant",
        export: "productOnline_temuHalfPipe_export",
      },
      operationList: {
        importPrice: {
          label: '导入价格',
          power: 'importPrice',
          clickFun: this.uploadExcel,
        },
        updateInventory: {
          label: '修改库存',
          power: 'updateInventory',
          commandChange: this.inventoryCommand,
        },
        setWarehouse: {
          label: '设置仓库',
          power: 'setWarehouse',
          commandChange: this.setWarehouseCommand,
        },
        inventoryAssistant: {
          label: '设置库存助手',
          power: 'inventoryAssistant',
          commandChange: this.assistantCommand,
        },
        export: {
          label: "导出",
          power: "export",
          commandChange: this.exportCommand,
        },
      },
      logData: { //日志
        visible: false,
        data: {},
      },
      uploadInfo: {
        visible: false,
        title: "导入价格",
      },
      wareSetInfo: {//仓库设置
        visible: false,
        data: {},
        len: 0,
      },
      iventoryInfo: {
        visible: false,
        len: 0,
        data: {},
      },
      sortButtonList: childSortButtonList,
      allWarehouseList: {},
      operationUpdate: { //修改库存/自动补货/防超卖
        visible: false,
        len: 0,
        type: null,//类型
        data: {},
      },
      columnInfo: (() => {
        return {
          controlHead: false,
          platformCode: this.platformCode,
          moduleCode: 'childPage',
        }
      })(),
      // limitLoading: false,//受限loading
      infomation: {
        platformCode: "temuHalfPipe",
        data: {},
        visible: false,
      },
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
          sortField: 'tsl.platform_create_time',
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
    search() {
      this.$refs['temuHalfPipe'].search();
    },
    getList() {
      this.$refs['temuHalfPipe'].getList();
    },
    // 公用下拉
    commonList(data) {
      return dropdownComfun.commonList(data, {
        powerList: this.power,
        multipleSelection: this.multipleSelection,
        total: this.total,
      });
    },
    // 首页表格的合并
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if ([1, 2, 3].includes(columnIndex)) {
        return {
          rowspan: row.rowspan,
          colspan: 1
        };
      }
    },
    // 返回列表页数据
    getAllData(data) {
      this.total = data.total || 0;
      let list = [];
      data.list.forEach(k => {
        let skuList = k.temuxStoreLinkDetailVOList || [];
        skuList.forEach((sk, i) => {
          sk.applyPrice = sk.applyPrice || 0;
          sk.rowspan = i === 0 ? skuList.length : 0;
          list.push(Object.assign({}, k, sk))
        })
      })
      data.returnData(list);
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
    },
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
        this.allWarehouseList = this.$common.arrayToObj(list || [], "id");
      });
    },
    // 查看日志
    logSee(row) {
      let list = (row.temuxStoreLinkDetailVOList || []).map(k => k.linkDetailId);
      let [temp] = [{}];
      temp.axiosApi = this.api.temuHalfPipe.storeLinkLogList;
      temp.axiosType = 'post';
      temp.axiosOptions = list;
      temp.detailsInfo = this.$common.copy(row);
      this.logData.data = this.$common.copy(temp);
      this.$nextTick(() => {
        this.logData.visible = true;
      })
    },
    // 导入文件
    uploadExcel() {
      this.uploadInfo.visible = true;
    },
    // 完成文件上传
    handleUpload(returnData) {
      this.$http
        .post(this.api.temuHalfPipe.importApplyPrice, returnData.data)
        .then(({ data }) => {
          this.$message.success("操作成功!");
          this.getList();
          returnData.fun({ valid: true });
        })
        .catch(() => {
          returnData.fun({ valid: false });
        });
    },
    downloadTemplate() {
      let hostList = ['sales.lapa.com.cn'];
      const hostname = window.location.hostname;
      let env = hostList.includes(hostname) ? 'production' : 'development';
      let apiOption = {
        production: 'https://sso-lapa.oss-cn-guangzhou.aliyuncs.com/marketing-admin/importTemplate/temu/temuApplyPriceImportTemplate.xlsx',
        development: 'https://dyt-srm-test.oss-cn-guangzhou.aliyuncs.com/marketing-admin/importTemplate/temu/temuApplyPriceImportTemplate.xlsx',
      }
      window.open(apiOption[env], "_blank");
    },
    // 修改库存
    inventoryCommand(e) {
      this.commandChange(e, 'inventory');
    },
    // 设置仓库
    setWarehouseCommand(e) {
      this.commandChange(e, '', 'wareSetInfo');
    },
    // 设置库存助手
    assistantCommand(e) {
      this.commandChange(e, "", "iventoryInfo");
    },
    // 修改库存/自动补货/防超卖 
    async commandChange(e, type, objData = "operationUpdate") {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        len = this.multipleSelection.length;
        data.linkDetailIdList = this.multipleSelection.map(k => k.linkDetailId);
      } else {
        len = this.total;
        data.temuxStoreLinkQO = this.$common.removeEmpty(this.searchOptions);
      }
      this[objData].len = len;
      this[objData].type = type;
      this[objData].data = data;
      this[objData].visible = true;
    },
    // 更新主子链接列表
    refreshAll() {
      this.$emit("refreshAll", "keepPageSearch");
    },
    // 操作返回
    batchOperatReturn(data) {
      let operationUpdate = this.operationUpdate;
      let fun = {
        inventory() {
          return { inventoryQuantity: data.inventoryQuantity };
        },
      }
      let handleData = fun[operationUpdate.type]();
      let temp = Object.assign({}, handleData, operationUpdate.data);

      this.$refs['batchOperation'].loading = true;
      this.$http.post(this.api.temuHalfPipe.updateInventoryQuantity, temp).then((res) => {
        this.$message.success("操作成功~");
        this.$refs['batchOperation'].dialogVisible = false;
        this.refreshAll();
      }).finally(() => {
        this.$refs['batchOperation'].loading = false;
      })
    },
    // 申报价格验证
    applyPriceChange({ propData, data, fun }) {
      let pNum = propData.applyPrice;
      let nNum = data.values;
      if (this.$common.isEmpty(nNum) || this.$common.isEmpty(Number(nNum))) {
        this.$message.error("请输入大于等于 0 且最多2位小数的数字或整数");
        fun({ valid: false });
        return;
      }
      nNum = Number(nNum);
      const nSplit = (nNum).toString().split('.');
      if (nNum < 0 || (nSplit.length > 1 && nSplit[1].length > 2)) {
        this.$message.error("请输入大于等于 0 且最多2位小数的数字或整数");
        fun({ valid: false });
        return;
      }
      if (!this.$common.isEmpty(Number(pNum))) {
        pNum = Number(pNum);
      }
      if ((this.$common.isEmpty(pNum) && this.$common.isEmpty(nNum)) || pNum == nNum) {
        this.$message.warning("无改动~");
        fun({ valid: true });
        return;
      }
      this.$http.post(this.api.temuHalfPipe.updateApplyPrice, {
        accountCode: propData.accountCode,
        platformSkc: propData.platformSkc,
        erpSku: propData.erpSku,
        applyPrice: nNum
      }).then(() => {
        fun({ valid: true });
        this.$message.success("操作成功~");
        this.refreshAll();
      }).catch(() => {
        fun({ valid: false });
      });
    },
    // 单个库存修改
    inventoryChange({ propData, data, fun }) {
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
      temp.linkDetailIdList = [propData.linkDetailId];
      temp.inventoryQuantity = data.values - 0;

      this.$http
        .post(this.api.temuHalfPipe.updateInventoryQuantity, temp)
        .then(() => {
          fun({ valid: true });
          this.$message.success("操作成功~");
          this.refreshAll();
        })
        .catch(() => {
          fun({ valid: false });
        });
    },
    // 仓库设置返回
    wareSettingReturn(data) {
      let temp = {
        ...this.wareSetInfo.data,
        warehouseIds: data.warehouseIdList.join(','),
      }
      this.$refs['wareSetting'].loading = true;
      this.$http.post(this.api.temuHalfPipe.updateWarehouse, temp).then((res) => {
        this.$message.success("操作成功~");
        this.$refs['wareSetting'].dialogVisible = false;
        this.refreshAll();
      }).finally(() => {
        this.$refs['wareSetting'].loading = false;
      })
    },
    // 商品库存信息
    inventoryInfomationDetail(row) {
      this.infomation.data = row;
      this.infomation.visible = true;
    },
    // 导出
    exportCommand(e) {
      if (![1, 2].includes(e) || (!this.$common.isEmpty(this.operationList["export"]) && this.operationList["export"].loading)) return;
      this.$set(this.operationList["export"], "loading", true);
      let list = [];
      this.multipleSelection.forEach(row => {
        let idList = (row.temuxStoreLinkDetailVOList || []).map(k => k.linkDetailId);
        list.push(...idList);
      })
      const paramObj = {
        1: {
          linkDetailIdList: list,
        },
        2: {
          temuxStoreLinkQO: this.$common.removeEmpty(this.searchOptions),
        },
      };
      this.$http
        .post(this.api.temuHalfPipe.export, paramObj[e])
        .then((res) => {
          this.$message.success("请在导出查看下载查看导出文件");
          this.$bus.emit("marketing-admin-headDownloadView");
        })
        .finally(() => {
          this.$set(this.operationList["export"], "loading", false);
        });
    },
  },
};
</script>
<style lang="less" scoped></style>