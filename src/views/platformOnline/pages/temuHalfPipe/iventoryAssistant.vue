<template>
  <div class="dialog-content">
    <el-dialog title="设置库存助手" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="iventoryAssistantPage">
      <el-form ref="ruleForm" :model="formData" :rules="rules" label-width="140px" class="pr10">
        <el-form-item label="操作类型:" prop="syncInventoryStatus">
          <el-radio-group v-model="formData.syncInventoryStatus">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="库存警戒值:" prop="inventoryWarningValue" v-if="formData.syncInventoryStatus === 1">
          <el-input v-model="formData.inventoryWarningValue" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span style="color: red; padding: 0 4px">{{ len || 0 }}</span>
          条
        </span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import mulWarehouseSet from "@/views/components/mulWarehouseSet";
export default {
  name: "iventoryAssistant",
  components: { mulWarehouseSet },
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default() { return {} }
    },
    len: {
      type: String | Number,
      default() {
        return 0;
      },
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      formData: {
        syncInventoryStatus: 1,
        inventoryWarningValue: null,
      },
      rules: {},
    };
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit("update:modelVisible", val);
    },
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].resetFields();
      });
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        let temp = this.$common.copy(Object.assign(this.data, this.formData));
        if (temp.syncInventoryStatus === 0) {
          temp.inventoryWarningValue = null;
        }
        // console.log(temp)
        this.loading = true;
        this.$http
          .post(this.api.temuHalfPipe.updateWarehouse, temp)
          .then(() => {
            this.$message.success("操作成功~");
            this.dialogVisible = false;
            this.$emit('refreshAll');
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
  },
};
</script>