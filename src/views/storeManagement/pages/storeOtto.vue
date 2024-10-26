<template>
  <div class="page-main plr10">
    <div class="search-content">
      <el-form
        :inline="true"
        :model="searchOptions"
        label-width="80px"
        class="form-search"
      >
        <dyt-filter :filter-row="1" @operation="filterBtn" @expand="expand">
          <el-form-item label="营销授权">
            <dyt-select v-model="searchOptions.authStatusList" :multiple="true">
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
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="店铺代号">
            <dyt-textarea
              v-model="searchOptions.accountCodeList"
              placeholder="请输入店铺代号"
            />
          </el-form-item>
          <el-form-item label="账户名">
            <dyt-textarea
              v-model="searchOptions.accountList"
              placeholder="账户名"
            />
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
            min-width="120"
            label="店铺代号"
            align="center"
          />
          <el-table-column label="平台" min-width="130" align="center">
            <svg class="icon plant-icon" aria-hidden="true">
              <use xlink:href="#icon-otto" />
            </svg>
          </el-table-column>
          <el-table-column
            prop="account"
            min-width="200"
            label="账户名"
            align="center"
          />
          <el-table-column label="店铺状态" min-width="120" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.enable == 1">启用</span>
              <span v-else style="color: #f56c6c">停用</span>
            </template>
          </el-table-column>
          <el-table-column label="营销授权" min-width="120" align="center">
            <template slot-scope="{ row }">
              <div class="flexAllcenter">
                <span
                  v-if="grantStatus[row.authStatus]"
                  :style="grantStatus[row.authStatus].style"
                >
                  {{ grantStatus[row.authStatus].label }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="营销功能" min-width="100" align="center">
            <template slot-scope="{ row }">
              <div class="flexAllcenter">
                <span class="alink" @click="marketSetting(row)">设置</span>
              </div>
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
    <ottoSetting
      :model-visible.sync="settingVisible"
      :module-data="rowInfo"
      :grant-status="grantStatus"
      @search="fetch"
    />
  </div>
</template>

<script>
import FETCH from "@/mixins/fetch";
import ottoSetting from "./components/ottoSetting";
export default {
  name: "StoreManagementStoreOtto",
  components: { ottoSetting },
  mixins: [FETCH],
  data() {
    return {
      searchOptions: {
        enable: 1,
        authStatusList: [],
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
      },
      settingVisible: false,
      rowInfo: {},
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.mapi = this.api.storeManagement.otto.list;
      this.apiType = "post";
    },
    marketSetting(row) {
      this.rowInfo = this.$common.copy(row);
      this.settingVisible = true;
    },
  },
};
</script>