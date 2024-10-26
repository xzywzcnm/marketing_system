<template>
  <div class="page-main plr10">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="80px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="营销授权">
            <dyt-select v-model="searchOptions.walmartAuthStatus">
              <el-option label="全部" :value="''" />
              <el-option v-for="item in grantStatus" :key="item.value" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺状态">
            <dyt-select v-model="searchOptions.enable">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="站点">
            <dyt-select v-model="searchOptions.siteCodeList" :multiple="true">
              <el-option v-for="item in stationList" :key="item" :label="item" :value="item" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺代号">
            <dyt-textarea v-model="searchOptions.accountCodeList" placeholder="店铺代号" />
          </el-form-item>
          <el-form-item label="账户名">
            <dyt-textarea v-model="searchOptions.account" placeholder="账户名" />
          </el-form-item>
          <el-form-item label="自动补货">
            <dyt-select v-model="searchOptions.autoReplenishmentStatus">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="防超卖">
            <dyt-select v-model="searchOptions.syncInventoryStatus">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </dyt-select>
          </el-form-item>
        </dyt-filter>
      </el-form>
    </div>
    <!-- 内容展示栏 begin -->
    <div v-loading="pageLoading" class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass">
          <el-table-column prop="accountCode" label="店铺代号" />
          <el-table-column label="平台" width="200">
            <template slot-scope="{row}">
              <svg class="icon plant-icon" aria-hidden="true">
                <use :xlink:href="'#icon-' + row.platformCode" />
              </svg>
            </template>
          </el-table-column>
          <el-table-column prop="account" label="账户名" />
          <el-table-column prop="siteCode" label="站点">
            <template slot-scope="{row}">
              {{
                siteExsit[row.siteCode]
                ? siteExsit[row.siteCode].label
                : row.siteCode
              }}
            </template>
          </el-table-column>
          <el-table-column label="店铺状态" width="200">
            <template slot-scope="{row}">
              <span :style="{ color: row.enable === 0 ? '#F56C6C' : '' }">{{ [1, '1'].includes(row.enable) ? '启用' : '停用'
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="营销授权" width="160">
            <template slot-scope="{row}">
              <div class="flex-align">
                <span v-if="grantStatus[row.walmartAuthStatus]" :style="grantStatus[row.walmartAuthStatus].style">
                  {{ grantStatus[row.walmartAuthStatus].label }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="autoReplenishmentStatus" label="自动补货" min-width="100">
            <template slot-scope="{row}">
              <span>{{ row.autoReplenishmentStatus == 0 ? '禁用' : '启用' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="syncInventoryStatus" label="防超卖" min-width="100">
            <template slot-scope="{row}">
              <span>{{ row.syncInventoryStatus == 0 ? '禁用' : '启用' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="营销功能" width="160">
            <template slot-scope="{row}">
              <div class="flex-align">
                <span class="alink" @click="setting(row)">设置</span>
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
    <!-- 修改账号密码 -->
    <edit-password :model-visible.sync="modelVisible" :data="passwordInfo" @search="fetch" />
    <!-- 设置 -->
    <walmartSetting :model-visible.sync="settingVisible" :data="settingInfo" :grant-status="grantStatus"
      @search="fetch" />
  </div>
</template> 

<script>
import FETCH from "@/mixins/fetch";
// import previewImage from '@/components/previewImage';
import editPassword from './components/editPassword';
import { siteExsit } from "@/views/marketingStrategy/pages/components/fileData.js";
import walmartSetting from './components/walmartSetting';

export default {
  name: "StoreManagementWalmart",
  components: { editPassword, walmartSetting },
  mixins: [FETCH],
  data() {
    return {
      searchOptions: {
        enable: 1,
        walmartAuthStatus: '',
        siteCodeList: [],
        accountCodeList: [],
        account: [],
        pageNum: 1,
        pageSize: 30,
        autoReplenishmentStatus: '',
        syncInventoryStatus: ''
      },
      resetOption: {
        enable: 1,
        walmartAuthStatus: '',
      },
      grantStatus: {
        1: { label: "已授权", value: 1, style: "color:#409EFF;" },
        0: { label: "未授权", value: 0, style: "color:#F56C6C;" },
        3: { label: "授权过期", value: 3, style: "color:#F56C6C;" },
      },
      modelVisible: false,
      settingVisible: false,
      passwordInfo: {},
      stationList: [],
      siteExsit: siteExsit,
      platformCode: 'walmart',//平台
      settingInfo: {},
    }
  },
  created() {
    this.isShow = true;//搜索默认张开
    this.init();
  },
  methods: {
    init() {
      // this.fetch(this.api.storeManagement.walmartqueryAll, "post");
      this.mapi = this.api.storeManagement.walmartqueryAll;
      this.apiType = "post";
      let platformCode = this.platformCode;
      // 获取站点列表
      this.$store
        .dispatch("platformList/getstationList", { platformCode })
        .then((list) => {
          this.stationList = list || [];
        });
    },
    // 修改账号密码
    editPass(row) {
      this.modelVisible = true;
      this.passwordInfo = this.$common.copy(row || {});
    },
    // 验证授权
    verifyAuth(row) {
      this.loading = true;
      this.$http.post(`${this.api.storeManagement.checkAccount}?commonStoreId=${row.commonStoreId}`).then((res) => {
        let obj = { 0: { message: "授权验证失败!", type: "error" }, 1: { message: "授权验证成功!", type: "success" } };
        let data = res.data;
        obj[data] ? this.$message[obj[data].type](obj[data].message) : this.$message.error("异常错误!");
        this.fetch();
      }).finally(() => {
        this.loading = false;
      })
    },
    // 同步链接
    synchronization(row) {
      this.pageLoading = true;
      this.$http.post(`${this.api.storeManagement.updataCommonLink}?commonStoreId=${row.commonStoreId}`).then(res => {
        this.$confirm('操作成功，正在同步，需要 15 到 45 分钟沃尔玛才能生成,可后刷新列表!', '提示', {
          confirmButtonText: '确定',
          showCancelButton: false,
          type: 'success'
        }).then(() => { }).catch(() => { });
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 设置
    setting(row) {
      this.settingInfo = this.$common.copy(row);
      this.settingVisible = true;
      //  判断自动补货功能是否开启，如果开启定死状态值为1
      if (this.settingInfo.autoReplenishmentStatus > 1) {
        this.settingInfo.autoReplenishmentStatus = 1
      }
    }
  },
}
</script>

<style lang="scss" scoped></style>