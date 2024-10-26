<template>
  <div class="dialog-content">
    <el-dialog title="执行异常数据" :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false">
      <div v-loading="pageLoading" class="content">
        <div class="dialog-search">
          <el-form ref="dialogForm" label-width="100px" :model="formData" :inline="true" class="dialog-form form-search">
            <el-form-item label="店铺" prop="commonStoreIdList">
              <dyt-select v-model="formData.commonStoreIdList" :multiple="true" placeholder="请选择店铺">
                <el-option
                  v-for="(item, index) in shopList"
                  :key="index + 'store'"
                  :label="item.accountCode"
                  :value="item.commonStoreId"
                />
              </dyt-select>
            </el-form-item>
            <el-form-item label="执行时间" prop="createdTime">
              <dyt-timePicker v-model="formData.createdTime" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
            <el-form-item label="操作人" prop="updateByList">
              <dyt-select v-model="formData.updateByList" :multiple="true" placeholder="请选择操作人">
                <el-option
                  v-for="(item, index) in sysAllUserData"
                  :key="index + 'updateBy'"
                  :label="item.userName"
                  :value="item.userId"
                />
              </dyt-select>
            </el-form-item>
            <el-form-item label="修改异常内容" prop="updateErrorContent">
              <el-input v-model="formData.updateErrorContent" placeholder="请输入修改异常内容，支持模糊查询" />
            </el-form-item>
            <el-form-item label="修改类型" prop="updateTypeList">
              <dyt-select v-model="formData.updateTypeList" :multiple="true" placeholder="请选择修改类型">
                <el-option
                  v-for="(item, index) in Object.values(updateTypeData)"
                  :key="index + 'type'"
                  :label="item.label"
                  :value="item.value"
                />
              </dyt-select>
            </el-form-item>
            <el-form-item label="平台SKU" prop="platformSkuList">
              <dyt-textarea v-model="formData.platformSkuList" placeholder="请输入平台SKU" />
            </el-form-item>
          </el-form>
          <div class="search-buttons">
            <el-button icon="el-icon-search" type="primary" :disabled="tableLoading" @click="searchData(true)">
              查 询
            </el-button>
            <el-button icon="el-icon-refresh-left" @click="resetSearch">
              重 置
            </el-button>
            <el-button type="primary" :disabled="exportLoading" @click="exportData">
              导 出
            </el-button>
          </div>
        </div>
        <el-table
          ref="dialogTable"
          v-loading="tableLoading"
          :data="tableData"
          :border="true"
          :height="500"
        >
          <el-table-column
            prop="type"
            label="修改类型"
            width="150"
            align="center"
          />
          <el-table-column
            prop="accountCode"
            label="店铺"
            width="150"
            align="center"
          />
          <el-table-column
            prop="platformSku"
            label="平台SKU"
            width="150"
            align="center"
          />
          <el-table-column
            prop="content"
            label="修改异常内容"
            min-width="150"
            align="center"
          >
            <template slot-scope="scope">
              <div style="display: inline-block;text-align: left;">
                {{ scope.row.content }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="gmtCreate"
            label="执行时间"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.gmtCreate }}
            </template>
          </el-table-column>
          <el-table-column
            prop="createBy"
            label="操作人"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.createBy }}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="dialog-pagination"
          :current-page="formData.pageNum"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="Globalsize"
          :page-size="formData.pageSize"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      <div slot="footer" class="dialog-footer flexJustEnd">
        <el-button @click="closeDialog">
          关 闭
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { updateTypeJson } from '@/utils/staticDataOrigin';
const addUrlKey = ['sortField','sortType','pageNum','pageSize'];

