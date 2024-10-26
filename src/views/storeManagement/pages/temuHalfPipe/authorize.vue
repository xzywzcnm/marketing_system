<template>
  <div class="dialog-content">
    <el-dialog title="设置" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false" class="settingPage">
      <div v-loading="loading" style="padding: 0 20px 0 0;" class="form-search">
        <el-form ref="formValidate" :model="formData" :rules="rules" label-width="140px" class="formWidth300">
          <el-form-item label="店铺代号:">
            {{ data.accountCode }}
          </el-form-item>
          <el-form-item label="账号名:">
            {{ data.account }}
          </el-form-item>
          <el-form-item label="店铺主体:" prop="developerId">
            <dyt-select v-model="formData.developerId">
              <el-option v-for="item in developerIdList" :key="item.id" :label="item.name" :value="item.id" />
            </dyt-select>
          </el-form-item>
          <el-form-item label="Token:" prop="accessToken">
            <el-input v-model="formData.accessToken" />
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
export default {
  name: "temuHalfPipeSetting",
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
      disabledEdit: false,
      formData: {
        developerId: null,
        accessToken: null,
      },
      rules: {
        developerId: [
          { required: true, message: '请选择店铺主体', trigger: 'change' }
        ],
        accessToken: [
          { required: true, message: '请输入 Token', trigger: 'blur' }
        ],
      },
      loading: false,
      templateInfo: {},//选中模板数据
      developerIdList: [],
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
      Object.keys(this.formData).forEach(key => {
        if (key in this.data) {
          this.formData[key] = this.data[key];
        }
      })
      this.getdeveloperIdList();
    },
    // 获取主体列表
    getdeveloperIdList() {
      this.$http.get(this.api.storeManagement.temuHalfPipe.getAllEnable).then((res) => {
        let list = (res.data || []).filter(k => {
          return k.enable == 1;
        });
        this.developerIdList = list;
        let obj = this.$common.arrayToObj(list, 'name');
        let row = obj[this.data.developerName] || {};
        this.formData.developerId = row.id || null;
      })
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        let temp = this.$common.copy(this.formData);
        temp.id = this.data.id;
        temp.commonStoreId = this.data.commonStoreId;
        temp.saleAccountId = this.data.saleAccountId;
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