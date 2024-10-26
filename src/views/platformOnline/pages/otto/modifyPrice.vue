<template>
  <div class="dialog-content ottoModifyPricePage">
    <el-dialog title="修改价格" :visible.sync="dialogVisible" width="650px" :close-on-click-modal="false"
      class="modifyPricePage">
      <div class="content">
        <el-form ref="modifyPriceForm" class="modifyPriceForm" label-width="120px" :model="formData" :rules="rules">
          <el-form-item label="修改选择:" prop="updatePrice">
            <el-radio-group v-model="formData.updatePrice" @change="updatePriceChange">
              <el-radio v-for="(item, index) in priceTypeList" :key="index + 'updatePrice'" :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="修改类型:" prop="type">
            <el-radio-group v-model="formData.type" @change="clearPrice">
              <el-radio v-for="(item, index) in typeList" :key="index + 'type'" :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="基准参考:" prop="updateReference">
            <el-radio-group v-model="formData.updateReference">
              <el-radio v-for="(item, index) in priceTypeList" :key="index + 'updateReference'" :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="修改:" class="nestingForm" prop="editType" :show-message="false">
            <div class="flexCenter">
              <el-form-item label-width="0" class="itemWidth200 mr10" prop="editType">
                <dyt-select v-model="formData.editType" :disabled="isLimitTime">
                  <span v-for="(item, i) in editList" :key="i + 'editType'">
                    <el-option v-if="item.show.includes(formData.type)" :label="item.label" :value="item.value" />
                  </span>
                </dyt-select>
              </el-form-item>
              <el-form-item v-if="formData.editType || formData.editType === 0" prop="editNum" label-width="0"
                class="itemWidth200">
                <el-input v-model.number="formData.editNum" type="number" :disabled="isLimitTime">
                  <span v-if="formData.type === 1" slot="suffix">%</span>
                </el-input>
              </el-form-item>
            </div>
          </el-form-item>
          <template v-if="[2].includes(formData.updatePrice)">
            <el-form-item label="活动时间:" prop="handleTime">
              <dyt-timePicker v-model="formData.handleTime" type="datetimerange" :hide-picker="true"
                value-format="yyyy-MM-dd HH:mm:ss" :disabled-date="disableData" />
            </el-form-item>
            <el-form-item label="" prop="updateSalePriceType">
              <el-checkbox-group v-model="formData.updateSalePriceType" @change="clearPrice">
                <!-- <el-checkbox :label="1">仅修改活动价格</el-checkbox> -->
                <el-checkbox :label="2">仅修改活动时间</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </template>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="flexJustEnd">
          <el-form ref="totalForm" label-width="0" :model="confirmData" :rules="confirmRules" :inline="true"
            class="totalForm">
            <div v-if="data.priceVerify" class="cofirmTotal">
              请在此处确认执行链接数量
              <el-form-item prop="total">
                <el-input v-model="confirmData.total" style="width: 70px; margin: 0 4px" onpaste="return false" />
              </el-form-item>条；
            </div>
            <el-form-item class="mr20">
              可执行修改的链接数量<span style="color: #fc2d1a; margin: 0 8px">{{
                data.len || 0
              }}</span>条
            </el-form-item>
          </el-form>
          <el-button @click="dialogVisible = false"> 取 消 </el-button>
          <el-button type="primary" :loading="loading" @click="confirmHandle()">
            确定
          </el-button>
        </div>
        <div class="priceTips">
          <span v-if="isLimitTime">请确保链接已存在活动价格，否则无法修改</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import regular from "@/utils/regular.js";
