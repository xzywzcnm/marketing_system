<template>
  <div class="dialog-content">
    <el-dialog title="修改运输组" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="changeStatusPage">
      <el-form ref="ruleForm" :model="formData" :rules="rules" label-width="140px" class="pr10">
        <el-form-item label="运输组修改为:" prop="shippingProfileId">
          <dyt-select v-model="formData.shippingProfileId">
            <el-option v-for="(item, index) in transportGroupList" :key="index + 'brand'"
              :label="item.platformShippingProfileName" :value="item.id" />
          </dyt-select>
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
    commonStoreId: {
      type: String | Number,
      default() {
        return null;
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
        shippingProfileId: "",
      },
      rules: {
        shippingProfileId: [{ required: true, message: "请选择", trigger: "change" }],
      },
      linkNum: 0,
      transportGroupList: [],
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
      this.getTransportGroupList();
    },
    // 根据店铺获取运输组
    getTransportGroupList() {
      this.transportGroupList = [];
      this.$store.dispatch("otto/getTransportGroupList", { commonStoreId: this.commonStoreId }).then((list) => {
        this.transportGroupList = list;
      });
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        let temp = Object.assign({}, this.data);
        temp.newShippingProfileId = this.formData.shippingProfileId;
        this.loading = true;
        this.$http.post(this.api.otto.batchUpdateSyncInventoryInfos, temp).then(({ status }) => {
          if (status != 200) return;
          // this.$message.success("操作成功!");
          this.$confirm('操作成功！数据正在同步，可稍后刷新查看~', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: false,
            type: 'success',
            showCancelButton: false,
          }).then(() => {
            this.dialogVisible = false;
            this.$emit("search");
          }).catch(() => { });
        }).finally(() => {
          this.loading = false;
        });
      });
    },
  },
};
</script>