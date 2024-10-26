<template>
  <div class="page-main plr10">
    <!-- 查询 营销授权-->
    <div class="search-content">
      <el-form :inline="true" :model="searchOptions" label-width="80px" class="form-search">
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="营销授权">
            <dyt-select v-model="searchOptions.authStatus">
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
        </dyt-filter>
      </el-form>
    </div>
    <!-- 内容展示栏 begin -->
    <div class="mainContent">
      <div class="tableWrap table-maxheight">
        <el-table ref="table" v-loading="loading" :data="tableData" height="100%" border :class="searchClass">
          <el-table-column prop="accountCode" min-width="150" label="店铺代号" />
          <el-table-column label="平台" width="180">
            <svg class="icon plant-icon table-td-icon" aria-hidden="true">
              <use xlink:href="#icon-temu" />
            </svg>
          </el-table-column>
          <el-table-column prop="account" min-width="150" label="店铺名称" />
          <el-table-column label="店铺状态" width="200">
            <template slot-scope="{ row }">
              <span>{{ [1, "1"].includes(row.enable) ? "启用" : "停用" }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="erpEffectiveTime" label="授权有效期" width="160" /> -->
          <el-table-column label="营销授权" width="160">
            <template slot-scope="{ row }">
              <div class="flex-align">
                <span v-if="grantStatus[row.authStatus]" :style="grantStatus[row.authStatus].style">
                  {{ grantStatus[row.authStatus].label }}
                </span>
                <!-- <span v-if="row.authStatus == 1 && $common.getPower('shopManagement_ebay_synchronization')"
                  class="alink" @click="synchronization(row)">同步</span> -->
              </div>
            </template>
          </el-table-column>
          <el-table-column label="营销功能" width="160">
            <template slot-scope="{ row }">
              <div class="flex-align">
                <span class="alink" @click="marketSetting(row)">设置</span>
                <!-- <span v-if="row.authStatus == 1 && $common.getPower('shopManagement_ebay_synchronization')"
                  class="alink" @click="synchronization(row)">同步</span> -->
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="effectiveTime" label="营销授权有效期" width="160" /> -->
        </el-table>
      </div>
      <div class="pageBox">
        <el-pagination :current-page="searchOptions.pageNum" :page-sizes="Globalsize" :page-size="searchOptions.pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 修改账号密码 -->
    <temuSetting :model-visible.sync="settingVisible" :module-data="rowInfo" :grant-status="grantStatus"
      @search="pageSearch" />
  </div>
</template>

<script>
import FETCH from "@/mixins/fetch";
// import previewImage from '@/components/previewImage';
import temuSetting from "./components/temuSetting";
export default {
  name: "StoreManagementStoreTemu",
  components: { temuSetting },
  mixins: [FETCH],
  data() {
    return {
      searchOptions: {
        enable: 1,
        authStatus: null,
        accountCodeList: [],
        pageNum: 1,
        pageSize: 30,
      },
      resetOption: {
        enable: 1,
        authStatus: null,
        accountCodeList: [],
      },
      grantStatus: {
        0: { label: "未授权", value: 0, style: "color:#F56C6C;" },
        1: { label: "已授权", value: 1, style: "color:#409EFF;" },
        2: { label: "授权失败", value: 2, style: "color:#F56C6C;" },
        3: { label: "授权过期", value: 3, style: "color:#F56C6C;" },
      },
      settingVisible: false,
      rowInfo: {},
    };
  },
  created() {
    this.isShow = true; //搜索默认张开
    this.init();
  },
  methods: {
    init() {
      this.mapi = this.api.storeManagement.temu_Query;
      this.apiType = "post";
    },
    pageSearch() {
      this.fetch();
    },
    // temu 设置
    marketSetting(row) {
      this.rowInfo = this.$common.copy(row);
      this.$nextTick(() => {
        this.settingVisible = true;
      });
    },
    // 同步链接
    synchronization(row) {
      this.pageLoading = true;
      this.$http
        .post(this.api.storeManagement.getSellerList, [row.id])
        .then((res) => {
          this.$confirm(
            "操作成功，正在同步，需要 15 分钟才能生成,可后刷新列表!",
            "提示",
            {
              confirmButtonText: "确定",
              showCancelButton: false,
              type: "success",
            }
          )
            .then(() => { })
            .catch(() => { });
        })
        .finally(() => {
          this.pageLoading = false;
        });
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
