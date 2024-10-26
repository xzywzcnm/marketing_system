<template>
  <div class="dialog-content">
    <el-dialog title="设置价格锁定" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="priceLockPage">
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
        <el-form-item label="操作类型:" prop="lockPriceStatus">
          <el-radio-group v-model="ruleForm.lockPriceStatus">
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
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "SalePriceComponentspriceLock",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default() { return {} }
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        lockPriceStatus: 1
      },
      rules: {
        lockPriceStatus: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
      },
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit('update:modelVisible', val);
    },
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs['ruleForm'].resetFields();
      })
    },
    confirmHandle() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return;
        let [temp] = [this.data];
        temp.lockPriceStatus = this.ruleForm.lockPriceStatus;
        this.loading = true;
        this.$http.post(this.api.ebay.batchUpdateLinkDetail, temp).then((res) => {
          this.$message.success("操作成功~");
          this.dialogVisible = false;
          this.$emit('refreshReturn');
        }).finally(() => {
          this.loading = false;
        })
      })
    }
  }
}
</script>
<style lang="scss">
.priceLockPage.el-dialog__wrapper {
  .el-dialog__body {
    min-height: auto;
  }
}
</style>