export default {
  name: "OttoModifyPrice",
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
  },
  data() {
    return {
      dialogVisible: false, //组件弹框
      loading: false,
      formData: {
        updatePrice: null,
        type: null,
        updateReference: null,
        editType: "",
        editNum: "",
        handleTime: [],
        updateSalePriceType: [],
      },
      rules: {
        updatePrice: [{ required: true, message: "请选择", trigger: "change" }],
        type: [{ required: true, message: "请选择", trigger: "change" }],
        updateReference: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        editType: [{ validator: this.validEditType, trigger: "change" }],
        editNum: [{ validator: this.validateEditPrice, trigger: "blur" }],
        handleTime: [
          {
            validator: this.validHandleTime,
            message: "请选择",
            trigger: "change",
          },
        ],
      },
      priceTypeList: [
        {
          label: "价格",
          value: 0,
        },
        {
          label: "工厂建议价",
          value: 1,
        },
        {
          label: "活动价格",
          value: 2,
        },
      ],
      typeList: [
        {
          label: "按比例调整",
          value: 1,
        },
        {
          label: "按数值调整",
          value: 0,
        },
      ], //修改类型
      editList: [
        {
          label: "减少",
          value: 0,
          show: [0, 1],
        },
        {
          label: "增加",
          value: 2,
          show: [0, 1],
        },
        {
          label: "等于",
          value: 1,
          show: [0],
        },
      ], //修改
      confirmData: {
        total: "",
      },
      confirmRules: {
        total: [{ validator: this.validateTotal, trigger: "blur" }],
      },
      disableData: {
        disabledDate(time) {
          let times = Date.now() - 24 * 60 * 60 * 1000;
          return time.getTime() < times;
        },
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
  computed: {
    isLimitTime() {
      return this.formData.updateSalePriceType.includes(2);
    }
  },
  methods: {
    open() {
      this.dialogVisible = this.modelVisible;
      this.$nextTick(() => {
        this.$refs["modifyPriceForm"].resetFields();
        this.data.priceVerify && this.$refs["totalForm"].resetFields();
      });
    },
    // 校验数量
    validateTotal(rule, value, callback) {
      if (["", null, undefined].includes(value))
        return callback(new Error("请输入"));
      if (Number(value) !== Number(this.data.len))
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
        if (this.data.priceVerify) {
          let a = await this.confirmTotal();
          if (!a) return false;
        }
        let temp = this.$common.copy(this.formData);
        // 修改标准价格值。如果是仅修改活动时间，就传null
        if (temp.updateSalePriceType.includes(2)) {
          temp.editNum = null;
          delete temp.updateSalePriceType;
        }
        this.$emit("modifyPriceReturn", temp);
      });
    },
    // 修改价格方式
    validEditType(rule, value, callback) {
      if (this.formData.updateSalePriceType.includes(2)) {
        return callback();
      }
      const nullNum = ["", null, undefined].includes(value);
      if (nullNum) {
        return callback(new Error("请填写~"));
      }
      callback();
    },
    // 修改价格
    validateEditPrice(rule, value, callback) {
      let { updatePrice, editType, type, handleTime, updateSalePriceType } = this.formData;
      if (updateSalePriceType.includes(2)) {
        return callback();
      }
      const nullNum = ["", null, undefined].includes(value);
      // 当价格选择="活动价格"；修改类型="按数值调整"；修改="等于"时，价格跟活动时间允许为空
      const condimet = updatePrice === 2 && type === 0 && editType === 1;
      const nullTime = !(Array.isArray(handleTime) && handleTime.length);
      if (condimet && nullNum && nullTime) {
        return callback();
      }
      if (nullNum) {
        return callback(new Error("请填写~"));
      }
      if (!nullNum && !regular.positiveFloat.test(value)) {
        return callback(new Error("允许输入正数，最多2位小数"));
      }
      callback();
    },
    // 活动价格有填入，则必填
    validHandleTime(rule, value, callback) {
      let { updatePrice, editType, type, editNum } = this.formData;
      const nullNum = !(Array.isArray(value) && value.length);
      // 当价格选择="活动价格"；修改类型="按数值调整"；修改="等于"时，价格跟活动时间允许为空
      const condimet = updatePrice === 2 && type === 0 && editType === 1;
      if (condimet && this.$common.isEmpty(editNum)) {
        return callback();
      }
      if (nullNum) {
        return callback(new Error("请选择~"));
      }
      callback();
    },
    // 仅修改活动价格和仅修改活动时间互斥
    salePriceTypeChange(e) {
      let num = e[e.length - 1];
      let indexOfStr = num == 1 ? 2 : num == 2 ? 1 : null;
      let index = e.findIndex(k => k === indexOfStr);
      if (index >= 0) this.formData.updateSalePriceType.splice(index, 1);
    },
    clearPrice() {
      this.formData.editType = '';
      this.formData.editNum = '';
    },
    updatePriceChange(e) {
      // this.formData.handleTime = [];
      this.formData.updateSalePriceType = [];
    },
  },
};
</script>
<style lang="scss">
.ottoModifyPricePage {
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
