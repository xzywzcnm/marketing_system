<template>
  <div class="dialog-content">
    <el-dialog title="修改价格" :visible.sync="dialogVisible" width="800px" :close-on-click-modal="false"
      class="modifyPricePage">
      <div class="content">
        <el-form ref="modifyPriceForm" class="modifyPriceForm" label-width="120px" :model="formData" :rules="rules">
          <el-form-item label="修改类型:" prop="type">
            <el-radio-group v-model="formData.type" @change="formData.editType = ''; formData.editNum = '';">
              <el-radio v-for="(item, index) in typeList" :key="index + 'type'" :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="formData.type === 0" label="模版:" prop="templateId">
            <div class="flexCenter">
              <dyt-select v-model="formData.templateId" class="itemWidth480 mr20">
                <el-option v-for="(data, i) in platformList" :key="i + 'templateId'" :label="data.name"
                  :value="data.templateId" />
              </dyt-select>
              <el-button type="success" @click="replaceTemplateCommand(3)">
                更换
                <i class="el-icon-sort transiRorate" />
              </el-button>
            </div>
          </el-form-item>
          <el-form-item v-if="[2, 3].includes(formData.type)" label="修改:" class="nestingForm" prop="editType">
            <div class="flexCenter">
              <el-form-item label-width="0" class="itemWidth120 mr10" prop="editType">
                <dyt-select v-model="formData.editType">
                  <span v-for="(item, i) in editList" :key="i + 'editType'">
                    <el-option v-if="item.show.includes(formData.type)" :label="item.label" :value="item.value" />
                  </span>
                </dyt-select>
              </el-form-item>
              <el-form-item v-if="formData.editType || formData.editType === 0" prop="editNum" label-width="0"
                class="itemWidth120">
                <el-input v-model="formData.editNum" type="number" max="100">
                  <span v-if="formData.type === 3" slot="suffix">%</span>
                </el-input>
              </el-form-item>
            </div>
          </el-form-item>
          <template v-if="[0, 1].includes(formData.type)">
            <div class="flexCenter">
              <el-form-item label="利润率:" prop="inputProfitRate">
                <el-input v-model.number="formData.inputProfitRate" class="itemWidth120" type="number">
                  <i slot="suffix">%</i>
                </el-input>
                <el-tooltip content="不使用模板利润率，使用输入的利润率进行改价" placement="top-start" effect="light">
                  <span class="lapa icon-tishi" />
                </el-tooltip>
              </el-form-item>
              <el-form-item label="成本折扣率:" prop="inputDiscount">
                <el-input v-model.number="formData.inputDiscount" class="itemWidth120" type="number">
                  <i slot="suffix">%</i>
                </el-input>
                <el-tooltip content="不使用原成本折扣率，使用输入的成本折扣率（如已开启原价售卖，则都按原价售卖）" placement="top-start" effect="light">
                  <span class="lapa icon-tishi" />
                </el-tooltip>
              </el-form-item>
            </div>

            <div class="flexCenter">
              <el-form-item label="盲盒/无状态链接:" prop="linkType">
                <el-radio-group v-model="formData.linkType">
                  <el-radio :label="0">
                    不调整
                  </el-radio>
                  <el-radio :label="1">
                    按比例调整
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item v-if="formData.linkType === 1" label="售价尾数:" prop="mantissa">
                <el-input v-model.number="formData.mantissa" class="itemWidth120" type="number" />
                <el-tooltip content="关于调整价格窗口中的售价尾数，只能输入1-9之间的某个正整数" placement="top-start" effect="light">
                  <span class="lapa icon-tishi" />
                </el-tooltip>
              </el-form-item>
            </div>
            <el-form-item v-if="formData.linkType === 1" label="调整方式:" prop="ajustWay">
              <el-radio-group v-model="formData.ajustWay">
                <el-radio :label="1">
                  链接最低调整比例
                </el-radio>
                <el-radio :label="2">
                  链接最高调整比例
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </template>

          <el-form-item v-if="priceData.isExistLock" label="">
            <div class="tips">
              选中链接/查询结果存在链接已价格锁定，如需对已锁定价格链接改价，自行停用价格锁定，再执行操作
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer flexJustEnd">
        <el-form ref="totalForm" label-width="0" :model="confirmData" :rules="confirmRules" :inline="true"
          class="totalForm">
          <div class="cofirmTotal" v-if="priceData.priceVerify">
            请在此处确认执行链接数量
            <el-form-item prop="total">
              <el-input style="width: 70px;margin:0 4px;" v-model="confirmData.total" onpaste="return false" />
            </el-form-item>条；
          </div>
          <el-form-item class="mr20">
            可执行修改的链接数量
            <span style="color:#FC2D1A;margin:0 8px;">{{ priceData.priceLength || 0 }}</span>
            条
          </el-form-item>
        </el-form>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="confirmHandle()">
          {{ formData.type === 0 ? '更换模板并修改价格' : '确定' }}
        </el-button>
      </span>
    </el-dialog>
    <!-- 更换模板 -->
    <replace-template ref="replaceTemplate" :model-visible.sync="templateDialog" :template-type="templateType"
      @templateReturn="templateReturn" />
  </div>
