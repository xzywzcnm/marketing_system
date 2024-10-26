<template>
  <div class="dialog-content">
    <el-dialog title="设置库存助手" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="iventoryAssistantPage">
      <el-form ref="ruleForm" :model="formData" :rules="rules" label-width="140px" class="pr10">
        <el-form-item label="操作类型:" prop="newSyncInventoryStatus">
          <el-radio-group v-model="formData.newSyncInventoryStatus">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="自动修改处理时间:" prop="newSyncDeliveryTimeStatus" v-if="formData.newSyncInventoryStatus == 1">
          <el-radio-group v-model="formData.newSyncDeliveryTimeStatus">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">关闭</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="自动修改运输组:" prop="newSyncShippingProfileStatus" v-if="formData.newSyncInventoryStatus == 1">
          <el-radio-group v-model="formData.newSyncShippingProfileStatus">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">关闭</el-radio>
          </el-radio-group>
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
    len: {
      type: String | Number,
      default() {
        return 0;
      },
    },
    data: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      formData: {
        newSyncInventoryStatus: 1,
        // newSyncDeliveryTimeStatus: 1,
        newSyncShippingProfileStatus: 1,
      },
      rules: {},
      userWarehouseList: [],
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
        let formData = this.formData;
        let temp = this.$common.copy(formData);
        if (temp.newSyncInventoryStatus === 0) {
          temp.newSyncShippingProfileStatus = 0;
        }
        this.loading = true;
        this.$emit("returnIventory", {
          data: temp,
          back: () => {
            this.loading = false;
            this.dialogVisible = false;
          },
        });
      });
    },
  },
};
</script>