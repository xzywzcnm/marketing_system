<template>
  <div class="page-main ebayMainPage">
    <!-- 排序 -->
    <div class="operator-sort">
      <div>
        <div>
          <dyt-dropdown v-for="(item, index) in computOperaList" :key="index" :dropdown-list="commonList(item)"
            class="mr10" @commandChange="item.commandChange" />
        </div>
      </div>
      <div class="sort-main" />
    </div>
    <!-- 内容展示栏 begin -->
    <div class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass"
          @selection-change="handleSelectionChange">
          <el-table-column v-if="selectionRows" type="selection" width="40" align="center" />
          <el-table-column label="日志" width="60px" fixed align="center">
            <template slot-scope="{ row }">
              <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
            </template>
          </el-table-column>
          <el-table-column label="库存管理" width="70px" fixed align="center">
            <template slot-scope="{ row }">
              <div v-if="power.inventoryManage" class="lapa icon-chilun listIcon" :class="{
                blueIcon:
                  row.autoReplenishment > 0 || row.syncInventoryStatus == 1,
              }" @click="singleAutoClick(row)" />
            </template>
          </el-table-column>
          <el-table-column label="图片" width="90px" fixed align="center">
            <template slot-scope="{ row }">
              <preview-image :url="row.pictureUrl">
                <div>{{ siteExsit[row.siteCode] ? siteExsit[row.siteCode].label : row.siteCode }}</div>
              </preview-image>
            </template>
          </el-table-column>
          <el-table-column label="店铺/店铺SKU/ItemId" min-width="150px" fixed align="center">
            <template slot-scope="{ row }">
              <div class="mt4Content">
                <div>{{ row.accountCode || "-" }}</div>
                <div class="clipContent flex-jcCenter">
                  <span class="clipText">{{ row.platformSku || "-" }}</span>
                  <i class="el-icon-copy-document clipIcon" v-if="row.platformSku"
                    @click="$common.copyActiveCode($event, row.platformSku)" />
                </div>
                <div class="clipContent flex-jcCenter">
                  <span class="highCursor clipText" @click="itemGo(row)">{{ row.itemId || "-" }}</span>
                  <i class="el-icon-copy-document clipIcon" v-if="row.itemId"
                    @click="$common.copyActiveCode($event, row.itemId)" />
                </div>
                <div v-if="[1, '1'].includes(row.constrainStatus)">
                  <el-tag type="danger" size="mini" title="链接判断为受限，将不会自动执行修改库存/价格，如有需要，可自行取消受限">受限</el-tag>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="产品信息" min-width="170px" fixed align="center">
            <template slot-scope="{ row }">
              <div class="mt4Content">
                <div class="clipContent flex-jcCenter" v-for="(item, index) in row.skuList" :key="index + 'erpSku'">
                  <div class="clipText">
                    <span>{{ item.sku }}</span>
                    <span v-if="item.quantity">*{{ item.quantity }}</span>
                  </div>
                  <i class="el-icon-copy-document clipIcon" v-if="item.sku"
                    @click="$common.copyActiveCode($event, item.sku)" />
                </div>
                <span class="highLine">{{ row.productName || "-" }}</span>
                <div>
                  <span v-for="(item, index) in row.skuList" :key="index + 'tag'" class="mr4">
                    <el-tag type="success" size="mini" class="mb4" v-if="goodsStatusArr[item.erpGoodsStatus]">
                      {{ goodsStatusArr[item.erpGoodsStatus].label }}
                    </el-tag>
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="标题/平台类目" min-width="200px" align="center">
            <template slot-scope="{ row }">
              <div class="mb6">
                {{ row.title || "-" }}
              </div>
              <span style="color: #409eff">
                {{ row.platformCategory || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="仓库" width="136px" align="center">
            <template slot-scope="{ row }">
              <div v-for="(item, index) in row.erpWarehouseVOList" :key="index" class="mb6">
                {{ item.warehouseName || '' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="多属性" min-width="130px" align="center">
            <template slot-scope="{ row }">
              <div v-if="row.variationSpecifics">
                <div v-for="(item, index) in row.variationSpecifics.split(';')" :key="index" class="mb6">
                  {{ item }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="90px" align="center">
            <template slot-scope="{ row }">
              <span>{{ row.price || 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="inventoryQuantity" label="库存" width="80px" align="center">
            <template slot-scope="{ row }">
              <div class="linkStyle" @click="openInventoryInfo(row)">
                {{ row.inventoryQuantity }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="soldQuantity" label="售出数量" width="80px" align="center" />
          <el-table-column prop="soldQuantityYesterday" label="昨日销量" width="80px" align="center" />
          <el-table-column label="销量" width="120px" align="center">
            <template slot-scope="{ row }">
              <div class="mb6">
                7日：<span class="highLine">{{ row.soldQuantityWeek || 0 }}</span>
              </div>
              <div class="mb6">
                15日：<span class="highLine">{{ row.soldQuantityHalfMonth || 0 }}</span>
              </div>
              <div>
                30日：<span class="highLine">{{ row.soldQuantityMonth || 0 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上架/更新时间" width="110px" align="center">
            <template slot-scope="{ row }">
              <div class="timeWidth">
                <div class="mb6">
                  {{ row.gmtCreate || "-" }}
                </div>
                <div>{{ row.gmtUpdated || "-" }}</div>
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
    <!-- 库存管理 -->
    <replenishmen-table :model-visible.sync="inventoryControl.visible" :data="inventoryControl.data"
      :platform-code="platformCode" @search="refreshAll" />
    <!-- 设置仓库 -->
    <wareSetting ref="wareSetting" :model-visible.sync="wareSetInfo.visible" :total="wareSetInfo.len"
      @wareSettingReturn="wareSettingReturn" />
    <!-- 删除SKU -->
    <delete-sku :total="total" :model-visible.sync="deleteInfo.visible" :module-data="deleteInfo.data"
      :list="multipleSelection" @search="search" />
    <!-- 修改库存，自动补货，取消受限，忽略初始化 -->
    <batchOperation ref="batchOperation" :model-visible.sync="batchOperation.visible" :data="batchOperation"
      @batchOperatReturn="batchOperatReturn" />
    <!-- 库存信息 -->
    <inventoryInformation :model-visible.sync="inventoryInfo.visible" :data="inventoryInfo.data"
      :platformCode="inventoryInfo.platformCode" />
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import previewImage from "@/components/previewImage";
import commonLog from "./commonLog";
import replenishmenTable from "./replenishmenTable";
import wareSetting from "@/views/components/wareSetting";
import deleteSku from "./deletaSKU.vue"
import batchOperation from "@/views/components/batchOperation";
import inventoryInformation from "@/views/components/inventoryInformation";
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import { getSalesStatus } from '@/utils/staticDataOrigin';
import dropdownComfun from "@/views/components/dropdownComfun";
export default {
  name: "EbayEbayChild",
  components: {
    previewImage,
    commonLog,
    replenishmenTable,
    wareSetting,
    deleteSku,
    batchOperation,
    inventoryInformation
  },
  props: {
    saleList: {
      type: Object,
      default() {
        return {};
      },
    },
    searchOptions: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      searchParmas: {
        pageNum: 1,
        pageSize: 30,
        sortField: "sl.shelved_time",
        sortType: "DESC",
      },
      siteExsit: siteExsit,
      platformCode: "ebay",
      multipleSelection: [], //表格选中列表
      loading: false,
      tableData: [], //表格列表
      total: 0,
      searchStatus: false, //是否请求过
      operationList: {
        inventory: {
          label: '修改库存',
          power: 'updateInventory',
          commandChange: this.commandInventory,
        },
        replenish: {
          label: '自动补货',
          power: 'autoreplenishment',
          commandChange: this.commandAutoreplenish,
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
        deleteSKU: {
          label: '删除SKU',
          power: 'deleteSKU',
          commandChange: this.deleteCommand,
        },
        preventOversale: {
          label: '设置防超卖',
          power: 'preventOverSale',
          commandChange: this.commandOverSale,
        },
      },
      powerList: {
        updateInventory: "productOnline_ebay_childUpdateInventory",
        autoreplenishment: "productOnline_ebay_childAutoreplenishment",
        inventoryManage: "productOnline_ebay_childInventoryManages",
        unlimited: "productOnline_ebay_childUnlimited",
        ignorelimit: "productOnline_ebay_childIgnorelimit",
        deleteSKU: "productOnline_ebay_childDeleteSKU",
        settingWarehouse: "productOnline_ebay_childSettingWarehouse",
        preventOverSale: "productOnline_ebay_childPreventOverSale",
      },
      inventoryControl: {//库存管理
        visible: false,
        data: {},
      },
      logInfo: {//日志
        visible: false,
        data: {},
      },
      wareSetInfo: {//仓库设置
        visible: false,
        data: {},
        len: 0,
      },
      deleteInfo: {//删除sku
        visible: false,
        data: {},
      },
      batchOperation: { //修改库存/自动补货/防超卖
        visible: false,
        len: 0,
        type: null,//类型
        data: {},
        platformCode: 'ebay',
      },
      inventoryInfo: {//库存信息
        visible: false,
        data: {},
        platformCode: 'ebay',
      },
      limitLoading: false,//受限loading
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
    computOperaList() {
      let list = this.multipleSelection;
      let isLimit = list.filter((k) => {
        return k.constrainStatus === 0;
      }); //筛选出是否存在非受限的链接
      let isDisabled = !!(!list.length || isLimit.length);
      return {
        ...this.operationList,
        unlimited: {
          label: '取消受限',
          power: 'unlimited',
          commandChange: this.commandUnlimited,
          disabled: [false, isDisabled, !this.total],
        },
      }
    },
    searchClass() {
      if (this.loading) return "";
      if (this.searchStatus) {
        return !this.tableData.length && "nolength";
      } else {
        return "nosearch";
      }
    },
    goodsStatusArr() {
      let list = getSalesStatus(['1', '2', '3', '4', '5', '6', '8']);
      let statusObj = {};
      list.forEach(k => statusObj[k.value] = k);
      return statusObj;
    },
  },
  methods: {
    // 公用下拉
    commonList(data) {
      let list = dropdownComfun.commonList(data, {
        powerList: this.power,
        multipleSelection: this.multipleSelection,
        total: this.total,
      });
      if (list[0].label == '删除SKU') {
        list = list.filter(item => item.label !== '所有结果集')
      }
      return list
    },
    // 公用command下拉
    async commandChange(e, type) {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        len = this.multipleSelection.length;
        data.linkDetailIdList = this.multipleSelection.map(k => k.linkDetailId);
      } else {
        len = this.total;
        data.ebayStoreLinkQO = this.$common.removeEmpty(this.searchOptions);
      }
      if (type == 'cancelLimit') {
        if (this.limitLoading) return;
        this.limitLoading = true;
        len = await this.getLinkLength(data);
        this.limitLoading = false;
      }
      this.batchOperation.len = len;
      this.batchOperation.type = type;
      this.batchOperation.data = data;
      this.batchOperation.visible = true;
    },
    getLinkLength(data) {
      return new Promise(resolve => {
        this.$http.post(this.api.ebay.countLinksNum, data).then(({ data }) => {
          let num = data || 0;
          resolve(num);
        }).catch(() => {
          resolve(0);
        })
      })
    },
    // 更改库存
    commandInventory(e) {
      this.commandChange(e, 'inventory');
    },
    // 自动补货
    commandAutoreplenish(e) {
      this.commandChange(e, 'replenish');
    },
    // 取消受限
    commandUnlimited(e) {
      this.commandChange(e, 'cancelLimit');
    },
    // 忽略初始化
    commandIgnorelimit(e) {
      this.commandChange(e, 'ignorelimit');
    },
    // 防超卖
    commandOverSale(e) {
      this.commandChange(e, 'preventOversale');
    },
    search() {
      this.searchParmas.pageNum = 1;
      this.getList();
    },
    // 获取列表
    getList() {
      let searchOptions = Object.assign(
        {},
        this.searchOptions,
        this.searchParmas
      );
      let reqParams = FetchFun.returnSearchOptions(searchOptions, "post");
      let mapi = this.api.ebay.storeLinkDetailList + reqParams.params;
      this.loading = true;
      this.$http
        .post(mapi, reqParams.data)
        .then(({ data }) => {
          this.tableData = (data.list || []).map((k) => {
            k.erpWarehouseVOList = (k.erpWarehouseVOList || []).sort((a, b) => {
              return a.warehouseName.localeCompare(b.warehouseName, 'zh-Hans-CN');
            });

            // 正常状态SKU和映射SKU处理统一格式
            let skuList = [];
            const goodsStatus = k.goodsStatus;
            if ([6].includes(goodsStatus)) {
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
                k.productName = vo.name;
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
          this.total = data.total || 0;
        })
        .finally(() => {
          this.searchStatus = true;
          this.loading = false;
        });
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
    // 获取排序方式
    getSortInfoAndFetch(Info) {
      this.searchParmas.sortType = Info[0] || "DESC";
      this.searchParmas.sortField = Info[1] || "sl.shelved_time";
      this.search();
    },
    // 库存管理
    singleAutoClick(row) {
      this.inventoryControl.data = this.$common.copy(row);
      this.inventoryControl.visible = true;
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
          platformCode: this.platformCode,
          linkId: row.linkId,
          commonStoreId: row.commonStoreId,
        },
      });
      window.open(routerData.href, "_blank");
    },
    // 查看日志
    logSee(row) {
      this.logInfo.data = this.$common.copy(row);
      this.logInfo.visible = true;
    },
    // 仓库设置
    warehouseCommand(e) {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        len = this.multipleSelection.length;
        data.linkDetailIdList = this.multipleSelection.map(k => k.linkDetailId);
      } else {
        len = this.total;
        data.ebayStoreLinkQO = this.$common.removeEmpty(this.searchOptions);
      }
      this.wareSetInfo.len = len;
      this.wareSetInfo.data = data;
      this.wareSetInfo.visible = true;
    },
    // 删除SKU
    deleteCommand(e) {
      if (![1, 2].includes(e)) return;
      this.deleteInfo.visible = true;
      this.deleteInfo.data = {
        type: e,
        filter: this.searchOptions,
        rowList: this.multipleSelection,
      };
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
          return { autoReplenishment: data.replenishType == 1 ? Number(data.autoReplenishment) : 0 };
        },
        preventOversale() {
          let temp = {};
          temp.syncInventoryStatus = data.newSyncInventoryStatus;
          data.newSyncInventoryStatus == 1 && (temp.syncInventoryWarningValue = data.syncInventoryWarningValue);
          return temp;
        },
        ignorelimit() {
          return { ignoreInitialization: data.newIgnoreInitialization };
        },
        cancelLimit() {
          return data;
        },
      }
      let handleData = fun[batchOperation.type]();
      let temp = Object.assign({}, handleData, batchOperation.data);
      // console.log(temp);
      this.$refs['batchOperation'].loading = true;
      this.$http.post(this.api.ebay.batchUpdateLinkDetail, temp).then((res) => {
        this.$message.success("操作成功~");
        this.$refs['batchOperation'].dialogVisible = false;
        this.refreshAll();
      }).finally(() => {
        this.$refs['batchOperation'].loading = false;
      })
    },
    // 仓库设置返回
    wareSettingReturn(data) {
      let temp = {
        ...this.wareSetInfo.data,
        ...data,
      }
      // console.log(temp);
      this.$refs['wareSetting'].loading = true;
      this.$http.post(this.api.ebay.batchUpdateLinkDetail, temp).then((res) => {
        this.$message.success("操作成功~");
        this.$refs['wareSetting'].dialogVisible = false;
        this.refreshAll();
      }).finally(() => {
        this.$refs['wareSetting'].loading = false;
      })
    },
    openInventoryInfo(curData) {
      this.inventoryInfo.data = curData
      this.inventoryInfo.visible = true
    }
  },
};
</script>
<style lang="scss" scoped>
.linkStyle {
  color: #2d8cf2;
  text-decoration: underline;
  cursor: pointer;
}
</style>