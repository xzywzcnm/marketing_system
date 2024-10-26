<template>
  <div class="dialog-content">
    <el-dialog title="变更链接状态" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="changeStatusPage">
      <el-form ref="ruleForm" :model="formData" :rules="rules" label-width="140px" class="pr10">
        <el-form-item label="变更链接状态:" prop="newStatus">
          <dyt-select v-model="formData.newStatus" @change="statusChange">
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="2" />
          </dyt-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span style="color: red; padding: 0 4px">{{ linkNum || 0 }}</span>
          条
        </span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()" :disabled="btnDisabled">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "changeStatus",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      formData: {
        newStatus: "",
      },
      rules: {
        newStatus: [{ required: true, message: "请选择", trigger: "change" }],
      },
      linkNum: 0,
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
  computed: {
    btnDisabled() {
      // 同等状态不能再次操作，比如上架不能再上架
      return !(this.linkNum > 0);
    },
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].resetFields();
      });
    },
    statusChange(e) {
      this.linkNum = 0;
      if (this.$common.isEmpty(e)) return;
      let filterVal = e == 1 ? 2 : 1;
      this.linkNum = this.data.filter(k => k.status === filterVal).length;
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;

        let temp = {};
        let { newStatus } = this.formData;
        let filterVal = newStatus == 1 ? 2 : 1;
        temp.linkIdList = this.data.filter(k => k.status === filterVal).map(k => k.id);
        temp.newStatus = newStatus;

        this.loading = true;
        this.$http.post(this.api.real.batchUpdateLinks, temp)
          .then(({ status }) => {
            if (status != 200) return;
            this.$message.success("正在修改，请稍后刷新列表查看链接状态!");
            this.dialogVisible = false;
            this.$nextTick(() => {
              this.$emit("search");
            });
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
  },
};
</script>