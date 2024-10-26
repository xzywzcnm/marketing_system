<template>
  <div class="dialog-content">
    <el-dialog :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="synchronizeInventory-dialog">
      <div slot="title">
        <span>设置同步库存</span>
      </div>
      <el-form ref="ruleForm" :model="ruleForm" label-width="100px">
        <el-form-item label="操作类型:" class="mt20" prop="type">
          <el-radio-group v-model="ruleForm.type">
            <el-radio :label="1">
              启用
            </el-radio>
            <el-radio :label="0">
              关闭
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <span class="mr10" v-if="total">
          此次执行的链接条数
          <span style="color:red;padding:0 4px;">{{ total || 0 }}</span>
          条
        </span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "synchronizeInventory",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        type: 1,
      },
    }
  },
  watch: {
    modelVisible(val) {
      val && this.open();
    },
    dialogVisible(val) {
      !val && this.$emit('update:modelVisible', val);
    },
  },
  methods: {
    open() {
      this.ruleForm.type = 1;
      this.dialogVisible = this.modelVisible;
    },
    confirmHandle() {
      this.$emit('synchronizeResult', this.ruleForm);
      this.dialogVisible = false;
    }
  }
}
</script>
<style lang="scss">
.synchronizeInventory-dialog .el-dialog__body {
  min-height: 0 !important;
}
</style>
