<template>
  <div class="dialog-content">
    <el-dialog
      :title="showModal.title"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      class="replenishOperatorPage dialogAutoHeight"
    >
      <el-form
        ref="ruleForm"
        :model="showModal.formData"
        :rules="showModal.rules"
        label-width="100px"
        class="pl10 pr10"
      >
        <!-- 补货保持值 -->
        <template v-if="data.type === 'replenish'">
          <el-form-item label="操作类型:" prop="replenishType">
            <el-radio-group v-model="showModal.formData.replenishType">
              <el-radio :label="1"> 启用 </el-radio>
              <el-radio :label="0"> 关闭 </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="showModal.formData.replenishType == 1"
            label="补货保持值:"
            prop="autoReplenishment"
          >
            <el-input v-model="showModal.formData.autoReplenishment" />
          </el-form-item>
        </template>
        <!-- 库存助手 -->
        <template v-if="data.type === 'inventory'">
          <el-form-item label="同步库存状态:" prop="newSyncInventoryStatus">
            <el-radio-group v-model="showModal.formData.newSyncInventoryStatus">
              <el-radio :label="1"> 启用 </el-radio>
              <el-radio :label="0"> 关闭 </el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span style="color: red; padding: 0 4px">{{ len }}</span>
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
import regular from "@/utils/regular";
export default {
  name: "WalmartBatchOperation",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default() {
        return {
          len: 0, //长度
          type: null, //类型
          platformCode: "", //平台类型
        };
      },
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      operate: {
        replenish: {
          title: "设置自动补货",
          formData: {
            replenishType: 1,
            autoReplenishment: "",
          },
          rules: {
            replenishType: [
              { required: true, message: "请选择", trigger: "change" },
            ],
            autoReplenishment: [
              { required: true, message: "请输入", trigger: "blur" },
              {
                pattern: regular.checkIsPositiveIntegerEx0,
                message: "请输入正整数",
                trigger: "blur",
              },
              {
                pattern: regular.checkIsPositiveIntegerEx0,
                message: "请输入正整数",
                trigger: "change",
              },
            ],
          },
        },
        inventory: {
          title: "设置库存助手",
          formData: {
            newSyncInventoryStatus: 0
          }
        }
      },
      showModal: {},
      // linkNum: 0,
      len: 0,
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
  // computed: {
  //   btnDisabled() {
  //     // 同等状态不能再次操作，比如上架不能再上架
  //     return !(this.linkNum > 0);
  //   },
  // },
  methods: {
    open() {
      this.showModal = this.$common.copy(
        this.operate[this.data.type] || {
          title: "修改",
          formData: {},
        }
      );
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].resetFields();
      });
      this.len = this.data.len || 0;
    },
    // statusChange(e) {
    //   this.linkNum = 0;
    //   if (this.$common.isEmpty(e)) return;
    //   let status = e == 1 ? 0 : 1;
    //   this.$http
    //     .post(
    //       `${this.api.otto.countUpdateReplenishmentLinks}?autoReplenishment=${status}`,
    //       this.data
    //     )
    //     .then(({ status, data }) => {
    //       if (status != 200) return;
    //       this.linkNum = data || 0;
    //     });
    // },
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        this.loading = true;
        this.$emit("batchOperatReturn", {
          data: this.$common.copy(this.showModal.formData),
          back: (data) => {
            this.loading = false;
            data.valid && (this.dialogVisible = false);
          },
        });
      });
    },
  },
};
</script>