export default {
  name: "AbnormalData",
  props: {
    shopList: {type: Array, default: () => { return [] }},
    visibleDialog: {type: Boolean, default: false },
  },
  data() {
    return {
      pageLoading: false,
      tableLoading: false,
      dialogVisible: false,
      exportLoading: false,
      formData: {
        sortField: 'osll.gmt_create',
        sortType: 'DESC',
        pageNum: 1,
        pageSize: 20,
        commonStoreIdList: [],
        updateTypeList: [],
        platformSkuList: [],
        updateByList: [],
        updateErrorContent: null,
        startCreatedTime: null,
        endCreatedTime: null,
        createdTime: [],
      },
      tableData: [],
      total: 0,
      sysAllUserData: [],
      updateTypeData: updateTypeJson
    }
  },
  computed: {
    userInfo () {
      const info = this.$store.getters['userInfo'];
      if (this.$common.isEmpty(info)) return {};
      return info;
    },
    userId () {
      if (this.$common.isEmpty(this.userInfo)) return '';
      if (this.$common.isEmpty(this.userInfo.userId)) {
        if (this.$common.isEmpty(this.userInfo.securityUser)) return '';
        return this.userInfo.securityUser.id;
      }
      return this.userInfo.userId
    },
    erpUserId () {
      if (this.$common.isEmpty(this.userInfo) || this.$common.isEmpty(this.userInfo.securityUser)) return '';
      return this.userInfo.securityUser.erpUserId;
    }
  },
  watch: {
    visibleDialog: {
      immediate: true,
      deep: true,
      handler (val) {
        this.dialogVisible = val;
        if (!val) return;
        this.$nextTick(() => {
          this.initData().then(() => {
            this.searchData();
          })
        })
      }
    },
    dialogVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$emit('update:visibleDialog', val);
        if (!val) {
          this.formData.pageNum = 1;
          this.formData.pageSize = 20;
        }
      }
    },
  },
  created() {},
  methods: {
    initData () {
      this.pageLoading = true;
      return new Promise((resolve) => {
        this.$common.promiseAll([
          this.resetSearch,
          this.getSysUserData
        ]).then(resArr => {
          // console.log(resArr);
        }).finally(() => {
          this.pageLoading = false;
          resolve(true);
        })
      })
    },
    // 查询表格数据
    searchData (isRestPageNum = false) {
      if (this.tableLoading) return;
      if (isRestPageNum) {
        this.formData.pageNum = 1;
      }
      this.tableLoading = true;
      this.$nextTick(() => {
        const params = this.getParams();
        this.$http.post(`${this.api.otto.listUpdateErrorLogs}${params.addUrl}`, params.data).then(res => {
          if (res.status != 200 || !res.data) return;
          this.tableData = res.data.list || [];
          this.total = res.data.total;
          this.tableLoading = false;
        }).catch(() => {
          this.tableData = [];
          this.total = 0;
          this.tableLoading = false;
        })
      })
    },
    // 返回搜索条件
    getParams () {
      let formData = this.$common.copy(this.formData);
      if (!this.$common.isEmpty(formData.createdTime)) {
        formData.startCreatedTime = formData.createdTime[0];
        formData.endCreatedTime = formData.createdTime[1];
      }
      delete formData.createdTime;
      let addUrl = '';
      addUrlKey.forEach((key, index) => {
        addUrl = index == 0 ? `?${key}=${formData[key]}` : `${addUrl}&${key}=${formData[key]}`;
        delete formData[key];
      });
      return {
        addUrl: addUrl,
        data: formData
      };
    },
    // 获取所有人员
    getSysUserData () {
      return new Promise((resolve) => {
        if (!this.$common.isEmpty(this.sysAllUserData)) return resolve(this.sysAllUserData);
        this.sysAllUserData = [];
        this.$http.get(this.api.common.listSysUserNames).then((res) => {
          if (res.status != 200) return resolve([]);
          this.sysAllUserData = res.data || [];
          resolve(this.sysAllUserData);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 导出
    exportData () {
      if (this.exportLoading) return;
      this.exportLoading = true;
      const params = this.getParams();
      this.$http.post(this.api.otto.exportUpdateErrorLogs, params.data).then(res => {
        if (res.status != 200) return;
        this.$message.success("请在导出查看下载查看导出文件");
        this.$bus.emit('marketing-admin-headDownloadView');
      }).finally(() => {
        this.exportLoading = false;
      })
    },
    // 重置
    resetSearch () {
      return new Promise((resolve) => {
        this.$refs.dialogForm && this.$refs.dialogForm.resetFields();
        this.$nextTick(() => {
          const endDate = this.$common.dayjs();
          this.formData.createdTime = [endDate.add(-3, 'day').format('YYYY-MM-DD HH:mm:ss'), endDate.format('YYYY-MM-DD HH:mm:ss')];
          this.formData.updateByList = [this.userId];
          resolve(true);
        })
      })
    },
    // 页码切换事件
    handleSizeChange (val) {
      this.formData.pageNum = 1;
      this.formData.pageSize = val;
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 页数切换事件
    handleCurrentChange (val) {
      this.formData.pageNum = val;
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 关闭弹窗
    closeDialog () {
      this.dialogVisible = false;
    }
  }
}
</script>
<style lang="less" scoped>
.dialog-search{
  display: flex;
  .dialog-form{
    display: inline-block;
    max-width: calc(100% - 255px);

  }
}
.dialog-pagination{
  margin-top: 10px;
  text-align: right;
}
</style>
<style lang="less">
#app {
  .dialog-search{
    .dialog-form{
      &.form-search{
        .el-form-item__content,
        .el-select,
        .el-date-editor{
          width: 300px;
        }
      }
    }
  }
}
</style>
