<template>
  <div class="page-main eliExpressMainPage">
    <!-- tab栏 -->
    <div class="tabItem">
      <el-tabs v-model="searchParmas.managedType" @tab-click="handleTabsClick">
        <el-tab-pane label="全托管" name="1" />
        <el-tab-pane label="半托管" name="2" />
      </el-tabs>
    </div>
    <!-- 内容展示栏 -->
    <div class="mainContent">
      <!-- 排序 -->
      <div class="operator-sort">
        <div class="dropDownBtn">
          <div v-for="(item, index) in operationList" :key="index">
            <dyt-dropdown v-if="item.isShow" class="mr10" :dropdown-list="commonList(item)"
              @commandChange="item.commandChange" />
          </div>
        </div>
        <!-- 选择排序按钮 -->
        <dyt-sortBySelect v-show="searchParmas.managedType == '1'" class="sortButton-global"
          :sort-button-list="trusteeshipSort" :need-default-sort="false"
          @sortInfo="getSortInfoAndFetch(arguments, searchParmas.managedType)" />
        <dyt-sortBySelect v-show="searchParmas.managedType == '2'" class="sortButton-global" :sort-button-list="semiSort"
          :need-default-sort="false" @sortInfo="getSortInfoAndFetch(arguments, searchParmas.managedType)" />
      </div>
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass"
          @selection-change="handleSelectionChange">
          <el-table-column v-if="power.autoReplenishment" type="selection" width="40" align="center" />
          <el-table-column label="日志" min-width="60px" fixed align="center">
            <template slot-scope="{ row }">
              <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
            </template>
          </el-table-column>
          <el-table-column label="图片" min-width="120px" align="center">
            <template slot-scope="{ row }">
              <!-- <div v-if="manageTypeList[row.managedType]" class="mb6">
                {{ manageTypeList[row.managedType].label }}
              </div> -->
              <preview-image :url="row.mainPictureUrl">
                <div v-if="statusList[row.status]" class="mt4">
                  {{ statusList[row.status].label }}
                </div>
              </preview-image>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="平台信息" min-width="220px" align="center">
            <template slot-scope="{ row }">
              <div class="mt4Content">
                <el-tooltip placement="top" :disabled="!(row.title && row.title.length)">
                  <div slot="content" style="max-width: 400px">
                    {{ row.title }}
                  </div>
                  <div class="text-ellipsis" title="标题">
                    {{ row.title }}
                  </div>
                </el-tooltip>
                <div>货品ID：{{ row.productId || "" }}</div>
                <div>多属性：{{ row.specifications || "" }}</div>
                <div>平台SKU编码：{{ row.platformSku || "" }}</div>
                <div title="店铺代号">
                  {{ row.accountCode || "" }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="商品信息" min-width="180px" align="center">
            <template slot-scope="{ row }">
              <div class="mt4Content">
                <div class="highLine" title="商品中文名称">
                  {{ row.cnName || "" }}
                </div>

                <div>
                  <div v-if="row.skuList.length">
                    <div v-for="(item, index) in row.skuList" :key="index + 'sku'" class="clipContent flex-jcCenter">
                      <div class="clipText">
                        <span>{{ item.sku }}</span>
                        <span v-if="item.quantity">*{{ item.quantity }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else>
                    -
                  </div>
                </div>

                <div>
                  <span v-for="(item, index) in row.labelList" :key="index + 'tag'" class="mr4">
                    <el-tag v-if="goodsStatusArr[item.erpGoodsStatus]" :type="[0, '0'].includes(item.erpGoodsStatus)
                        ? 'danger'
                        : 'success'
                      " size="mini" class="mb4">
                      {{ goodsStatusArr[item.erpGoodsStatus].label }}
                    </el-tag>
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="供货价" min-width="100px" align="center">
            <template slot-scope="{ row }">
              <div class="mt4Content">
                <div>{{ row.supplyPrice || 0 }}</div>
                <div v-if="row.currency">
                  （{{ row.currency }}）
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="平台库存" min-width="100px" align="center">
            <template slot-scope="{ row }">
              <!-- <div>{{ row.dgInventoryQuantity || 0 }}</div> -->
              <dyt-inputEdit :values="row.dgInventoryQuantity" :disabled="power.inventoryModify" :data="row"
                @emitValue="quantityChange" />
              <el-tag v-if="row.syncInventoryStatus == 1" type="success">
                库存助手
              </el-tag>
              <div v-if="row.autoReplenishment > 0" class="mb10">
                <el-tag type="success" size="mini">
                  自动补货
                </el-tag>
              </div>
              <div v-if="row.managedType !== 2" class="mb10">
                补货保持值：{{ row.autoReplenishment || 0 }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="佛山丽山仓库存" min-width="100px" align="center">
            <template slot-scope="{ row }">
              <div class="mt4Content">
                <div>在途库存：{{ row.fsOnWayInventory || 0 }}</div>
                <div>可用库存：{{ row.fsInventoryQuantity || 0 }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上架时间" min-width="110px" align="center">
            <template slot-scope="{ row }">
              <div class="timeWidth">
                {{ row.shelvedTime || "-" }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pageBox">
        <el-pagination :current-page="searchParmas.pageNum" :page-sizes="Globalsize" :page-size="searchParmas.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
    <!-- 日志 -->
    <common-log :model-visible.sync="logInfo.visible" :request-info="logInfo.data" />

    <!-- 库存同步 -->
    <!-- <synchronize-inventory
      ref="synchronizeInventory"
      :model-visible.sync="synchronizeInfo.visible"
      :total="synchronizeInfo.total"
      @synchronizeResult="synchronizeResult"
    /> -->

    <!-- 自动补货 -->
    <replenishOperator ref="batchOperation" :model-visible.sync="batchOperation.visible" :data="batchOperation"
      @batchOperatReturn="batchOperatReturn" />
  </div>
</template>

<script>
import Big from "big.js";
import FetchFun from "@/utils/listPage";
import previewImage from "@/components/previewImage";
import commonLog from "@/views/components/commonLog";
// import synchronizeInventory from "../temu/synchronizeInventory";
import { statusList, manageTypeList } from "./fileData.js";
import { getSalesStatus } from "@/utils/staticDataOrigin";
// import { copyActiveCode } from "@/utils/clipboard.js";
import dropdownComfun from "@/views/components/dropdownComfun";
import replenishOperator from "./replenishOperator";
import regular from "@/utils/regular";
export default {
  name: "EliExpressMain",
  components: {
    previewImage,
    commonLog,
    replenishOperator,
    // synchronizeInventory,
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
      trusteeshipSort: [
        {
          sortHeader: "上架时间",
          sortField: "asl.shelved_time",
          sortType: "DESC",
          default: true,
        },
      ],
      semiSort: [
        {
          sortHeader: "上架时间",
          sortField: "asl.shelved_time",
          sortType: "DESC",
          default: true,
        },
      ],
      searchParmas: {
        pageNum: 1,
        pageSize: 30,
        sortField: 'asl.shelved_time',
        sortType: 'DESC',
        managedType: "1"
      },
      sortParmas: {
        '1': {
          sortField: 'asl.shelved_time',
          sortType: 'DESC',
        },
        '2': {
          sortField: 'asl.shelved_time',
          sortType: 'DESC',
        }
      },
      statusList: statusList,
      manageTypeList: manageTypeList,
      logInfo: {
        // 日志
        visible: false,
        data: {},
      },
      // synchronizeInfo: {
      //   visible: false, //库存同步弹框
      //   total: 0,
      //   data: {},
      // },
      multipleSelection: [], //表格选中列表
      loading: false,
      tableData: [], //表格列表
      total: 0,
      // syncInventoryLoading: false, //库存加载
      searchStatus: false, //是否请求过
      powerList: {
        // syncInventory: "productOnline_aliExpress_syncInventory",
        autoReplenishment: "productOnline_aliExpress_mainAutoReplenishment",
        inventoryModify: "productOnline_aliExpress_mainInventoryModify",
        inventoryAssistant: "productOnline_aliExpress_mainInventoryAssistant"
      },
      operationList: {
        modifyPrice: {
          label: "设置自动补货",
          power: "autoReplenishment",
          commandChange: this.replenishCommand,
          isShow: false
        },
        inventoryAssistant: {
          label: "设置库存助手",
          power: "inventoryAssistant",
          commandChange: this.inventoryCommand,
          isShow: false
        }
      },
      //自动补货
      batchOperation: {
        visible: false,
        len: 0,
        type: null, //类型
        data: {},
      },
    };
  },
  computed: {
    //ERP商品状态
    goodsStatusArr() {
      return this.$common.arrayToObj(
        getSalesStatus(["1", "2", "3", "4", "5", "6", "7"])
      );
    },
    // 权限
    power() {
      return this.$common.getPower(this.powerList);
    },
    // // 下拉数据
    // syncInventoryList() {
    //   let isPower = this.power["syncInventory"];
    //   let len = this.multipleSelection.length;
    //   return [
    //     {
    //       label: "设置同步库存",
    //       power: isPower,
    //       disabled: false,
    //       command: null,
    //     },
    //     {
    //       label: "选中链接",
    //       power: isPower,
    //       disabled: !len,
    //       command: 1,
    //     },
    //     {
    //       label: "所有结果集",
    //       power: isPower,
    //       disabled: !this.total,
    //       command: 2,
    //     },
    //   ];
    // },
    // 表格背景
    searchClass() {
      if (this.loading) return "";
      if (this.searchStatus) {
        return !this.tableData.length && "nolength";
      } else {
        return "nosearch";
      }
    },
  },
  mounted() {
    this.handleTabsClick();
  },
  methods: {
    // 获取列表
    getList() {
      let searchOptions = Object.assign(
        {},
        this.searchOptions,
        this.searchParmas
      );
      searchOptions.managedType = Number(searchOptions.managedType)
      let reqParams = FetchFun.returnSearchOptions(searchOptions, "post");
      let mapi = this.api.aliExpress.list + reqParams.params;
      this.loading = true;
      this.$http
        .post(mapi, reqParams.data)
        .then(({ data }) => {
          this.tableData = (data.list || []).map((k) => {
            k.skuList = this.handleMappingSku(k);
            k.labelList = this.handleMappingSku(k, "label");
            // 多属性
            let strList = [];
            let speciList = k.specification ? k.specification.split(";") : [];
            speciList.forEach((sk) => {
              let skList = sk ? sk.split(":") : [];
              strList.push(skList[1]);
            });
            k.specifications = strList.join("，");

            let wareList = k.wmsInventoryByWarehouseDTOList || [];
            let fsItem = wareList[0] || {};
            k.fsInventoryQuantity = fsItem.inventoryQuantity || 0;
            k.fsOnWayInventory = fsItem.onWayInventory || 0;
            return k;
          });
          this.total = data.total || 0;
        })
        .finally(() => {
          this.searchStatus = true;
          this.loading = false;
        });
    },
    // 处理映射sku关系
    handleMappingSku(k, type) {
      // 正常状态SKU和映射SKU处理统一格式
      let skuList = [];
      const goodsStatus = k.erpGoodsStatus;
      if ([6].includes(goodsStatus)) {
        // goodsStatus为6展示无状态SKU
        skuList.push({
          sku: k.sku,
          erpGoodsStatus: null,
        });
      } else if ([7].includes(goodsStatus)) {
        // goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
        let erpSkuMappingVO = k.erpSkuMappingVO || [];
        let blindBox = false; //是否盲盒
        erpSkuMappingVO.forEach((vo) => {
          if (blindBox) return;
          // 映射类型，0：组合产品，1：随机发一个SKU产品
          blindBox = vo.skuType == 1;
          k.cnName = vo.name; //匹配映射SKU，商品中文名称展示映射商品名称
          const sku = blindBox ? k.sku : vo.erpSku;
          skuList.push({
            sku: sku,
            quantity: blindBox ? null : vo.quantity,
            erpGoodsStatus: blindBox ? 8 : vo.erpGoodsStatus,
          });
        });
      } else {
        // goodsStatus为0-5展示sku 或者不在其中状态的也展示最基础的
        skuList.push({
          sku: k.sku,
          erpGoodsStatus: goodsStatus,
        });
      }
      // 映射SKU如果多个SKU是同一个商品状态，则展示一个
      if (type == "label") {
        let list = this.$common.arrayToObj(skuList, "erpGoodsStatus");
        skuList = Object.values(list);
      }
      return skuList;
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
    },
    // 页码切换事件
    handleSizeChange(val) {
      // if (FetchFun.validateForm(this.searchOptions)) return false;
      this.searchParmas.pageNum = 1;
      this.searchParmas.pageSize = val;
      this.getList();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      // if (FetchFun.validateForm(this.searchOptions)) return false;
      this.searchParmas.pageNum = val;
      this.getList();
    },
    // 查看日志
    logSee(row) {
      let [temp] = [{}];
      temp.axiosApi = this.api.aliExpress.getLinkDetailLogs;
      temp.axiosType = "get";
      temp.axiosOptions = { linkDetailId: row.linkDetailId };
      this.logInfo.data = this.$common.copy(temp);
      this.logInfo.visible = true;
    },
    // 排序变更
    getSortInfoAndFetch(config, type) {
      if (!this.$common.isEmpty(config)) {
        !this.$common.isEmpty(config[0]) && (this.sortParmas[type].sortType = config[0]);
        !this.$common.isEmpty(config[1]) && (this.sortParmas[type].sortField = config[1]);
        this.searchParmas.sortType = this.sortParmas[type].sortType;
        this.searchParmas.sortField = this.sortParmas[type].sortField;
      }
      this.$nextTick(() => {
        this.getList();
      })
    },
    // // 设置同步库存
    // syncInventorySet(e) {
    //   if (!e) return;
    //   let [len, data] = [0, {}];
    //   if (e == 1) {
    //     len = this.multipleSelection.length;
    //     data.linkDetailIdList = this.multipleSelection.map(
    //       (k) => k.linkDetailId
    //     );
    //   } else {
    //     len = this.total;
    //     data = this.$common.removeEmpty(this.searchOptions);
    //   }
    //   this.synchronizeInfo.total = len;
    //   this.synchronizeInfo.data = data;
    //   this.synchronizeInfo.visible = true;
    // },
    // // 同步库存返回
    // synchronizeResult(data) {
    //   let temp = Object.assign(
    //     {},
    //     { syncInventoryStatusUpdate: data.type },
    //     this.synchronizeInfo.data
    //   );
    //   // console.log(temp);
    //   this.syncInventoryLoading = true;
    //   this.$http
    //     .post(this.api.aliExpress.update, temp)
    //     .then((res) => {
    //       this.$message.success("操作成功~");
    //       this.getList();
    //     })
    //     .finally(() => {
    //       this.syncInventoryLoading = false;
    //     });
    // },
    // 查询
    search() {
      this.searchParmas.pageNum = 1;
      this.getList();
    },
    // 公用下拉
    commonList(data) {
      return dropdownComfun.commonList(data, {
        powerList: this.power,
        multipleSelection: this.multipleSelection,
        total: this.total,
      });
    },
    // 自动补货
    replenishCommand(e) {
      this.commandChange(e, "replenish");
    },
    // 库存助手
    inventoryCommand(e) {
      this.commandChange(e, "inventory");
    },
    // 公用（自动补货）
    async commandChange(e, type, objData = "batchOperation") {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        len = this.multipleSelection.length;
        data.linkDetailIdList = this.multipleSelection.map(
          (k) => k.linkDetailId
        );
      } else {
        len = this.total;
        data.aliexpressStoreLinkDetailListQO = this.$common.removeEmpty(
          this.searchOptions
        );
      }
      this[objData].len = len;
      type && (this[objData].type = type);
      this[objData].data = data;
      this[objData].visible = true;
    },
    // 操作返回
    batchOperatReturn({ data, back }) {
      let type = this.batchOperation.type;
      let temp = this.$common.copy(this.batchOperation.data);
      if (type === "replenish") {
        temp.newAutoReplenishment =
          data.replenishType == 1 ? data.autoReplenishment : 0;
        delete data.replenishType;
      } else if (type === "inventory") {
        temp.newSyncInventoryStatus = data.newSyncInventoryStatus
      }
      this.$http
        .post(this.api.aliExpress.batchUpdateLinkDetails, temp)
        .then(() => {
          this.$message.success("操作成功~");
          this.getList();
          back({ valid: true });
        })
        .catch(() => {
          back({ valid: false });
        });
    },
    quantityChange({ propData, data, fun }) {
      let pNum = propData.dgInventoryQuantity || 0;
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
      // 全托管managedType == 1
      if (propData.managedType == 1 && subNum < 0) {
        this.$message.error("只允许改多或者不改，不允许改少~");
        fun({ valid: false });
        return;
      }
      // return;
      let temp = {};
      temp.linkDetailId = propData.linkDetailId;
      temp.newDgInventoryQuantity = data.values - 0;
      this.$http
        .post(this.api.aliExpress.updateLinkDetails, [temp])
        .then(() => {
          fun({ valid: true });
          this.$message.success("操作成功~");
          this.tableData.forEach((k) => {
            if (k.linkDetailId === propData.linkDetailId) {
              k.dgInventoryQuantity = data.values - 0;
            }
          });
        })
        .finally(() => {
          fun();
        });
    },
    handleTabsClick(tab, event) {
      if (this.searchParmas.managedType === "1") {
        this.operationList.modifyPrice.isShow = true
        this.operationList.inventoryAssistant.isShow = false
      } else {
        this.operationList.inventoryAssistant.isShow = true
        this.operationList.modifyPrice.isShow = false
      }
      this.searchParmas.sortType = this.sortParmas[this.searchParmas.managedType].sortType;
      this.searchParmas.sortField = this.sortParmas[this.searchParmas.managedType].sortField;
      this.$nextTick(() => {
        this.search();
      })
    }
  },
};
</script>
<style lang="less" scoped>
.eliExpressMainPage {
  flex: 1;
  overflow: hidden;
}

.dropDownBtn {
  display: flex;
}
</style>
