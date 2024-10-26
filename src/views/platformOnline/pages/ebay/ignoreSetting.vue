<template>
  <div class="dialog-content">
    <el-dialog title="设置忽略初始化" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="ignoreSettingPage">
      <el-form ref="ruleForm" :model="ruleForm" label-width="100px">
        <el-form-item label="操作类型:" prop="ignoreInitialization">
          <el-radio-group v-model="ruleForm.ignoreInitialization">
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
  name: "EbayIgnoreSetting",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default() { return [] }
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        ignoreInitialization: 1
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
        let temp = {};
        temp.ignoreInitialization = this.ruleForm.ignoreInitialization;
        temp.linkDetailIdList = this.list.map(k => k.linkDetailId);
        // console.log(temp);
        this.loading = true;
        this.$http.post(this.api.ebay.batchUpdateLinkDetail, temp).then((res) => {
          this.$message.success("操作成功~");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      })
    }
  }
}
</script>
<style lang="scss">
.ignoreSettingPage {
  .el-dialog .el-dialog__body {
    min-height: auto;
  }
}
</style>