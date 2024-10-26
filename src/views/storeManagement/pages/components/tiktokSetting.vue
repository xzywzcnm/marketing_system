<template>
    <div class="dialog-content">
        <el-dialog title="设置" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false" class="settingPage">
            <div v-loading="loading" style="padding: 0 20px 0 0;">
                <el-form ref="formValidate" :model="formData" :rules="rules" label-width="130px">
                    <el-form-item label="店铺代号:" prop="accountCode">
                        <el-input v-model="detail.accountCode" disabled />
                    </el-form-item>
                    <el-form-item label="账号名:" prop="account">
                        <el-input v-model="detail.account" disabled />
                    </el-form-item>
                    <el-form-item label="授权状态:">
                        {{ [1, '1'].includes(detail.authStatus) ? '已授权' : '未授权' }}
                    </el-form-item>

                    <el-form-item label="防超卖:" prop="syncInventoryStatus">
                        <el-radio-group v-model="formData.syncInventoryStatus" @change="inventoryStatusChange">
                        <el-radio :label="1">启用</el-radio>
                        <el-radio :label="0">禁用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <div v-if="[1, '1'].includes(formData.syncInventoryStatus)" class="replenishment-content">
                        <el-form-item v-if="inventoryList.length > 0" label="链接状态:" prop="syncInventoryGoodsStatusList">
                        <el-checkbox-group v-model="formData.syncInventoryGoodsStatusList"
                            @change="checkboxChange('syncInventoryGoodsStatusList')">
                            <el-checkbox v-for="(item, index) in inventoryList" :key="`item-${index}`" :label="item.value"
                            :disabled="[0, '0'].includes(item.value)">
                            {{ item.label }}
                            </el-checkbox>
                        </el-checkbox-group>
                        </el-form-item>
                    </div>

                    <el-form-item label="自动开启补货:" prop="autoReplenishmentStatus">
                        <el-radio-group v-model="formData.autoReplenishmentStatus" @change="autoReplenishmentChange">
                        <el-radio :label="1">
                            启用
                        </el-radio>
                        <el-radio :label="0">
                            禁用
                        </el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <div v-if="[1, '1'].includes(formData.autoReplenishmentStatus)" class="replenishment-content">
                        <el-form-item v-if="checkLinkList.length > 0" label="链接状态:" prop="autoReplenishmentGoodsStatusList">
                        <el-checkbox-group v-model="formData.autoReplenishmentGoodsStatusList"
                            @change="checkboxChange('autoReplenishmentGoodsStatusList')">
                            <el-checkbox v-for="(item, index) in checkLinkList" :key="`item-${index}`" :label="item.value">
                            {{ item.label }}
                            </el-checkbox>
                        </el-checkbox-group>
                        </el-form-item>
                        <el-form-item label="补货保持量:" prop="autoReplenishment">
                        <el-input v-model="formData.autoReplenishment" placeholder="请输入大于零的整数" />
                        </el-form-item>
                    </div>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" :loading="loading" @click="handleForm('formValidate')">
                确定
                </el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { getSalesStatus } from '@/utils/staticDataOrigin';
