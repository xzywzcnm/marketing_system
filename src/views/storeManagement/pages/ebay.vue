<template>
  <div class="page-main plr10">
    <!-- 查询 营销授权-->
    <div class="search-content">
      <el-form
        :inline="true"
        :model="searchOptions"
        label-width="90px"
        class="form-search"
      >
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="营销授权">
            <dyt-select v-model="searchOptions.authStatusList" multiple>
              <el-option
                v-for="item in grantStatus"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺状态">
            <dyt-select v-model="searchOptions.enable">
              <el-option
                v-for="(item, index) in openDownStatus"
                :key="index + 'enable'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺代号">
            <dyt-textarea
              v-model="searchOptions.accountCodeList"
              placeholder="多关键字"
            />
          </el-form-item>
          <el-form-item label="账户名">
            <dyt-textarea
              v-model="searchOptions.accountList"
              placeholder="多关键字"
            />
          </el-form-item>
          <el-form-item label="付款订阅">
            <dyt-select v-model="searchOptions.fixedPriceTransactionStatus">
              <el-option
                v-for="(item, index) in openDownStatus"
                :key="index + 'fixedPriceTransactionStatus'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="自动补货">
            <dyt-select v-model="searchOptions.autoReplenishmentStatus">
              <el-option
                v-for="(item, index) in openDownStatus"
                :key="index + 'autoReplenishmentStatus'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="防超卖">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option
                v-for="(item, index) in openDownStatus"
                :key="index + 'syncInventoryStatus'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
          <el-form-item label="盲盒自动下架" label-width="96px">
            <dyt-select v-model="searchOptions.autoShelveBlindBoxStatus">
              <el-option
                v-for="(item, index) in openDownStatus"
                :key="index + 'autoShelveBlindBoxStatus'"
                :label="item.label"
                :value="item.value"
              />
            </dyt-select>
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 内容展示栏 begin -->
    <div class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table
          ref="table"
          v-loading="loading"
          :data="tableData"
          height="100%"
          border
          :class="searchClass"
        >
          <el-table-column
            prop="accountCode"
            label="店铺代号"
            min-width="120"
          />
          <el-table-column label="平台" width="160">
            <template slot-scope="{ row }">
              <svg class="icon plant-icon" aria-hidden="true">
                <use :xlink:href="'#icon-' + row.platformCode" />
              </svg>
            </template>
          </el-table-column>
          <el-table-column prop="account" label="账户名" min-width="160" />
          <el-table-column label="店铺状态" width="120">
            <template slot-scope="{ row }">
              <span
                v-if="openDownStatus[row.enable]"
                :style="openDownStatus[row.enable].style"
              >
                {{ openDownStatus[row.enable].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="付款订阅" width="120">
            <template slot-scope="{ row }">
              <span v-if="openDownStatus[row.fixedPriceTransactionStatus]">
                {{ openDownStatus[row.fixedPriceTransactionStatus].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="自动补货" width="120">
            <template slot-scope="{ row }">
              <span v-if="openDownStatus[row.autoReplenishmentStatus]">
                {{ openDownStatus[row.autoReplenishmentStatus].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="防超卖" width="120">
            <template slot-scope="{ row }">
              <span v-if="openDownStatus[row.syncInventoryStatus]">
                {{ openDownStatus[row.syncInventoryStatus].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="盲盒自动下架" width="120">
            <template slot-scope="{ row }">
              <span v-if="openDownStatus[row.autoShelveBlindBoxStatus]">
                {{ openDownStatus[row.autoShelveBlindBoxStatus].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="营销授权" width="140">
            <template slot-scope="{ row }">
              <div class="flex-align">
                <span
                  v-if="grantStatus[row.authStatus]"
                  :style="grantStatus[row.authStatus].style"
                >
                  {{ grantStatus[row.authStatus].label }}
                </span>
                <span
                  v-if="
                    [0, 2, 3].includes(row.authStatus) &&
                    $common.getPower('shopManagement_ebay_delegating')
                  "
                  class="alink"
                  @click="marketAuth(row)"
                  >去授权</span
                >
                <!-- 授权状态=已授权，支持再次授权 -->
                <span
                  v-if="
                    [1].includes(row.authStatus) &&
                    $common.getPower('shopManagement_ebay_delegating')
                  "
                  class="alink"
                  @click="marketAuth(row)"
                  >重新授权</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="effectiveTime"
            label="营销授权有效期"
            width="160"
          />
          <el-table-column label="营销功能" width="100" fixed="right">
            <template slot-scope="{ row }">
              <span
                v-if="$common.getPower('shopManagement_ebay_install')"
                class="alink"
                @click="setting(row)"
              >
                设置
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pageBox">
        <el-pagination
          :current-page="searchOptions.pageNum"
          :page-sizes="Globalsize"
          :page-size="searchOptions.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 修改账号密码 -->
    <setting
      :model-visible.sync="modelVisible"
      :data="settingInfo"
      :grant-status="grantStatus"
      @search="getList"
    />
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import setting from "./components/setting";
export default {
  name: "StoreManagementEbay",
  components: { setting },
  data() {
    return {
      loading: false,
      total: 0,
      tableData: [],
      isExpand: false,
      searchOptions: {
        platformCode: "ebay",
        authStatusList: [],
        enable: 1,
        accountCodeList: [],
        accountList: [],
        fixedPriceTransactionStatus: "",
        autoReplenishmentStatus: "",
        syncInventoryStatus: "",
        autoShelveBlindBoxStatus: "",
        pageNum: 1,
        pageSize: 30,
      },
      grantStatus: {
        0: { label: "未授权", value: 0, style: "color:#F56C6C;" },
        1: { label: "已授权", value: 1, style: "color:#409EFF;" },
        2: { label: "授权失败", value: 2, style: "color:#F56C6C;" },
        3: { label: "授权过期", value: 3, style: "color:#F56C6C;" },
      },
      openDownStatus: {
        0: { label: "禁用", value: 0, style: "color:#F56C6C;" },
        1: { label: "启用", value: 1 },
      },
      modelVisible: false,
      settingInfo: {},
      searchStatus: false,
    };
  },
  computed: {
    searchClass() {
      if (this.loading) return "";
      if (this.searchStatus) {
        return !this.tableData.length && "nolength";
      } else {
        return "nosearch";
      }
    },
  },
  created() {
    this.getList();
  },
  methods: {
    search() {
      this.searchOptions.pageNum = 1;
      this.getList();
    },
    // 获取列表
    getList() {
      let searchOptions = this.searchOptions;
      let reqParams = FetchFun.returnSearchOptions(searchOptions, "post");
      let mapi = this.api.storeManagement.query + reqParams.params;
      this.loading = true;
      this.$http
        .post(mapi, reqParams.data)
        .then(({ data }) => {
          this.tableData = data.list || [];
          this.total = data.total || 0;
        })
        .finally(() => {
          this.searchStatus = true;
          this.loading = false;
        });
    },
    // 页码切换事件
    handleSizeChange(val) {
      this.searchOptions.pageSize = val;
      this.search();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      this.searchOptions.pageNum = val;
      this.getList();
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
        submit() {
          _self.search();
        },
        // 重置
        refresh() {
          _self.searchOptions = FetchFun.reset(_self.searchOptions, {
            enable: 1,
            platformCode: "ebay",
          });
        },
      };
      type && fun[type] && fun[type]();
    },
    // 营销授权
    marketAuth(row) {
      this.loading = true;
      this.$http
        .post(
          `${this.api.storeManagement.getAuthorizeUrl}?commonStoreId=${row.commonStoreId}`
        )
        .then((res) => {
          if (!res.data) {
            this.$message.error("店铺id不存在，请检查!");
            return;
          }
          window.open(res.data);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 设置
    setting(row) {
      this.settingInfo = this.$common.copy(row);
      this.modelVisible = true;
    },
  },
};
</script>
<style lang="scss" scoped>
.el-icon-sty {
  font-weight: bold;
  font-size: 18px;
}
</style>
