<template>
  <div class="dialog-content realModifyPrice">
    <el-dialog title="修改价格" :visible.sync="dialogVisible" width="650px" :close-on-click-modal="false"
      class="realModifyPricePage">
      <div class="content">
        <el-form ref="modifyPriceForm" class="modifyPriceForm" label-width="120px" :model="formData" :rules="rules">
          <el-form-item label="修改类型:" prop="type">
            <el-radio-group v-model="formData.type" @change="clearPrice">
              <el-radio v-for="(item, index) in typeList" :key="index + 'type'" :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="修改:" class="nestingForm" prop="editType" :show-message="false">
            <div class="flexCenter">
              <el-form-item label-width="0" class="itemWidth200 mr10" prop="editType">
                <dyt-select v-model="formData.editType">
                  <span v-for="(item, i) in editList" :key="i + 'editType'">
                    <el-option v-if="item.show.includes(formData.type)" :label="item.label" :value="item.value" />
                  </span>
                </dyt-select>
              </el-form-item>
              <el-form-item v-if="!$common.isEmpty(formData.editType)" prop="editNum" label-width="0"
                class="itemWidth200">
                <el-input v-model.number="formData.editNum" type="number">
                  <span v-if="formData.type == 2" slot="suffix">%</span>
                </el-input>
              </el-form-item>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <div class="flexJustEnd">
          <el-form ref="totalForm" label-width="0" :model="confirmData" :rules="confirmRules" :inline="true"
            class="totalForm">
            <div v-if="priceVerify" class="cofirmTotal">
              请在此处确认执行链接数量
              <el-form-item prop="total">
                <el-input v-model="confirmData.total" style="width: 70px; margin: 0 4px" onpaste="return false" />
              </el-form-item>条；
            </div>
            <el-form-item class="mr20">
              可执行修改的链接数量<span style="color: #fc2d1a; margin: 0 8px">{{
                len || 0
              }}</span>条
            </el-form-item>
          </el-form>
          <el-button @click="dialogVisible = false"> 取 消 </el-button>
          <el-button type="primary" :loading="loading" @click="confirmHandle()">
            确定
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import regular from "@/utils/regular.js";
export default {
  name: "realModifyPrice",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    len: {
      type: Number,
      default() {
        return 0;
      },
    },
    priceVerify: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      dialogVisible: false, //组件弹框
      loading: false,
      formData: {
        type: null,
        editType: "",
        editNum: "",
      },
      rules: {
        type: [{ required: true, message: "请选择", trigger: "change" }],
        editType: [{ required: true, message: "请选择", trigger: "change" }],
        editNum: [{ validator: this.validateEditPrice, trigger: "blur" }],
      },
      typeList: [
        {
          label: "按数值调整",
          value: 1,
        },
        {
          label: "按比例调整",
          value: 2,
        },
      ],
      editList: [
        {
          label: "减少",
          value: 1,
          show: [1, 2],
        },
        {
          label: "增加",
          value: 3,
          show: [1, 2],
        },
        {
          label: "等于",
          value: 2,
          show: [1],
        },
      ],
      confirmData: {
        total: "",
      },
      confirmRules: {
        total: [{ validator: this.validateTotal, trigger: "blur" }],
      },
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
      this.dialogVisible = this.modelVisible;
      this.$nextTick(() => {
        this.$refs["modifyPriceForm"].resetFields();
        this.priceVerify && this.$refs["totalForm"].resetFields();
      });
    },
    // 校验数量
    validateTotal(rule, value, callback) {
      if (["", null, undefined].includes(value))
        return callback(new Error("请输入"));
      if (Number(value) !== Number(this.len))
        return callback(new Error("数量不对等"));
      callback();
    },
    confirmTotal() {
      return new Promise((resolve) => {
        this.$refs["totalForm"].validate((valid) => {
          resolve(valid);
        });
      });
    },
    // 确认修改
    confirmHandle() {
      this.$refs["modifyPriceForm"].validate(async (valid) => {
        if (!valid) return;
        if (this.priceVerify) {
          let a = await this.confirmTotal();
          if (!a) return false;
        }
        let formData = this.formData;
        let temp = Object.assign({}, this.data);
        temp.newUpdatePriceType = formData.type;
        temp.newUpdatePriceSymbol = formData.editType;
        temp.newUpdatePriceValue = formData.editNum;
        // console.log(temp);
        this.loading = true;
        this.$http.post(this.api.real.batchUpdateLinks, temp)
          .then((res) => {
            this.$message.success("操作成功~");
            this.dialogVisible = false;
            this.$emit('search');
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    // 修改价格
    validateEditPrice(rule, value, callback) {
      const nullNum = ["", null, undefined].includes(value);
      if (nullNum) {
        return callback(new Error("请填写~"));
      }
      if (!regular.positiveFloat.test(value)) {
        return callback(new Error("允许输入正数，最多2位小数"));
      }
      callback();
    },
    clearPrice() {
      this.formData.editType = '';
      this.formData.editNum = '';
    },
  },
};
</script>
<style lang="scss">
.realModifyPricePage {
  .modifyPriceForm {
    .itemWidth200 {
      width: 200px;
    }

    .nestingForm {
      margin: 0;
    }

    .el-date-editor {
      width: 410px;
    }
  }

  .flexJustEnd {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 12px;

    .totalForm {
      .cofirmTotal {
        display: inline-flex;
        align-items: center;
      }

      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .priceTips {
    color: #fc2d1a;
    font-size: 12px;
    line-height: 32px;
    text-align: left;
  }
}
</style>