</template>

<script>
import Big from 'big.js';
import regular from '@/utils/regular.js';
import replaceTemplate from "@/views/components/replaceTemplate";
export default {
  name: "SalePriceComponentsModifyPrice",
  components: { replaceTemplate },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    priceData: {
      type: Object,
      default() {
        return {
          priceLength: 0,//更改链接长度
          priceType: 1,//更改链接类型
          data: {},//更改链接数据
          isExistLock: false,//是否存在价格锁定
          priceVerify: false,//链接数量
        }
      }
    },
  },
  data() {
    let _self = this;
    return {
      dialogVisible: false,//组件弹框
      btnLoading: false,
      formData: {
        type: 0,
        templateId: '',
        editType: '',
        editNum: '',
        mantissa: '',
        linkType: 0,
        ajustWay: 1,
        inputProfitRate: '',
        inputDiscount: '',
      },
      rules: {
        type: [{ required: true, message: "请选择修改类型", trigger: "change" }],
        templateId: [{ required: true, message: "请选择模板", trigger: "change" }],
        editType: [{ required: true, message: "请选择", trigger: "change" }],
        editNum: [{ validator: _self.validateEditPrice, trigger: 'blur' }],
        mantissa: [{ required: false, pattern: /^[1-9]$/, message: "1-9之间的某个正整数", trigger: 'blur' }],
        inputProfitRate: [{ required: false, pattern: regular.hasPriceNum, message: "0或者正数（允许两位小数）", trigger: 'blur' }],
        inputDiscount: [{ validator: _self.validateCostRate, trigger: 'blur' }],
      },
      typeList: [
        {
          label: '按售价模板调整',
          value: 0,
        },
        {
          label: '按链接绑定模板调整',
          value: 1,
        },
        {
          label: '按数值调整',
          value: 2,
        },
        {
          label: '按比例调整',
          value: 3,
        }
      ],//修改类型
      platformList: [],//模板列表
      editList: [
        {
          label: '减少',
          value: 0,
          show: [2, 3],
        },
        {
          label: '增加',
          value: 2,
          show: [2, 3],
        },
        {
          label: '等于',
          value: 1,
          show: [2],
        }
      ],//修改
      templateDialog: false,//模板弹框
      templateType: 3,//模板（1、批量，2、全部，3、单个）
      confirmData: {
        total: '',
      },
      confirmRules: {
        total: [{ validator: this.validateTotal, trigger: 'blur' }],
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
      this.$nextTick(() => {
        this.$refs['modifyPriceForm'].resetFields();
        this.priceData.priceVerify && this.$refs['totalForm'].resetFields();
      })
    },
  },
  methods: {
    open() {
      this.dialogVisible = this.modelVisible;
      // 获取模板列表
      this.$store.dispatch('platformList/gettemplateList').then(list => {
        this.platformList = list || [];
      })
    },
    // 校验数量
    validateTotal(rule, value, callback) {
      if (['', null, undefined].includes(value)) return callback(new Error('请输入'));
      if (Number(value) !== Number(this.priceData.priceLength)) return callback(new Error('数量不对等'));
      callback();
    },
    confirmTotal() {
      return new Promise(resolve => {
        this.$refs['totalForm'].validate((valid) => {
          resolve(valid)
        });
      })
    },
    // 确认修改
    confirmHandle() {
      this.$refs['modifyPriceForm'].validate(async (valid) => {
        if (!valid) return;
        if (this.priceData.priceVerify) {
          let a = await this.confirmTotal();
          if (!a) return false;
        }
        let formData = this.formData;
        let [data, apiUrl, query, str] = [null, '', {}, ''];
        // 批量
        if (this.priceData.priceType == 1) {
          apiUrl = this.api.salePrice.modifyPriceByRule;
          let list = this.priceData.data.list || [];
          data = list.map(k => {
            let temp = {};
            // 按售价模板调整
            if (formData.type === 0) {
              temp.templateId = formData.templateId;
            }
            // 按链接绑定模板调整
            if (formData.type === 1) {
              temp.templateId = k.templateId;
              k.estimatePrice && (temp.newPrice = k.estimatePrice);
            }
            // 按数值调整、按比例调整
            if ([2, 3].includes(formData.type)) {
              // 0减少 2增加 1等于
              let [newPrice, subPirce] = [0, 0];
              // 最终计算的结果
              if (formData.type === 3) {
                subPirce = new Big(k.linkDetailPrice || 0).times(formData.editNum || 0).div(100);
              } else {
                subPirce = formData.editNum || 0;
              }
              // 对应增减对应计算
              if (formData.editType === 0) {
                newPrice = new Big(k.linkDetailPrice || 0).minus(subPirce);
              }
              if (formData.editType === 2) {
                newPrice = new Big(k.linkDetailPrice || 0).plus(subPirce);
              }
              if (formData.editType === 1) {
                newPrice = subPirce;
              }
              temp.newPrice = Number(newPrice);//新价格
              temp.newPrice = temp.newPrice < 0 ? 0 : temp.newPrice;
              formData.mantissa && (temp.mantissa = formData.mantissa);//售价尾数
            }
            // 按售价模板和链接绑定
            if ([0, 1].includes(formData.type)) {
              if (!this.$common.isEmpty(formData.inputProfitRate)) temp.inputProfitRate = formData.inputProfitRate;
              if (!this.$common.isEmpty(formData.inputDiscount)) temp.inputDiscount = formData.inputDiscount;
            }

            temp.linkId = k.linkId;//店铺链接ID
            temp.linkDetailId = k.id;//店铺链接明细ID
            temp.itemId = k.itemId;//链接itemId
            temp.commonStoreId = k.commonStoreId;//店铺ID
            temp.platformSku = k.platformSku;//平台SKU
            temp.price = k.linkDetailPrice;//原价
            temp.type = formData.type;//调整类型
            temp.mantissa = formData.mantissa;//售价尾数

            if ([0, 1].includes(formData.type)) {
              temp.noStatusSkuType = formData.linkType == 1 ? formData.ajustWay : 0;//盲盒调整类型
            }
            return temp;
          })
        } else {
          // 按售价模板调整
          if (formData.type === 0) {
            query.templateId = formData.templateId;
            formData.mantissa && (query.mantissa = formData.mantissa);//售价尾数
          }
          query.type = formData.type;//调整类型
          if ([0, 1].includes(formData.type)) {
            query.noStatusSkuType = formData.linkType == 1 ? formData.ajustWay : 0;//盲盒调整类型
            query.mantissa = formData.mantissa || '';//售价尾数
            if (!this.$common.isEmpty(formData.inputProfitRate)) query.inputProfitRate = formData.inputProfitRate;
            if (!this.$common.isEmpty(formData.inputDiscount)) query.inputDiscount = formData.inputDiscount;
          }
          if ([2, 3].includes(formData.type)) {
            (formData.editType || formData.editType === 0) && (query.symbol = formData.editType);
            (formData.editNum || formData.editNum === 0) && (query.quantity = formData.editNum);
            formData.mantissa && (query.mantissa = formData.mantissa);//售价尾数
          }
          Object.keys(query).forEach((k, i) => {
            let splicing = i === 0 ? '?' : '&';
            str += `${splicing}${k}=${query[k]}`;
          })
          apiUrl = this.api.salePrice.modifyPriceByRuleForQuery + str;
          data = this.$common.removeEmpty(this.priceData.data);
        }
        // console.log(data, apiUrl);
        // return;
        this.btnLoading = true;
        this.$http.post(apiUrl, data).then((res) => {
          this.$message.success('操作成功~');
          this.dialogVisible = false;
          this.$emit('search');
          this.$bus.emit('marketing-admin-newsTip');//更新消息
        }).finally(() => {
          this.btnLoading = false;
        })
      });
    },
    // 修改价格
    validateEditPrice(rule, value, callback) {
      if (!(value || value === 0)) return callback(new Error('请填写'));
      let type = this.formData.type;
      let [reg, str] = ['', '']
      reg = type == 3 ? /^([0-9]{1,2}$)|(^[0-9]{1,2}\.[0-9]{1,2}$)|100$/ : regular.hasPriceNum;
      str = type == 3 ? '0到100之间允许包含2位小数' : '保留两位小数的非负数';
      if (!reg.test(value)) return callback(new Error(str));
      callback();
    },
    // 成本折扣率
    validateCostRate(rule, value, callback) {
      if (!this.$common.isEmpty(value) && !regular.checkRate.test(value)) {
        return callback(new Error('输入范围(0-100),保留两位小数!'));
      }
      callback();
    },
    // 更换模板
    templateReturn(templateInfo) {
      this.formData.templateId = templateInfo.templateId;
      this.$refs.replaceTemplate.dialogVisible = false;
    },
    // 更换模板
    replaceTemplateCommand(e) {
      this.templateType = e;
      this.templateDialog = true;
    },
  }
}
</script>
<style lang="scss">
.modifyPricePage {
  .modifyPriceForm {
    .el-select {
      width: 100%;
    }

    .itemWidth480 {
      width: 480px;
    }

    .itemWidth120 {
      width: 120px;
    }

    .nestingForm {
      margin: 0;
    }

    .transiRorate {
      transform: rotate(90deg);
    }

    .tips {
      color: #F56C6C;
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
}
</style>
