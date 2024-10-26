<template>
  <div class="page-main plr10">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="70px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="平台">
            <dyt-select v-model="searchOptions.platformCode" :clearable="false">
              <el-option v-for="(item, index) in platformList" :key="index + 'platformCode'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺">
            <dyt-inputSelect v-model="searchOptions.commonStoreIdList" :reset-all="filterType === 'refresh'"
              :multiple="true" :params="{ sLabel: 'labelName', label: 'accountCode', value: 'commonStoreId' }"
              :show-all="true" :list="shopList" />
          </el-form-item>
          <el-form-item label="失败类型">
            <dyt-select v-model="searchOptions.failType">
              <el-option v-for="(item, index) in failTypeList" :key="index + 'status'" :label="item.label"
                :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="修改时间">
            <dyt-timePicker v-model="updateTime" :other-shortcuts="otherShortcuts" @change="updateTimeChange" />
          </el-form-item>
          <el-form-item label="站点">
            <dyt-select v-model="searchOptions.siteCodeList" :multiple="true">
              <el-option v-for="item in stationList" :key="item" :label="item" :value="item" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="ItemID">
            <dyt-textarea v-model="searchOptions.itemIdList" placeholder="请输入ItemID" />
          </el-form-item>
          <el-form-item label="SPU">
            <dyt-textarea v-model="searchOptions.erpSpuList" placeholder="请输入SPU" />
          </el-form-item>
          <el-form-item label="SKU">
            <dyt-textarea v-model="searchOptions.erpSkuList" placeholder="请输入SKU" />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 排序 -->
    <div class="operator-sort">
      <div>
        <div>
          <el-button v-if="power.updateInventory" type="primary" :disabled="!multipleSelection.length"
            @click="editStock('1')">
            修改库存
          </el-button>
          <!-- 修改价格 -->
          <dyt-dropdown :dropdown-list="priceEditList" @commandChange="editStock" />
          <!-- 失败重试 -->
          <dyt-dropdown :dropdown-list="failedRetryList" :loading="failedLoading" title="可根据链接的失败类型进行重试，根据上一次修改失败的任务，重试修改"
            @commandChange="failedRetryCommand" />
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
          <el-table-column type="selection" width="40" />
          <el-table-column label="失败日志" width="70px" fixed>
            <template slot-scope="{ row }">
              <span class="lapa icon-caozuorizhi blueIcon listIcon" @click="logSee(row)" />
            </template>
          </el-table-column>
          <el-table-column label="失败类型" width="100px">
            <template slot-scope="{row}">
              <div v-for="(item, index) in row.errorTypeList" :key="index + 'error'" class="mt4">
                {{ failTypeList[item] && failTypeList[item].label }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="售卖/店铺SPU" min-width="130px">
            <template slot-scope="{ row }">
              <el-link type="primary" :underline="false" class="mb6" @click="detail(row)">
                {{ row.erpSpu || "-" }}
              </el-link>
              <div>{{ row.platformSpu || "-" }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="requireDespatchTime" label="图片/站点" width="120px">
            <template slot-scope="{ row }">
              <preview-image :url="row.mainPictureUrl">
                <span class="mt4">{{ siteExsit[row.siteCode] ? siteExsit[row.siteCode].label : row.siteCode }}</span>
              </preview-image>
            </template>
          </el-table-column>
          <el-table-column prop="warehouseLocationName" label="店铺/ItemId" min-width="130px">
            <template slot-scope="{ row }">
              <span>{{ row.accountCode || '' }}</span>
              <div class="flexCenter mt6">
                <img :src="require('@/assets/images/lian_circle.png')" alt="" style="margin-right: 4px;">
                <span class="itemid" @click="itemGo(row)">{{
                  row.itemId || "-"
                }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="平台" width="130px">
            <template slot-scope="{}">
              <svg class="icon plant-icon" aria-hidden="true">
                <use :xlink:href="'#icon-' + searchOptions.platformCode" />
              </svg>
            </template>
          </el-table-column>
          <el-table-column prop="platformSku" label="店铺SKU" width="140px" />
          <el-table-column prop="linkPrice" label="价格" width="100px">
            <template slot-scope="{row}">
              <span>{{ row.linkPrice }}</span>
              <span v-if="row.linkPrice || row.linkPrice === 0">
                {{ row.currency }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="updatePrice" label="修改价格" width="100px">
            <template slot-scope="{row}">
              <span>{{ row.updatePrice }}</span>
              <span v-if="row.updatePrice || row.updatePrice === 0">
                {{ row.currency }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="linkInventoryQuantity" label="库存" width="100px" />
          <el-table-column prop="updateInventoryQuantity" label="修改库存" width="100px" />
          <el-table-column prop="lastUpdateTime" label="最后一次修改时间" width="130px">
            <template slot-scope="{row}">
              <div class="timeWidth">
                {{ row.lastUpdateTime }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="soldQuantityYesterday" label="失败信息" min-width="150px">
            <template slot-scope="{row}">
              <dyt-popover :content="row.failPriceReason" />
              <dyt-popover class="mt10" :content="row.failInventoryReason" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pageBox">
        <el-pagination :current-page="searchOptions.pageNum" :page-sizes="Globalsize" :page-size="searchOptions.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
    <!-- 编辑价格/库存 -->
    <edit :model-visible.sync="modelVisible" :list="multipleSelection" :type="type"
      :platform-code="searchOptions.platformCode" :search-option="searchOptions" link-type="list" @search="getList" />
    <!-- 日志 -->
    <ebay-common-log v-if="['ebay'].includes(searchOptions.platformCode)" :model-visible.sync="logInfo.visible"
      :request-info="logInfo.data" />
    <common-log v-else :model-visible.sync="logInfo.visible" :request-info="logInfo.data" />
  </div>
</template>

<script>
import FetchFun from '@/utils/listPage';
import edit from "@/views/components/edit";
import previewImage from "@/components/previewImage";
import ebayCommonLog from "@/views/platformOnline/pages/ebay/commonLog";
import commonLog from "@/views/components/commonLog";
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";

let resetParmas = {
  platformCode: 'ebay',
  pageNum: 1,
  pageSize: 30,
  sortField: "esldse.gmt_updated",
  sortType: "DESC",
}
export default {
  name: "PlatformOnlineAbnormalLink",
  components: { previewImage, edit, commonLog, ebayCommonLog },
  data() {
    return {
      loading: false,
      total: 0,
      tableData: [],
      isExpand: false,
      multipleSelection: [],
      searchStatus: false, //是否请求过
      searchOptions: {
        itemIdList: [],
        failType: '',
        updateTimeFrom: "",
        updateTimeTo: "",
        commonStoreIdList: [],
        siteCodeList: [],
        erpSpuList: [],
        erpSkuList: [],
      },
      updateTime: [],
      platformList: [
        {
          label: 'Ebay',
          value: 'ebay',
        },
      ],//平台列表
      failTypeList: {
        0: { label: '修改价格', value: 0 },
        1: { label: '修改库存', value: 1 },
      },
      shopList: [],
      stationList: [],
      sortButtonList: [
        {
          sortHeader: "最后修改时间",
          sortField: "esldse.gmt_updated",
          sortType: "DESC",
          default: true
        }
      ],
      siteExsit: siteExsit,//站点
      modelVisible: false,//修改库存/价格
      type: "", //1 修改库存；修改价格；2按固定值调整，3按数值调整，4按比例调整
      logInfo: { // 日志
        visible: false,
        data: {},
      },
      otherShortcuts: [
        {
          text: "前三天",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: "前一周",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
            picker.$emit('pick', [start, end]);
          }
        },
      ],//日期快捷
      failedLoading: false,//失败计算加载
      filterType: '',
      title: '选中链接包含已锁定价格链接，如需操作改价，先停用价格锁定，再进行操作',
    };
  },
  computed: {
    // 权限
    power() {
      return this.$common.getPower({
        updateInventory: "productOnline_abnormalLink_updateInventory",
        updatePrice: "productOnline_abnormalLink_updatePrice",
        failedRetry: "productOnline_abnormalLink_failedRetry",
      });
    },
    // 失败重试下拉数据
    failedRetryList() {
      let isPower = this.power['failedRetry'];
      let list = this.multipleSelection;
      // 如单个主链接非无状态子链接全部已锁定价格，则该主链接的无状态SKU也限制操作改价（因为没有参照价格了，所以不参与改价）
      // 当存在选中的链接有任意是已锁定价格的，按钮置灰
      let isLockList = list.filter(k => { return k.lockPriceStatus == 1 });//lockPriceStatus 0是未锁定，1是锁定
      let title = list.length && isLockList.length ? this.title : "";
      return [
        {
          label: "失败重试",
          power: isPower,
          disabled: !list.length,
          command: null,
        },
        {
          label: "全部重试",
          power: isPower,
          disabled: !(list.length && !isLockList.length),
          command: 0,
          title: title,
        },
        {
          label: "修改价格重试",
          power: isPower,
          disabled: !(list.length && !isLockList.length),
          command: 1,
          title: title,
        },
        {
          label: "修改库存重试",
          power: isPower,
          disabled: !list.length,
          command: 2,
        },
      ]
    },
    // 修改价格下拉数据
    priceEditList() {
      let isPower = this.power['updatePrice'];
      let list = this.multipleSelection;
      // 如单个主链接非无状态子链接全部已锁定价格，则该主链接的无状态SKU也限制操作改价（因为没有参照价格了，所以不参与改价）
      let isLockList = list.filter(k => { return k.lockPriceStatus == 1 });//lockPriceStatus 0是未锁定，1是锁定
      let title = list.length && isLockList.length ? this.title : "";
      let isDisabled = !(list.length && !isLockList.length);
      return [
        {
          label: "修改价格",
          power: isPower,
          disabled: isDisabled,
          command: '',
          title: title,
        },
        {
          label: "按固定值调整",
          power: isPower,
          disabled: isDisabled,
          command: '2',
          title: title,
        },
        {
          label: "按数值调整",
          power: isPower,
          disabled: isDisabled,
          command: '3',
          title: title,
        },
        {
          label: "按比例调整",
          power: isPower,
          disabled: isDisabled,
          command: '4',
          title: title,
        },
      ]
    },
    searchClass() {
      if (this.loading) return '';
      if (this.searchStatus) {
        return !this.tableData.length && 'nolength';
      } else {
        return 'nosearch';
      }
    }
  },
  created() {
    this.setTime();
    this.init();
  },
  methods: {
    init() {
      this.searchOptions = Object.assign({}, this.searchOptions, resetParmas);

      let platformCode = this.searchOptions.platformCode;
      // 获取店铺列表
      this.$store.dispatch('platformList/getstoreList', { platformCode }).then(list => {
        this.shopList = (list || []).map(k => {
          k.labelName = k.accountCode + '[' + k.account + ']';
          return k;
        });
      })
      // 获取站点列表
      this.$store.dispatch('platformList/getstationList', { platformCode }).then(list => {
        this.stationList = list || [];
      })
    },
    commonList(power, list) {
      let hasPower = this.power[power];
      let len = this.multipleSelection.length;
      let arr = list.map(item => {
        return {
          label: item.label,
          power: hasPower,
          disabled: !len,
          command: item.command
        }
      })
      return arr;
    },
    // 展开或收起
    expand(val) {
      this.isExpand = val.isExpand;
    },
    // 搜索栏按钮处理
    filterBtn(type) {
      let _self = this;
      this.filterType = type;
      let fun = {
        // 查询
        'submit'() {
          _self.search();
        },
        // 重置
        'refresh'() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions, resetParmas);
          _self.setTime();
        }
      }
      type && fun[type] && fun[type]();
    },
    // 设置默认时间
    setTime() {
      let subtractDate = this.$common.dayjs().subtract(2, 'd').format('YYYY-MM-DD');//两天前日期
      let nowDay = this.$common.dayjs().format('YYYY-MM-DD');//当天时间
      let time = [subtractDate, nowDay];
      this.updateTime = time;
      this.updateTimeChange(time);
    },
    // 获取列表
    getList() {
      let searchOptions = this.searchOptions;
      if (FetchFun.validateForm(searchOptions)) return false;
      let reqParams = FetchFun.returnSearchOptions(searchOptions, "post");
      let mapi = this.api.abnormalLink.listUnusualModifiedLink + reqParams.params;
      this.loading = true;
      this.$http.post(mapi, reqParams.data).then(({ data }) => {
        this.tableData = (data.list || []).map(k => {
          k.price = k.linkPrice;//这里赋值是给修改价格用的
          k.inventoryQuantity = k.linkInventoryQuantity;//这里赋值是给修改库存用的
          return k;
        });
        this.total = data.total || 0;
      }).finally(() => {
        this.searchStatus = true;
        this.loading = false;
      })
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
    },
    // 查询
    search() {
      this.searchOptions.pageNum = 1;
      this.getList();
    },
    // 页码切换事件
    handleSizeChange(val) {
      if (FetchFun.validateForm(this.searchOptions)) return false;
      this.searchOptions.pageNum = 1;
      this.searchOptions.pageSize = val;
      this.getList();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      if (FetchFun.validateForm(this.searchOptions)) return false;
      this.searchOptions.pageNum = val;
      this.getList();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.searchOptions.sortType = Info[0] || "DESC";
      this.searchOptions.sortField = Info[1] || "esldse.gmt_updated";
      this.search();
    },
    // 修改时间
    updateTimeChange(e) {
      this.timeChange(e, "updateTimeFrom", "updateTimeTo");
    },
    // 时间切换
    timeChange(e, start, end) {
      if (Array.isArray(e)) {
        [this.searchOptions[start], this.searchOptions[end]] = e;
        this.searchOptions[start] += " 00:00:00";
        this.searchOptions[end] += " 23:59:59";
      } else {
        this.searchOptions[start] = this.searchOptions[end] = "";
      }
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
          platformCode: this.searchOptions.platformCode,
          linkId: row.linkId,
          commonStoreId: row.commonStoreId
        }
      });
      window.open(routerData.href, "_blank");
    },
    // 修改库存
    editStock(type) {
      if (!['1', '2', '3', '4'].includes(type)) return;
      if (!this.multipleSelection.length) {
        this.$message.error("请勾选要修改的数据!");
        return;
      }
      this.type = type;
      this.modelVisible = true;
    },
    // 查看日志
    logSee(row) {
      if (['ebay'].includes(this.searchOptions.platformCode)) {
        this.logInfo.data = this.$common.copy(row);
      } else {
        let [temp] = [{}];
        temp.axiosApi = this.api.ebay.getLinkLog;
        temp.axiosType = 'get';
        temp.axiosOptions = { linkId: row.linkId };
        this.logInfo.data = this.$common.copy(temp);
      }
      this.logInfo.visible = true;
    },
    // 失败重试下拉选择
    failedRetryCommand(e) {
      if (![0, 1, 2].includes(e)) return;
      let temp = {
        0: {
          label: '失败重试',
        },
        1: {
          label: '价格失败重试',
          value: 0,
        },
        2: {
          label: '库存失败重试',
          value: 1,
        }
      };
      let list = this.multipleSelection;
      // 需校验失败类型与重试类型是否一致
      let flag = false;
      list.forEach(k => {
        // errorTypeList 失败类型列表，0：修改价格，1：修改库存
        let errorTypeList = k.errorTypeList || [];
        if (e === 0) {
          let result = errorTypeList.includes(0) || errorTypeList.includes(1);
          !result && (flag = true);
        } else {
          !errorTypeList.includes(temp[e].value) && (flag = true);
        }
      })
      if (flag) return this.$message.error(`选中链接的失败类型无法执行${temp[e].label}`);
      this.$confirm(`是否确认重新执行这 <span style="color:red;">${list.length}条</span> 链接的修改任务?`, temp[e].label, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        let apiUrl = `${this.api.abnormalLink.retryReviseInventory}?type=${e}`;
        let temp = list.map(k => k.linkDetailId);
        this.failedLoading = true;
        this.$http.post(apiUrl, temp).then(() => {
          this.$confirm('操作成功！数据正在同步，可15分钟后刷新查看~', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: false,
            type: 'success',
            showCancelButton: false,
          }).then(() => { }).catch(() => { });
          this.search();
        }).finally(() => {
          this.failedLoading = false;
        })
      }).catch(() => { });
    }
  }
};
</script>
<style lang="scss" scoped></style>
