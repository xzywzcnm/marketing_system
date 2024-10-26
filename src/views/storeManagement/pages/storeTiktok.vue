<template>
  <div class="page-main plr10">
    <!-- 查询 -->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="80px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="营销授权">
            <dyt-select v-model="searchOptions.walmartAuthStatus" multiple>
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
            <dyt-textarea v-model="searchOptions.accountCodeList" placeholder="店铺代号" />
          </el-form-item>
          <el-form-item label="账户名">
            <dyt-textarea v-model="searchOptions.accountList" placeholder="账户名" />
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
            <svg class="icon plant-icon" aria-hidden="true">
              <use :xlink:href="'#icon-tiktok'" />
            </svg>
          </el-table-column>
          <el-table-column prop="account" label="账户名" />
          <el-table-column label="店铺状态" width="200">
            <template slot-scope="{row}">
              <span :style="{ color: row.enable === 0 ? '#F56C6C' : '#409EFF' }">{{ [1, '1'].includes(row.enable) ? '启用' : '停用'
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="营销授权" width="160">
            <template slot-scope="{row}">
              <div class="flex-align">
                <span v-if="grantStatus[row.authStatus]" :style="grantStatus[row.authStatus].style">
                  {{ grantStatus[row.authStatus].label }}
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
                <span v-if="power.setting" class="alink" @click="setting(row)">设置</span>
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
    <!-- 设置 -->
    <tiktokSetting :model-visible.sync="settingVisible" :module-data="settingInfo" @search="fetch" />
  </div>
</template> 

<script>
import FETCH from "@/mixins/fetch";
import tiktokSetting from "./components/tiktokSetting.vue"
export default {
  name: "StoreManagementTiktok",
  components: { tiktokSetting  },
  mixins: [FETCH],
  data() {
    return {
      searchOptions: {
        enable: 1,
        walmartAuthStatus: '',
        accountCodeList: [],
        accountList: [],
        pageNum: 1,
        pageSize: 30,
        sortField:'',
        sortType:'',
        autoReplenishmentStatus: '',
        syncInventoryStatus: ''
      },
      resetOption: {
        enable: 1,
        authStatus: '',
      },
      grantStatus: {
        1: { label: "已授权", value: 1, style: "color:#409EFF;" },
        0: { label: "未授权", value: 0, style: "color:#F56C6C;" },
        3: { label: "授权过期", value: 3, style: "color:#F56C6C;" },
        2: { label: "授权失败", value: 2, style: "color:#F56C6C;" },
      },
      settingVisible: false,
      platformCode: 'tiktok',//平台
      settingInfo: {},
    }
  },
  computed: {
    // 权限
    power() {
      return this.$common.getPower({
        setting: "shopManagement_tiktok_setting"
      });
    },
  },
  created() {
    this.isShow = true;//搜索默认张开
    this.init();
  },
  methods: {
    init() {
      this.mapi = this.api.storeManagement.tiktok_Query;
      this.apiType = "post";
    },
    // 设置
    setting(row) {
      this.settingInfo = row
      this.settingVisible = true
    }
  },
}
</script>

<style lang="scss" scoped></style>