export default {
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default() { return {} }
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      disabledEdit: false,
      inventoryList: getSalesStatus(['1', '2', '3', '4', '5', '6']),
      checkLinkList: getSalesStatus(['1', '2', '3', '4', '5', '7']),
      formData:{
        syncInventoryStatus: 0,
        autoReplenishmentStatus: 0,
        autoReplenishmentGoodsStatusList: [],
        autoReplenishment: '',
        syncInventoryGoodsStatusList: [0],
      },
      rules: {
        syncInventoryStatus: [
          { required: true, message: '请选择防超卖', trigger: 'change' }
        ],
        autoReplenishmentStatus: [
          { required: true, message: '请选择自动开启补货', trigger: 'change' }
        ],
        autoReplenishment: [
          { required: true, validator: this.verificationInteger, trigger: 'blur' },
          { required: true, validator: this.verificationInteger, trigger: 'change' }
        ],
        syncInventoryGoodsStatusList: [
          { required: true, message: '请选择筛选链接状态', trigger: 'change' }
        ],
        autoReplenishmentGoodsStatusList: [
          { required: true, message: '请选择筛选链接状态', trigger: 'change' }
        ],
      },
      detail:{},
    }
  },
  watch: {
    modelVisible(val) {
      this.dialogVisible = val;
      val && this.initPage();
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:modelVisible', val);
        this.$refs['formValidate'].resetFields();
      }
    }
  },
  methods: {
    getStoreDetail() { // 获取店铺详情
      return new Promise((resolve) => {
        this.$http.get(this.api.storeManagement.getTiktokStoreDetail, {
          params: {
            commonStoreId: this.moduleData.commonStoreId
          }
        }).then((res) => {
          resolve(res.data || {});
        }).catch(() => {
          resolve({});
        })
      })
    },
    initPage() {
      this.loading = true;
      this.disabledEdit = false;
      let formData = this.formData;
      let data = this.$common.copy(this.moduleData);
      const getInit = [
        { request: this.getStoreDetail(), key: 'StoreDetail' }
      ];
      // 获取初始页面数据
      Promise.all(getInit.map(m => m.request)).then((arr) => {
        this.loading = false;
        arr.forEach((res, index) => {
          if (getInit[index].key === 'StoreDetail') {
            this.detail = { ...data, ...res };
            this.detail.autoReplenishmentGoodsStatusList = this.detail.autoReplenishmentGoodsStatusList 
            ? this.detail.autoReplenishmentGoodsStatusList : []
            this.detail.syncInventoryGoodsStatusList = this.detail.syncInventoryGoodsStatusList 
            ? this.detail.syncInventoryGoodsStatusList : []
          }
        });
        // 表单赋值
        Object.keys(formData).forEach(key => {
          if (typeof this.detail[key] !== 'undefined') {
            this.$set(this.formData, key, this.detail[key]);
          }
        });

        // 停售状态默认勾选
        this.inventoryStatusChange();
        // 防止列表未返回autoReplenishmentStatus值
        const autoReplenishment = formData.autoReplenishment && formData.autoReplenishment > 0;
        this.$set(this.formData, 'autoReplenishmentStatus', autoReplenishment ? 1 : 0);

        this.$nextTick(() => {
          this.$refs.formValidate && this.$refs.formValidate.clearValidate();
        })
      }).catch(() => {
        this.disabledEdit = true;
        this.loading = false;
      })
    },
    inventoryStatusChange() {
      let val = this.formData.syncInventoryStatus;
      if ([0, '0'].includes(val)) {
        this.formData.syncInventoryGoodsStatusList = []
        return;
      }
      let list = this.formData.syncInventoryGoodsStatusList;
      // 启用时，保证停售为锁定勾选
      if ((list.includes(0) || list.includes('0'))) return;
      this.formData.syncInventoryGoodsStatusList.push(0);
    },
    autoReplenishmentChange() {
      this.formData.autoReplenishmentGoodsStatusList = [];
      this.formData.autoReplenishment = null;
    },
    // 防超卖商品状态与自动补货的商品状态互斥
    checkboxChange(type) {
      let formData = this.formData;
      if (type == 'syncInventoryGoodsStatusList') {
        this.formData.autoReplenishmentGoodsStatusList = formData.autoReplenishmentGoodsStatusList.filter(k => {
          return !formData.syncInventoryGoodsStatusList.includes(k);
        })
      }
      if (type == 'autoReplenishmentGoodsStatusList') {
        this.formData.syncInventoryGoodsStatusList = formData.syncInventoryGoodsStatusList.filter(k => {
          return !formData.autoReplenishmentGoodsStatusList.includes(k);
        })
      }
    },
    // 验证补货保持量
    verificationInteger(rule, value, callback) {
      if (this.$common.isEmpty(value, true)) {
        callback(new Error('请输入补货保持量'));
        return;
      }
      const newVal = (Number((value.toString()).replace(/[^\d]/g, '')).toString());
      if (isNaN(Number(value)) || Number(value) <= 0) {
        callback(new Error('请输入非零正整数'));
        return;
      }
      value !== newVal && (this.formData.autoReplenishment = newVal);
      callback();
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        let temp = this.$common.copy(this.formData);
        temp.commonStoreId = this.moduleData.commonStoreId;
        temp.autoReplenishment = Number(temp.autoReplenishment || 0);
        this.loading = true;
        this.$http.post(this.api.storeManagement.updateTiktokStoreInfo, temp).then((res) => {
          this.$message.success("操作成功!");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      });
    },
  },
}
</script>
<style lang="less">
.settingPage {
  .popover-tips-icon {
    font-size: 16px;
    color: #f60;
  }

  .replenishment-content {
    position: relative;
    margin-top: 5px;
    padding: 10px;
    border: 1px solid #dcdee2;
    border-radius: 5px;
  }

  .transiRorate {
    transform: rotate(90deg);
  }
}
</style>