<template>
  <div class="page-main ebayMainPage">
    <!-- 排序 -->
    <div class="operator-sort">
      <div>
        <div>
          <dyt-dropdown v-for="(item, index) in computOperaList" :key="index" :dropdown-list="commonList(item)"
            class="mr10" @commandChange="item.commandChange" />
          <!-- 取消受限 -->
          <!-- <dyt-dropdown :dropdown-list="limitList" @commandChange="commandUnlimited" /> -->
        </div>
      </div>
      <div class="sort-main">
        <!-- 选择排序按钮 -->
        <dyt-sortBySelect class="sortButton-global" :sort-button-list="sortButtonList"
          @sortInfo="getSortInfoAndFetch(arguments)" />
      </div>
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
              <span v-if="power.inventoryManage" class="lapa icon-chilun listIcon" :class="{
                blueIcon:
                  row.autoReplenishment > 0 ||
                  row.syncInventoryStatusCount > 0,
              }" @click="singleAutoClick(row)" />
            </template>
          </el-table-column>
          <el-table-column label="图片" width="90px" fixed align="center">
            <template slot-scope="{ row }">
              <preview-image :url="row.mainPictureUrl">
                <div>{{ siteExsit[row.siteCode] ? siteExsit[row.siteCode].label : row.siteCode }}</div>
              </preview-image>
            </template>
          </el-table-column>
          <el-table-column label="店铺/店铺SPU/ItemId" min-width="150px" fixed align="center">
            <template slot-scope="{ row }">
              <div class="mt4Content">
                <div>{{ row.accountCode || "-" }}</div>
                <div class="clipContent flex-jcCenter">
                  <span class="clipText ">{{ row.platformSpu || "-" }}</span>
                  <i class="el-icon-copy-document clipIcon" v-if="row.platformSpu"
                    @click="$common.copyActiveCode($event, row.platformSpu)" />
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
                <div class="clipContent flex-jcCenter">
                  <div class="clipText">{{ row.erpSpu }}</div>
                  <i class="el-icon-copy-document clipIcon" v-if="row.erpSpu"
                    @click="$common.copyActiveCode($event, row.erpSpu)" />
                </div>
                <span class="highLine">{{ row.productName || "-" }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="标题/平台类目" min-width="200px" align="center">
            <template slot-scope="{ row }">
              <div class="mt4Content">
                <div>{{ row.title || "-" }}</div>
                <span class="highLine">{{ row.platformCategory || "-" }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="仓库" width="136px" align="center">
            <template slot-scope="{ row }">
              <div v-for="(item, index) in row.erpWarehouseVOList" :key="index" class="mb6">
                {{ item.warehouseName || '' }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="136px" align="center">
            <template slot-scope="{ row }">
              <span>{{ row.minPrice || 0 }}</span>
              -
              <span>{{ row.maxPrice || 0 }}</span>
              <span>{{ row.currency || "" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="inventoryQuantity" label="库存" width="80px" align="center" />
          <el-table-column prop="soldQuantity" label="售出数量" width="90px" align="center" />
          <el-table-column prop="soldQuantityYesterday" label="昨日销量" width="90px" align="center" />
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
          <el-table-column label="上架/更新时间" width="104px" align="center">
            <template slot-scope="{ row }">
              <div class="timeWidth">
                <div class="mb6">
                  {{ row.shelvedTime || "-" }}
                </div>
                <div>{{ row.gmtUpdated || "-" }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80px" align="center">
            <template slot-scope="{ row }">
              <div v-if="saleList[row.status]" :style="saleList[row.status].style">
                {{ saleList[row.status].label }}
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
    <!-- 库存管理 -->
    <replenishmen-table :model-visible.sync="inventoryControl.visible" :data="inventoryControl.data"
      :platform-code="platformCode" @search="refreshAll" />
    <!-- 日志 -->
    <common-log :model-visible.sync="logInfo.visible" :request-info="logInfo.data" />
    <!-- 下架链接弹窗 -->
    <soldOutLink :model-visible.sync="soldOutInfo.visible" :module-data="soldOutInfo.data" @search="refreshAll" />
    <!-- 修改库存，自动补货，取消受限，忽略初始化 -->
    <batchOperation ref="batchOperation" :model-visible.sync="batchOperation.visible" :data="batchOperation"
      @batchOperatReturn="batchOperatReturn" />
    <!-- 设置仓库 -->
    <wareSetting ref="wareSetting" :model-visible.sync="wareSetInfo.visible" :total="wareSetInfo.len"
      @wareSettingReturn="wareSettingReturn" />
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import previewImage from "@/components/previewImage";
import commonLog from "./commonLog";
import replenishmenTable from "./replenishmenTable";
import soldOutLink from "./soldOut";
import batchOperation from "@/views/components/batchOperation";
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import wareSetting from "@/views/components/wareSetting";
import dropdownComfun from "@/views/components/dropdownComfun";

export default {
  name: "EbayEbayMain",
  components: {
    previewImage,
    replenishmenTable,
    soldOutLink,
    commonLog,
    batchOperation,
    wareSetting,
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
      sortButtonList: [
        {
          sortHeader: "7天销量",
          sortField: "sld.sold_quantity_week",
          sortType: "DESC",
        },
        {
          sortHeader: "15天销量",
          sortField: "sld.sold_quantity_half_month",
          sortType: "DESC",
        },
        {
          sortHeader: "30天销量",
          sortField: "sld.sold_quantity_month",
          sortType: "DESC",
        },
        {
          sortHeader: "上架时间",
          sortField: "sl.shelved_time",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "更新时间",
          sortField: "sl.off_shelved_time",
          sortType: "DESC",
        },
      ], //排序
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
        soldOutHand: {
          label: '下架链接',
          power: 'soldOutLink',
          command: ['1', '2', '3'],
          commandChange: this.soldOutHand,
        },
        preventOversale: {
          label: '设置防超卖',
          power: 'preventOverSale',
          commandChange: this.commandOverSale,
        },
        settingWarehouse: {
          label: '设置仓库',
          power: 'settingWarehouse',
          commandChange: this.warehouseCommand,
        },
      },
      powerList: {
        updateInventory: "productOnline_ebay_mainUpdateInventory",
        autoreplenishment: "productOnline_ebay_mainAutoreplenishment",
        inventoryManage: "productOnline_ebay_mainInventoryManages",
        unlimited: "productOnline_ebay_mainUnlimited",
        ignorelimit: "productOnline_ebay_mainIgnorelimit",
        soldOutLink: "productOnline_ebay_mainSoldOutLink",
        preventOverSale: "productOnline_ebay_mainPreventOverSale",
        settingWarehouse: "productOnline_ebay_mainSettingWarehouse",
      },
      inventoryControl: {//库存管理
        visible: false,
        data: {},
      },
      logInfo: {//日志
        visible: false,
        data: {},
      },
      soldOutInfo: {//下架链接
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
      allWarehouseList: [],
      wareSetInfo: {//仓库设置
        visible: false,
        data: {},
        len: 0,
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
    searchClass() {
      if (this.loading) return "";
      if (this.searchStatus) {
        return !this.tableData.length && "nolength";
      } else {
        return "nosearch";
      }
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
    // 公用command下拉
    async commandChange(e, type, objData = 'batchOperation') {
      if (![1, 2].includes(e)) return;
      let [len, data] = [0, {}];
      if (e == 1) {
        len = this.multipleSelection.length;
        data.linkIdList = this.multipleSelection.map(k => k.linkId);
      } else {
        len = this.total;
        data.ebayStoreLinkQO = this.$common.removeEmpty(this.searchOptions);
      }

      if (!['cancelLimit'].includes(type)) {
        if (this.limitLoading) return;
        this.limitLoading = true;
        len = await this.getLinkLength(data);
        this.limitLoading = false;
      }
      // console.log(len, data)
      this[objData].len = len;
      this[objData].type = type;
      this[objData].data = data;
      this[objData].visible = true;
    },
    getLinkLength(data) {
      return new Promise(resolve => {
        this.$http.post(this.api.ebay.countLinkDetailsNum, data).then(({ data }) => {
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
    // 仓库设置
    warehouseCommand(e) {
      this.commandChange(e, 'settingWarehouse', 'wareSetInfo');
    },
    // 获取列表
    getList() {
      let searchOptions = Object.assign(
        {},
        this.searchOptions,
        this.searchParmas
      );
      let reqParams = FetchFun.returnSearchOptions(searchOptions, "post");
      let mapi = this.api.ebay.ebayQueryAll + reqParams.params;
      this.loading = true;
      this.$http.post(mapi, reqParams.data).then(({ data }) => {
        this.tableData = (data.list || []).map((k) => {
          k.storeSyncInventoryStatus = k.syncInventoryStatus; //店铺防超卖
          k.erpWarehouseVOList = (k.erpWarehouseVOList || []).sort((a, b) => {
            return a.warehouseName.localeCompare(b.warehouseName, 'zh-Hans-CN');
          });
          return k;
        });
        this.total = data.total || 0;
      }).finally(() => {
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
      this.searchParmas.pageSize = val;
      this.search();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      // if (FetchFun.validateForm(this.searchOptions)) return false;
      this.searchParmas.pageNum = val;
      this.getList();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.searchParmas.sortType = Info[0] || "DESC";
      this.searchParmas.sortField = Info[1] || "sl.shelved_time";
      this.search();
      this.$emit("getSortInfoAndFetch", Info);// 回传
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
    // 库存管理
    singleAutoClick(row) {
      this.inventoryControl.data = this.$common.copy(row);
      this.inventoryControl.visible = true;
    },
    // 查看日志
    logSee(row) {
      this.logInfo.data = this.$common.copy(row);
      this.logInfo.visible = true;
    },
    // 下架链接
    soldOutHand(str) {
      if (str === "1") return;
      const checkRows = this.multipleSelection.filter((f) =>
        [1, "1"].includes(f.status)
      );
      if (str === "2" && checkRows.length === 0) {
        this.$message.error("勾选的数据不存在上架状态的主链接!");
        return;
      }
      if (str === "3" && [0, "0"].includes(this.searchOptions.status)) {
        this.$message.error("检索条件中“状态”栏需要选择“上架”!");
        return;
      }
      this.soldOutInfo.data = {
        type: str,
        filter: this.searchOptions,
        rowList: checkRows,
      };
      this.$nextTick(() => {
        this.soldOutInfo.visible = true;
      });
    },
    search() {
      this.searchParmas.pageNum = 1;
      this.getList();
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
    }
  },
};
</script>
<style lang="scss" scoped></style>
