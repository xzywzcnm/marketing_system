<template>
  <div class="dialog-content">
    <el-dialog
      title="变更链接状态"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      class="changeStatusPage"
    >
      <el-form
        ref="ruleForm"
        :model="formData"
        :rules="rules"
        label-width="140px"
        class="pr10"
      >
        <el-form-item label="变更链接状态:" prop="newStatus">
          <dyt-select v-model="formData.newStatus" @change="statusChange">
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
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
        <el-button
          type="primary"
          :loading="loading"
          @click="confirmHandle()"
          :disabled="btnDisabled"
          >确 定</el-button
        >
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
      let status = e == 1 ? 0 : 1;
      this.$http
        .post(
          `${this.api.otto.queryUpdateLinkStatusNum}?status=${status}`,
          this.data
        )
        .then(({ status, data }) => {
          if (status != 200) return;
          this.linkNum = data || 0;
        });
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        let { newStatus } = this.formData;
        this.loading = true;
        this.$http
          .post(
            `${this.api.otto.batchUpdateLinkStatus}?newStatus=${newStatus}`,
            this.data
          )
          .then(({ status }) => {
            if (status != 200) return;
            this.$message.success("操作成功!");
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