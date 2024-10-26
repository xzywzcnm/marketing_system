<template>
  <div class="dialog-content">
    <el-dialog title="设置" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false" class="settingPage">
      <div v-loading="loading" style="padding: 0 20px 0 0;">
        <el-form ref="formValidate" :model="formData" :rules="rules" label-width="140px">
          <el-form-item label="店铺代号:">
            {{ detail.accountCode }}
          </el-form-item>
          <el-form-item label="账号名:">
            {{ detail.account }}
          </el-form-item>
          <el-form-item label="店铺状态:">
            {{ [1, '1'].includes(detail.enable) ? '启用' : '停用' }}
          </el-form-item>
          <!-- <el-form-item label="授权状态:">
            {{ authStatus }}
          </el-form-item> -->
          <el-form-item label="店铺币种" prop="currency">
            <dyt-select v-model="formData.currency">
              <el-option v-for="item in shopcurrency" :key="item.value" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="Token:" prop="accessToken">
            <el-input v-model="formData.accessToken" disabled />
          </el-form-item>
          <el-form-item label="店铺主体:" prop="developerName">
            <el-input v-model="formData.developerName" disabled />
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
import qs from "qs";
export default {
  name: "ComponentsTemuSetting",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
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
        commonStoreId: '',
        accessToken: '',
        currency: "USD",
        developerName: '',
      },
      shopcurrency: {
        0: { label: "RMB", value: "RMB" },
        1: { label: "USD", value: "USD" },
      },
      rules: {
        currency: [
          { required: true, message: '请选择币种', trigger: 'blur' }
        ],
        accessToken: [
          { required: true, message: '请输入 Token', trigger: 'blur' },
          { required: true, message: '请输入 Token', trigger: 'change' }
        ],
        developerName: [
          { required: true, message: '请输入店铺主体', trigger: 'blur' },
          { required: true, message: '请输入店铺主体', trigger: 'change' }
        ]
      },
      loading: false,
      detail: {},
      templateInfo: {},//选中模板数据
    }
  },
  computed: {
    // authStatus () {
    //   const statusInfo = this.grantStatus[this.detail.authStatus];
    //   if (this.$common.isEmpty(statusInfo)) {
    //     return '';
    //   }
    //   return statusInfo.label;
    // }
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
      // // 保存上次设置默认值
      // this.formData.currency = this.detail.currency
      // this.formData.accessToken = this.detail.accessToken
      // this.formData.developerName = this.detail.developerName
      Object.keys(this.formData).forEach(key => {
        this.formData[key] = this.detail[key] || null;
      })
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        let temp = this.$common.copy(this.formData);
        delete temp.developerName;
        // temp.commonStoreId = this.detail.commonStoreId;
        this.loading = true;
        this.$http.put(`${this.api.storeManagement.temu_updateTemuToken}?${qs.stringify(temp)}`).then((res) => {
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