<template>
  <div class="dialog-content">
    <el-dialog title="设置" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false">
      <div v-loading="loading" style="padding: 0 20px 0 0">
        <el-form ref="formValidate" :model="formData" :rules="rules" label-width="140px">
          <el-form-item label="店铺代号:">
            {{ moduleData.accountCode }}
          </el-form-item>
          <el-form-item label="店铺名称:">
            {{ moduleData.accountName }}
          </el-form-item>
          <el-form-item label="店铺状态:">
            {{ moduleData.enable == 1 ? "启用" : "停用" }}
          </el-form-item>
          <el-form-item label="是否全托管店铺" prop="isFullyManaged">
            <el-radio-group v-model="formData.isFullyManaged" disabled>
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否半托管店铺" prop="isHalfManaged">
            <el-radio-group v-model="formData.isHalfManaged" disabled>
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="isHalf">
            ---半托管功能
          </div>
          <el-form-item label="自动开启同步库存" prop="syncInventoryStatus">
            <el-radio-group v-model="formData.syncInventoryStatus">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="库存策略">
            <div class="flex-align no-form-item formb0 differ">
              <span class="flexSpan">当前可用库存不少于</span>
              <el-form-item label-width="0" prop="availInventoryCriticalValue">
                <el-input v-model="formData.availInventoryCriticalValue" size="mini" style="width:80px" 
                @input="(value) => {handleInput('availInventoryCriticalValue',value)}" />
              </el-form-item>
              <span class="flexSpan">，则同步库存数</span>
              <el-form-item label-width="0" prop="syncInventoryValue">
                <el-input v-model="formData.syncInventoryValue" style="width:80px" size="mini" 
                @input="(value) => {handleInput('syncInventoryValue',value)}" />
              </el-form-item>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel()">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="handleForm('formValidate')">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import regular from "@/utils/regular";
export default {
  name: "ComponentsAliExpressSetting",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    moduleData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      dialogVisible: false,
      formData: {
        isFullyManaged: 0,
        isHalfManaged: 0,
        syncInventoryStatus: 0,
        availInventoryCriticalValue: 0,
        syncInventoryValue: 0,
      },
      rules: {
        // isFullyManaged: [
        //   { required: true, message: "请选择", trigger: "change" },
        // ],
        // isHalfManaged: [
        //   { required: true, message: "请选择", trigger: "change" },
        // ],
        syncInventoryStatus: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        availInventoryCriticalValue: [
          {
            validator: this.validatorAvailInventoryCriticalValue,
            trigger: "submit",
          },
        ],
        syncInventoryValue: [
          { validator: this.validatorSyncInventoryValue, trigger: "submit" },
        ],
      },
      loading: false,
    };
  },
  watch: {
    modelVisible(val) {
      this.dialogVisible = val;
      val && this.initPage();
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit("update:modelVisible", val);
      }
    },
  },
  methods: {
    // 初始化数据
    initPage() {
      Object.keys(this.formData).forEach((key) => {
        this.formData[key] = this.moduleData[key];
      });
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        let temp = this.$common.copy(this.formData);
        temp.commonStoreId = this.moduleData.commonStoreId;
        temp.availInventoryCriticalValue = this.$common.isEmpty(temp.availInventoryCriticalValue) ? null :
        parseFloat(temp.availInventoryCriticalValue);
        temp.syncInventoryValue = this.$common.isEmpty(temp.syncInventoryValue) ? null :parseFloat(temp.syncInventoryValue);
        this.loading = true;
        this.$http
          .post(this.api.storeManagement.eliExpress.update, temp)
          .then((res) => {
            this.$message.success("操作成功!");
            this.dialogVisible = false;
            this.$emit("search");
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    cancel() {
      this.dialogVisible = false;
      this.$refs["formValidate"].resetFields();
    },
    validatorAvailInventoryCriticalValue(rule, value, callback) {
      const { availInventoryCriticalValue, syncInventoryValue } = this.formData;
      if (availInventoryCriticalValue || availInventoryCriticalValue === 0) {
        if (!syncInventoryValue) {
          syncInventoryValue !== 0
            ? callback(new Error("需输入同步库存数"))
            : "";
        } else {
          if (!regular.checkIsPositiveInteger.test(availInventoryCriticalValue))
            return callback(new Error("请输入非负整数"));
        }
      }
      callback();
    },
    validatorSyncInventoryValue(rule, value, callback) {
      const { availInventoryCriticalValue, syncInventoryValue } = this.formData;
      if (syncInventoryValue || syncInventoryValue === 0) {
        if (!availInventoryCriticalValue) {
          availInventoryCriticalValue !== 0
            ? callback(new Error("需输入当前可用库存最小值"))
            : "";
        } else if (!regular.checkIsPositiveInteger.test(syncInventoryValue)) {
          return callback(new Error("请输入非负整数"));
        } else if (
          parseFloat(syncInventoryValue) <=
          parseFloat(availInventoryCriticalValue)
        )
          return callback(new Error("需大于可用库存最小值"));
      }
      callback();
    },
    handleInput(type, value) {
      // 过滤非法输入
      this.formData[type] = this.formData[type].replace(/\D/g, "");
    },
  },
};
</script>
<style lang="less">
.isHalf { 
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>