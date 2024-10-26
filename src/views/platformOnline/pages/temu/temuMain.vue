<template>
  <div class="page-main ebayMainPage">
    <!-- 排序 -->
    <div class="operator-sort">
      <div>
        <div>
          <el-button v-if="power.updateInventory" type="primary" :disabled="!(multipleSelection.length && mulEligible)"
            :title="multipleSelection.length && !mulEligible
              ? '“修改库存” 功能仅针对JIT链接可使用'
              : ''
              " @click="editStock('1')">
            修改库存
          </el-button>
          <!-- 同步库存 -->
          <dyt-dropdown :dropdown-list="syncInventoryList" :loading="syncInventoryLoading"
            @commandChange="syncInventorySet" />
          <!-- 近7日销量导出 -->
          <dyt-dropdown :dropdown-list="salesVolumeList" :loading="salesVolumeLoading" @commandChange="salesVolumeSet" />
        </div>
      </div>
      <div class="sort-main">
        <!-- 选择排序按钮 -->
        <dyt-sortBySelect class="sortButton-global" :sort-button-list="sortButtonList"
          @sortInfo="getSortInfoAndFetch(arguments)" />
      </div>
    </div>
    <!-- 内容展示栏 -->
    <div class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass"
          @selection-change="handleSelectionChange">
          <el-table-column v-if="power.syncInventory" type="selection" width="40" />
          <el-table-column label="日志" width="60px" fixed>
            <template slot-scope="{ row }">
              <div class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
            </template>
          </el-table-column>
          <el-table-column label="库存管理" width="90px" fixed align="center">
            <template slot="header" slot-scope="{}">
              <el-tooltip placement="top-start" effect="light">
                <span class="lapa icon-tishi replenIcon" />
                <div slot="content" class="tooltip-style">
                  <div>库存管理功能仅限JIT链接使用</div>
                </div>
              </el-tooltip>
              库存管理
            </template>
            <template slot-scope="{ row }">
              <!-- 当链接的SKU全部为非Jit模式时，屏蔽按钮 -->
              <span v-if="power.inventoryManage &&
                row.linkDetailJitModeStatus.includes('1')
                " class="lapa icon-chilun listIcon" :class="{ blueIcon: row.syncInventoryStatusCount > 0 }"
                @click="singleAutoClick(row)" />
            </template>
          </el-table-column>
          <el-table-column label="店铺/SPU" min-width="140px" fixed>
            <template slot-scope="{ row }">
              <div>{{ row.accountCode || "-" }}</div>
              <div class="clipContent">
                <span style="color: #409eff" class="mb6 clipText">
                  {{ row.erpSpu || "-" }}
                </span>
                <i class="el-icon-copy-document clipIcon" @click="$common.copyActiveCode($event, row.erpSpu)" />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="产品名称" min-width="140px" fixed>
            <template slot-scope="{ row }">
              <span style="color: #409eff" @click="detail(row)">
                {{ row.productName || "-" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="requireDespatchTime" label="图片/平台" width="120px" fixed>
            <template slot-scope="{ row }">
              <preview-image :url="row.pictureUrl">
                <div class="mt4">
                  {{ platformCode }}
                </div>
              </preview-image>
            </template>
          </el-table-column>
          <el-table-column label="类目" min-width="140px">
            <template slot-scope="{ row }">
              <span style="color: #409eff"> {{ row.categoryName || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="140px">
            <template slot-scope="{ row }">
              <span>{{ row.minPrice || 0 }}</span>
              -
              <span>{{ row.maxPrice || 0 }}</span>
              <span>{{ row.currency || "" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="inventoryQuantity" label="库存" width="80px" />
          <el-table-column prop="soldQuantityToday" label="今日销量" width="90px" />
          <el-table-column label="销量" width="120px">
            <template slot-scope="{ row }">
              <div class="mb6">
                7日：<span class="highLine">{{ row.soldQuantityWeek || 0 }}</span>
              </div>
              <div>
                30日：<span class="highLine">{{ row.soldQuantityMonth || 0 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上架时间" width="110px">
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
    <!-- 库存管理 -->
    <replenishmen-table :model-visible.sync="singleAutoVisible" :data="singleAutoData" @search="getList" />
    <!-- 日志 -->
    <common-log :model-visible.sync="logInfo.visible" :request-info="logInfo.data" />
    <!-- 库存同步 -->
    <synchronize-inventory ref="synchronizeInventory" :model-visible.sync="synchronizeVisible"
      @synchronizeResult="synchronizeResult" />
    <!-- 销量导出 -->
    <SalesVolumeExport :model-visible.sync="saleExportVisible" @getExportTime="getExportTime" />
    <!-- 修改库存 -->
    <modify-inventory :model-visible.sync="inventoryVisible" :list="jitList" :type="type" :search-option="searchOptions"
      @search="getList" />
  </div>
</template> 

<script>
import FetchFun from "@/utils/listPage";
import previewImage from "@/components/previewImage";
import commonLog from "@/views/components/commonLog";
import replenishmenTable from "./replenishmenTable";
import modifyInventory from "./modifyInventory";
import synchronizeInventory from "./synchronizeInventory";
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
// import { copyActiveCode } from "@/utils/clipboard.js";
import SalesVolumeExport from "./salesVolumeExport.vue";

export default {
  name: "TemuTemuMain",
  components: {
    previewImage,
    replenishmenTable,
    commonLog,
    synchronizeInventory,
    modifyInventory,
    SalesVolumeExport
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
    wareList: {
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
        sortField: "tsl.shelved_time",
        sortType: "DESC",
      },
      sortButtonList: [
        {
          sortHeader: "上架时间",
          sortField: "tsl.shelved_time",
          sortType: "DESC",
          default: true,
        },
      ], //排序
      siteExsit: siteExsit,
      platformCode: "temu",
      singleAutoVisible: false, //库存管理弹框
      singleAutoData: null, //库存管理信息
      logInfo: { // 日志
        visible: false,
        data: {},
      },
      multipleSelection: [], //表格选中列表
      loading: false,
      tableData: [], //表格列表
      total: 0,
      syncInventoryLoading: false, //库存加载
      synchronizeVisible: false, //库存同步弹框
      saleExportVisible: false, //销量导出弹框
      synchronizeType: null, //同步库存：批量/全部
      exportType: null,//销量导出：批量/全部
      inventoryVisible: false, //修改库存弹框
      type: "", //1 修改库存；修改价格；2按固定值调整，3按数值调整，4按比例调整
      salesVolumeLoading: false, //销量导出加载
      allJIT: null, //查询全部结果jit条数
      jitList: [], //选中jit的链接
      searchStatus: false, //是否请求过
    };
  },
  computed: {
    // 权限
    power() {
      return this.$common.getPower({
        syncInventory: "productOnline_temu_syncInventory",
        inventoryManage: "productOnline_temu_inventoryManage",
        updateInventory: "productOnline_temu_updateInventory",
        salesVolumeExport: "productOnline_temu_salesVolumeExport",
      });
    },
    // 下拉数据
    syncInventoryList() {
      let isPower = this.power["syncInventory"];
      let len = this.multipleSelection.length;
      let mulEligible = this.mulEligible;
      let allEligible = this.allEligible;
      let title = "“设置同步库存” 功能仅针对JIT链接可使用";
      return [
        {
          label: "设置同步库存",
          power: isPower,
          disabled: false,
          command: null,
        },
        {
          label: "选中链接",
          power: isPower,
          disabled: !(len && mulEligible),
          command: 1,
          title: len && !mulEligible ? title : "",
        },
        {
          label: "所有结果集",
          power: isPower,
          disabled: !(this.total && allEligible),
          command: 2,
          title: this.total && !allEligible ? title : "",
        },
      ];
    },
    // 销量导出
    salesVolumeList() {
      let isPower = this.power["salesVolumeExport"];
      let len = this.multipleSelection.length;
      return [
        {
          label: "销量导出",
          power: isPower,
          disabled: false,
          command: null,
        },
        {
          label: "选中链接",
          power: isPower,
          disabled: !len,
          command: 1,
        },
        {
          label: "所有结果集",
          power: isPower,
          disabled: !this.total,
          command: 2,
        },
      ];
    },
    // 表格背景
    searchClass() {
      if (this.loading) return "";
      if (this.searchStatus) {
        return !this.tableData.length && "nolength";
      } else {
        return "nosearch";
      }
    },
    // 选中链接是否符合条件
    mulEligible() {
      let list = this.multipleSelection;
      let jitList = list.filter((k) => {
        return k.linkDetailJitModeStatus.includes("1");
      }); //选中的链接为JIT链接
      return !!jitList.length;
    },
    // 全部链接是否符合条件
    allEligible() {
      let result = this.allJIT > 0; // 获取全部结果是否存在JIT链接
      return result;
    },
  },
  methods: {
    // 获取列表
    getList() {
      return new Promise((resolve, reject) => {
        let searchOptions = Object.assign(
          {},
          this.searchOptions,
          this.searchParmas
        );
        let reqParams = FetchFun.returnSearchOptions(searchOptions, "post");
        let mapi = this.api.temu.list + reqParams.params;
        this.loading = true;
        this.$http
          .post(mapi, reqParams.data)
          .then(({ data }) => {
            this.tableData = (data.list || []).map((k) => {
              k.storeSyncInventoryStatus = k.syncInventoryStatus; //店铺防超卖
              return k;
            });
            let total = data.total || 0;
            this.total = total;
            total ? resolve(reqParams.data) : reject(false);
          })
          .finally(() => {
            this.searchStatus = true;
            this.loading = false;
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 获取全部结果是否存在JIT链接
    getJitResult(temp) {
      return new Promise((resolve, reject) => {
        this.$http
          .post(this.api.temu.queryJitStatus, temp)
          .then(({ data }) => {
            this.allJIT = data;
            resolve(data || 0);
          })
          .catch(() => {
            resolve(0);
          });
      });
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
      this.jitList = this.multipleSelection.filter((k) => {
        return k.linkDetailJitModeStatus.includes("1");
      });
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
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.searchParmas.sortType = Info[0] || "DESC";
      this.searchParmas.sortField = Info[1] || "sl.shelved_time";
      this.search();
      // 回传
      // this.$emit('getSortInfoAndFetch', Info);
    },
    // item链接跳转
    itemGo(row) {
      row.url && window.open(row.url);
    },
    // 查看详情
    detail(row) {
      // let routerData = this.$router.resolve({
      //   path: "/online-detail",
      //   query: {
      //     platformCode: this.platformCode,
      //     linkId: row.linkId,
      //     commonStoreId: row.commonStoreId
      //   }
      // });
      // window.open(routerData.href, "_blank");
    },
    // 库存管理
    singleAutoClick(row) {
      this.singleAutoData = this.$common.copy(row);
      this.singleAutoVisible = true;
    },
    // 查看日志
    logSee(row) {
      let [temp] = [{}];
      temp.axiosApi = this.api.temu.queryLinkLog;
      temp.axiosType = 'get';
      temp.axiosOptions = {
        linkId: row.id,
        sortField: "gmt_create",
        sortType: "DESC",
      };
      this.logInfo.data = this.$common.copy(temp);
      this.logInfo.visible = true;
    },
    // 设置同步库存
    syncInventorySet(e) {
      if (!e) return;
      this.synchronizeType = e;
      this.synchronizeVisible = true;
    },
    // 同步库存返回
    synchronizeResult(data) {
      this.syncInventoryCommand(this.synchronizeType, data);
    },
    // 同步库存下拉选择
    async syncInventoryCommand(e, data) {
      let [str, num, apiUrl, temp] = ["", 0, "", {}];

      if (e == 1) {
        apiUrl = this.api.temu.updateSyncInventoryForLink;
        temp = this.jitList.map((k) => {
          return k.id;
        });
        num = temp.length;
      } else {
        // if (!this.total) return this.$message.warning("暂无无数据可设置~");
        apiUrl = this.api.temu.updateSyncInventoryForQuery;
        temp = this.$common.removeEmpty(this.searchOptions);
        // num = this.total;
        let dom = this.$refs["synchronizeInventory"];
        dom && (dom.loading = true);
        num = await this.getJitResult(temp);
        dom && (dom.loading = false);
      }
      apiUrl += "?syncInventoryStatus=" + data.type;
      str = data.type == 1 ? "开启" : "关闭";

      this.$confirm(
        `此次修改链接数量：<span style="color:red;">${num}</span> 条`,
        `确认是否批量${str}同步库存`,
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: true,
          closeOnClickModal: false,
        }
      )
        .then(() => {
          if (this.syncInventoryLoading) return;
          this.syncInventoryLoading = true;
          this.$http
            .post(apiUrl, temp)
            .then((res) => {
              this.$message.success("操作成功~");
              this.search();
            })
            .finally(() => {
              this.syncInventoryLoading = false;
            });
        })
        .catch(() => { });
    },
    // 查询
    search() {
      this.searchParmas.pageNum = 1;
      this.getList().then((res) => this.getJitResult(res));
      // 更新子链接列表
      // this.$emit('updateChildList');
    },
    // 修改库存
    editStock(type) {
      if (!["1", "2", "3", "4"].includes(type)) return;
      this.type = type;
      this.inventoryVisible = true;
    },
    // 销量导出
    salesVolumeSet(e) {
      if (!e) return;
      this.exportType = e
      this.saleExportVisible = true
    },
    // 导出区间返回
    getExportTime(data) {
      this.exportCommand(this.exportType, data)
    },
    async exportCommand(e, data) {
      if (!e) return;
      let temp = {};
      if (e == 1) {
        temp.linkIdList = this.multipleSelection.map((k) => k.id);
      } else {
        temp = this.$common.removeEmpty(this.searchOptions);
      }
      temp.exportType = e;
      temp.startExportTime = data.startExportTime
      temp.endExportTime = data.endExportTime
      if (this.salesVolumeLoading) return;
      this.salesVolumeLoading = true;
      this.$http.post(this.api.temu.exportLinkInfo, temp).then((res) => {
        this.$message.success("请在导出查看下载查看导出文件");
        this.$bus.emit('marketing-admin-headDownloadView');
        e == 1 && this.$refs.table.clearSelection();
      }).finally(() => {
        this.salesVolumeLoading = false;
      });
    },
    // copy(e, text) {
    //   copyActiveCode(e, text);
    // },
  },
};
</script>
<style lang="scss" scoped>
.clipboardy {
  cursor: pointer;
  font-size: 14px;
  position: relative;
  color: #515a6e;
}
</style>
