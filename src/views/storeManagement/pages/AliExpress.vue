<template>
  <div class="page-main plr10">
    <!-- 查询 营销授权-->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="110px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="营销授权">
            <dyt-select v-model="searchOptions.authStatusList" multiple>
              <el-option v-for="item in searchGrantStatus" :key="item.value" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺状态" label-width="90px">
            <dyt-select v-model="searchOptions.enable">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺代号" label-width="90px">
            <dyt-textarea v-model="searchOptions.accountCodeList" placeholder="多关键字" />
          </el-form-item>
          <el-form-item label="是否全托管店铺">
            <dyt-select v-model="searchOptions.isFullyManaged">
              <el-option label="是" :value="1" />
              <el-option label="否" :value="0" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="是否半托管店铺">
            <dyt-select v-model="searchOptions.isHalfManaged">
              <el-option label="是" :value="1" />
              <el-option label="否" :value="0" />
            </dyt-select>
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 内容展示栏 begin -->
    <div class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass">
          <el-table-column prop="accountCode" label="店铺代号" min-width="120" align="center" />
          <el-table-column label="平台" min-width="120" align="center">
            <template slot-scope="{ row }">
              <svg class="icon plant-icon" aria-hidden="true">
                <use :xlink:href="'#icon-' + row.platformCode" />
              </svg>
            </template>
          </el-table-column>
          <el-table-column prop="accountName" label="店铺名称" min-width="160" align="center" />
          <el-table-column label="店铺状态" min-width="100" align="center">
            <template slot-scope="{ row }">
              <span v-if="openDownStatus[row.enable]" :style="openDownStatus[row.enable].style">
                {{ openDownStatus[row.enable].label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="account" label="是否全托管店铺" min-width="110" align="center">
            <template slot-scope="{ row }">
              {{ row.isFullyManaged == 1 ? "是" : "否" }}
            </template>
          </el-table-column>
          <el-table-column prop="account" label="是否半托管店铺" min-width="110" align="center">
            <template slot-scope="{ row }">
              {{ row.isHalfManaged == 1 ? "是" : "否" }}
            </template>
          </el-table-column>
          <el-table-column label="营销授权" min-width="120" align="center">
            <template slot-scope="{ row }">
              <div class="flexAllcenter">
                <span v-if="grantStatus[row.authStatus]" :style="grantStatus[row.authStatus].style">
                  {{ grantStatus[row.authStatus].label }}
                </span>
                <span v-if="[0, 2, 3].includes(row.authStatus) &&
                  $common.getPower('shopManagement_aliExpress_delegating')
                  " class="alink" @click="marketAuth(row)">去授权</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="accessTokenExpiresTime" label="授权过期时间" width="150"></el-table-column>
          <el-table-column label="营销功能" width="120" fixed="right" align="center">
            <template slot-scope="{ row }">
              <span v-if="$common.getPower('shopManagement_eliExpress_setting')" class="underline primaryColor"
                @click="setting(row)">
                设置
              </span>
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
    <setting :model-visible.sync="modelVisible" :moduleData="settingInfo" @search="getList" />
  </div>
</template>

<script>
import FetchFun from "@/utils/listPage";
import setting from "./components/aliExpressSetting";
export default {
  name: "StoreManagementAliExpress",
  components: { setting },
  data() {
    return {
      loading: false,
      total: 0,
      tableData: [],
      isExpand: false,
      searchOptions: {
        authStatusList: [],
        enable: 1,
        accountCodeList: [],
        isFullyManaged: null,
        isHalfManaged: null,
        pageNum: 1,
        pageSize: 30,
      },
      grantStatus: {
        0: { label: "未授权", value: 0, style: "color:#F56C6C;" },
        1: { label: "已授权", value: 1 },
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
    searchGrantStatus() {
      let temp = this.$common.copy(this.grantStatus);
      delete temp[2];
      return temp;
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
      let mapi = this.api.storeManagement.eliExpress.list + reqParams.params;
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
          `${this.api.storeManagement.eliExpress.getAuthorizeUrl}?commonStoreId=${row.commonStoreId}`
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
