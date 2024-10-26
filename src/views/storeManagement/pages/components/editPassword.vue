<template>
  <div class="dialog-content">
    <el-dialog title="授权api账号密码修改" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false">
      <div>
        <el-form ref="formValidate" :model="formData" :rules="rules" label-width="80px">
          <el-form-item label="店铺代号:">
            <el-input v-model="detail.accountCode" disabled />
          </el-form-item>
          <el-form-item label="账号名:">
            <el-input v-model="detail.account" disabled />
          </el-form-item>
          <el-form-item label="账号:" prop="clientId">
            <el-input v-model="formData.clientId" placeholder="请输入" type="password" />
          </el-form-item>
          <el-form-item label="密码:" prop="clientSecret">
            <el-input v-model="formData.clientSecret" placeholder="请输入" type="password" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="handleForm('formValidate')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FETCH from "@/mixins/fetch";
export default {
  name: "ComponentsEditPassword",
  mixins: [FETCH],
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default() { return {} }
    },
  },
  data() {
    return {
      dialogVisible: false,
      formData: {
        clientId: '',
        clientSecret: '',
        commonStoreId: ''
      },
      rules: {
        clientId: [
          { required: true, message: '请输入账号', trigger: 'blur' },
        ],
        clientSecret: [
          { required: true, message: '请输入密码', trigger: 'blur' },
        ]
      },
      loading: false,
      detail: {},
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:modelVisible', val);
        this.$refs['formValidate'].resetFields();
      }
    },
    data: {
      handler(a, b) {
        if (JSON.stringify === '{}') return;
        this.detail = this.$common.copy(a);
        this.formData.clientId = a.clientId || '';
        this.formData.commonStoreId = a.commonStoreId || '';
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    open() {
      this.dialogVisible = this.modelVisible;
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        this.loading = true;
        this.$http.post(this.api.storeManagement.updateAccount, this.formData).then((res) => {
          this.$message.success("操作成功!");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      });
    }
  }
}
</script>

<style>

</style>