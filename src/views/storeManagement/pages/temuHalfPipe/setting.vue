<template>
  <div class="dialog-content">
    <el-dialog title="设置" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false" class="settingPage">
      <div v-loading="loading" style="padding: 0 20px 0 0;" class="form-search">
        <el-form ref="formValidate" :model="formData" :rules="rules" label-width="160px" class="formWidth300">
          <el-form-item label="店铺代号:">
            {{ detail.accountCode }}
          </el-form-item>
          <el-form-item label="账号名:">
            {{ detail.account }}
          </el-form-item>
          <el-form-item label="授权状态:">
            {{ authStatus }}
          </el-form-item>
          <el-form-item label="店铺币种:" prop="currency">
            <el-radio-group v-model="formData.currency">
              <el-radio v-for="(item, index) in currencyList" :key="index" :label="item.value">{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="默认仓库:" prop="warehouseIdList">
            <dyt-select v-model="formData.warehouseIdList" multiple>
              <el-option v-for="(item, index) in userWarehouseList" :key="index" :label="item.warehouseName"
                :value="item.id" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="自动开启库存助手:" prop="syncInventoryStatus">
            <el-radio-group v-model="formData.syncInventoryStatus">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="默认库存警戒值:" prop="defaultInventoryWarningValue">
            <el-input v-model="formData.defaultInventoryWarningValue" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <span v-if="disabledEdit" style="color:#f20;">获取数据失败暂不能保存数据，请尝试重新打开</span>
        <el-button @click="cansel()">取 消</el-button>
        <el-button v-if="!disabledEdit" type="primary" :loading="loading" @click="handleForm('formValidate')">确
          定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import regular from '@/utils/regular';
export default {
  name: "ComponentsTemuSetting",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    moduleData: {
      type: Object,
      default() { return {} }
    },
    grantStatus: {
      type: Object,
      default() { return {} }
    },
  },
  data() {
    return {
      dialogVisible: false,
      disabledEdit: false,
      formData: {
        currency: "USD",
        warehouseIdList: [],
        syncInventoryStatus: 1,
        defaultInventoryWarningValue: null,
      },
      rules: {
        currency: [
          { required: true, message: '请选择', trigger: 'blur' }
        ],
        syncInventoryStatus: [
          { required: true, message: '请选择', trigger: 'blur' }
        ],
        defaultInventoryWarningValue: [
          { pattern: regular.checkIsPositiveInteger, message: '请输入大于或等于0的整数', trigger: 'blur' },
        ],
      },
      loading: false,
      detail: {},
      currencyList: {
        "USD": { label: "USD", value: "USD" },
        "RMB": { label: "RMB", value: "RMB" },
      },
      userWarehouseList: [],
    }
  },
  computed: {
    authStatus() {
      const statusInfo = this.grantStatus[this.detail.authStatus];
      if (this.$common.isEmpty(statusInfo)) return '';
      return statusInfo.label;
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
      }
    }
  },
  methods: {
    // 初始化数据
    initPage() {
      this.detail = this.moduleData;
      Object.keys(this.formData).forEach(key => {
        if (!(key in this.detail)) return;
        this.formData[key] = this.detail[key];
      })
      this.formData.warehouseIdList = this.detail.warehouseIdList.map(k => {
        if (this.$common.isEmpty(k)) return k;
        return k - 0;
      });
      this.getWarehouseList();
    },
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch("platformList/getUserWarehouseList").then((list) => {
        this.userWarehouseList = list;
        // let defaultList = list.filter(k => k.warehouseName === '佛山丽山仓').map(k=>k.id);
      });
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        let temp = this.$common.copy(this.formData);
        temp.id = this.detail.id;
        temp.commonStoreId = this.detail.commonStoreId;
        temp.saleAccountId = this.detail.saleAccountId;
        temp.accessToken = this.detail.accessToken;

        this.loading = true;
        this.$http.post(this.api.storeManagement.temuHalfPipe.update, temp).then((res) => {
          this.$message.success("操作成功!");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      });
    },
    cansel() {
      this.dialogVisible = false;
      this.$refs['formValidate'].resetFields();
    }
  }
}
</script>

<style lang="less"></style>