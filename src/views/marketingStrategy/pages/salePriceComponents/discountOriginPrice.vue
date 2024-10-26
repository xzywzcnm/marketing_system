<template>
  <div class="dialog-content">
    <el-dialog title="设置折扣原价售卖" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="discountOriginPrice">
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
        <el-form-item label="操作类型:" prop="ignoreDiscount">
          <el-radio-group v-model="ruleForm.ignoreDiscount">
            <el-radio :label="1">
              启用
            </el-radio>
            <el-radio :label="0">
              关闭
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <div>
          <span>备注: 设置折扣原价售卖后，估价/改价将按照不打折成本计算。</span>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <div style="display:inline-block">此次执行的链接条数 <span v-loading="childLoading"
            element-loading-spinner="el-icon-loading" style="color:red;">{{ total }}&nbsp;&nbsp;</span>条</div>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" :disabled="childLoading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "SalePriceComponentDiscountOriginPrice",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    discountData: {
      type: Object,
      default() { return {} }
    },
    total: {
      type: Number,
      default: 0
    },
    childLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        ignoreDiscount: 1
      },
      rules: {
        ignoreDiscount: [
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
        let [temp] = [this.discountData];
        temp.ignoreDiscount = this.ruleForm.ignoreDiscount;
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
  },
}
</script>
<style lang="scss">
.discountOriginPrice.el-dialog__wrapper {
  .el-dialog__body {
    min-height: auto;
  }
}

// .el-icon-loading:before {
//   line-height: 3;
// }
</style>