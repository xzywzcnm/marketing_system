<template>
  <div class="dialog-content">
    <el-dialog
      title="设置仓库"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      class="setWarehousePage"
    >
      <el-form
        ref="ruleForm"
        :model="formData"
        :rules="rules"
        label-width="90px"
        class="pr10"
      >
        <el-form-item label="设置仓库:" prop="warehouseList">
          <mulWarehouseSet
            v-model="formData.warehouseList"
            :list="userWarehouseList"
            optionLabel="warehouseName"
            optionValue="id"
          />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span style="color: red; padding: 0 4px">{{ len || 0 }}</span>
          条
        </span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import mulWarehouseSet from "@/views/components/mulWarehouseSet";
export default {
  name: "setWarehouse",
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
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      formData: {
        warehouseList: [],
      },
      rules: {
        warehouseList: [
          { required: true, message: "请选择", trigger: "change" },
        ],
      },
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
      this.getUserWarehouseList();
      this.$nextTick(() => {
        this.$refs["ruleForm"].resetFields();
      });
    },
    // 获取用户权限仓库列表
    getUserWarehouseList() {
      this.$store.dispatch("platformList/getUserWarehouseList").then((list) => {
        this.userWarehouseList = list || [];
      });
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        let list = this.formData.warehouseList.filter((k) => k || k === 0);
        if (!list.length) {
          this.$message.warning("仓库至少要有一个~");
          return;
        }
        this.loading = true;
        this.$emit("returnWarehouse", {
          data: list,
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