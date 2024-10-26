<template>
  <div class="page-main plr10">
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="80px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="营销授权">
            <dyt-select v-model="searchOptions.authStatuslist" multiple>
              <el-option v-for="item in grantStatus" :key="item.value" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺状态">
            <dyt-select v-model="searchOptions.enable">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺代号">
            <dyt-textarea v-model="searchOptions.accountCodeList" placeholder="请输入店铺代号" />
          </el-form-item>
          <el-form-item label="账户名">
            <dyt-textarea v-model="searchOptions.accountList" placeholder="账户名" />
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 内容展示栏 -->
    <div class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass">
          <el-table-column prop="accountCode" min-width="180" label="店铺代号" />
          <el-table-column label="平台" width="180">
            <svg class="icon plant-icon table-td-icon" aria-hidden="true">
              <use xlink:href="#icon-temu" />
            </svg>
          </el-table-column>
          <el-table-column prop="account" min-width="180" label="账户名称" />
          <el-table-column label="店铺状态" width="160">
            <template slot-scope="{ row }">
              <span v-if="row.enable == 1">启用</span>
              <span v-else style="color: #f56c6c">停用</span>
            </template>
          </el-table-column>
          <el-table-column label="营销授权" min-width="140">
            <template slot-scope="{ row }">
              <div class="flex-align">
                <span v-if="grantStatus[row.authStatus]" :style="grantStatus[row.authStatus].style">
                  {{ grantStatus[row.authStatus].label }}
                </span>
                <template v-if="$common.getPower('shopManagement_temuHalfPipe_delegating')">
                  <span class="alink" @click="synchronization(row)">{{ row.authStatus === 0 ? '授权' : '重新授权' }}</span>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="accessTokenExpiresTime" label="授权过期时间" min-width="140"></el-table-column>
          <el-table-column label="营销功能" width="160">
            <template slot-scope="{ row }">
              <div class="flex-align">
                <span class="alink" @click="marketSetting(row)"
                  v-if="$common.getPower('shopManagement_temuHalfPipe_setting')">设置</span>
              </div>
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
    <!-- 授权 -->
    <authorize :model-visible.sync="authorizeInfo.visible" :data="authorizeInfo.data" @search="pageSearch" />
    <!-- 设置 -->
    <setting :model-visible.sync="settingVisible" :module-data="rowInfo" :grant-status="grantStatus"
      @search="pageSearch" />
  </div>
</template>

<script>
import FETCH from "@/mixins/fetch";
import authorize from "./temuHalfPipe/authorize";
import setting from "./temuHalfPipe/setting";
export default {
  name: "StoreManagementStoreTemuHalfPipe",
  components: { setting, authorize },
  mixins: [FETCH],
  data() {
    return {
      searchOptions: {
        authStatuslist: [],
        enable: 1,
        accountCodeList: [],
        accountList: [],
        pageNum: 1,
        pageSize: 30,
      },
      resetOption: {
        enable: 1,
      },
      grantStatus: {
        0: { label: "未授权", value: 0, style: "color:#F56C6C;" },
        1: { label: "已授权", value: 1, style: "color:#409EFF;" },
        2: { label: "授权失败", value: 2, style: "color:#F56C6C;" },
        3: { label: "授权失效", value: 3, style: "color:#F56C6C;" },
      },
      settingVisible: false,
      rowInfo: {},
      authorizeInfo: {
        visible: false,
        data: {},
      },
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.mapi = this.api.storeManagement.temuHalfPipe.list;
      this.apiType = "post";
      this.fetch();
    },
    pageSearch() {
      this.fetch();
    },
    // 设置
    marketSetting(row) {
      this.rowInfo = this.$common.copy(row);
      this.settingVisible = true;
    },
    // 授权
    synchronization(row) {
      this.authorizeInfo.data = row;
      this.authorizeInfo.visible = true;
    },
  },
};
</script>
<style lang="scss" scoped>
.el-icon-sty {
  font-weight: bold;
  font-size: 18px;
}

.plant-icon {
  &.table-td-icon {
    width: 1.5em !important;
    height: 1.5em !important;
    font-size: 30px;
  }
}
</style>
