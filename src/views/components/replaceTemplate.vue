<template>
  <div class="dialog-content">
    <el-dialog title="更换模板" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false"
      class="replaceTemplatePage appendBodyDialog" append-to-body>
      <div v-loading="selectLoading" class="content">
        <el-form ref="replaceTemplateForm" class="templateForm" label-width="100px" :model="formData" :rules="rules"
          :inline="true">
          <div>
            <el-form-item label="模版:" prop="templateId" class="itemWidth500" label-width="70px">
              <dyt-select v-model="formData.templateId" :disabled="templateEdit == 'detail'" @change="templateChange">
                <el-option v-for="(data, i) in templateList" :key="i + 'templateId'" :label="data.name"
                  :value="data.templateId" />
              </dyt-select>
            </el-form-item>
            <span v-if="[1, 2].includes(templateType)" style="line-height:32px;" class="ml10">
              该次更换模板链接数量：
              <span style="color:#FC2D1A;margin:0 4px;">{{ templateNum }}</span>
              条
            </span>
          </div>
          <div v-loading="formLoading" class="formMain">
            <div class="formContent width-scroll">
              <div>
                <el-form-item label="适用平台:" class="itemWidth120">
                  <dyt-select v-model="templateDetail.platformId" :disabled="prohibit">
                    <el-option v-for="(data, i) in platformList" :key="i" :label="data.label" :value="data.value" />
                  </dyt-select>
                </el-form-item>
                <el-form-item label="适用站点:" class="itemWidth120">
                  <dyt-select v-model="templateDetail.siteId" :disabled="prohibit">
                    <el-option v-for="(data, i) in stationList" :key="i" :label="data" :value="data" />
                  </dyt-select>
                </el-form-item>
                <el-form-item label="备注:" class="itemWidth353">
                  <el-input v-model="templateDetail.remarksInfo" :disabled="prohibit" maxlength="500" />
                </el-form-item>
                <el-form-item label="利润率:" class="itemWidth120">
                  <el-input v-model="templateDetail.profitRate" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="售价币种:" class="itemWidth120">
                  <el-input v-model="templateDetail.currency" :disabled="prohibit" />
                  <!-- <dyt-select v-model="templateDetail.currency" :disabled="prohibit">
                    <el-option v-for="(item, index) in currencyList" :key="index" :label="item.currencyCode"
                      :value="item.currencyCode" />
                  </dyt-select> -->
                </el-form-item>
                <el-form-item label="售价尾数:" class="itemWidth120">
                  <el-input v-model="templateDetail.priceMantissa" :disabled="prohibit" maxlength="1" />
                </el-form-item>
                <el-form-item label="税费率:" class="itemWidth120">
                  <el-input v-model="templateDetail.taxationRate" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="平台佣金:" class="itemWidth120">
                  <el-input v-model="templateDetail.platformCommissionRate" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="佣金手续费:" class="itemWidth120">
                  <el-input v-model="templateDetail.platformFee" :disabled="prohibit">
                    <span slot="suffix">{{ templateDetail.currency || '' }}</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="交易费率:" class="itemWidth120">
                  <el-input v-model="templateDetail.transactionFeeRate" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="papal手续费:" class="itemWidth120">
                  <el-input v-model="templateDetail.ppFeeRate" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="广告费用:" class="itemWidth120">
                  <el-input v-model="templateDetail.adFeeRate" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="店铺杂费率:" class="itemWidth120">
                  <el-input v-model="templateDetail.accountFeeRate" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="店铺杂费:" class="itemWidth120">
                  <el-input v-model="templateDetail.accountFee" :disabled="prohibit">
                    <span slot="suffix">{{ templateDetail.currency }}</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="客退率:" class="itemWidth120">
                  <el-input v-model="templateDetail.customerRefundRate" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="其它率损:" class="itemWidth120">
                  <el-input v-model="templateDetail.otherRateDamage" :disabled="prohibit">
                    <span slot="suffix">%</span>
                  </el-input>
                </el-form-item>
                <el-form-item label="其它费用:" class="itemWidth120">
                  <el-input v-model="templateDetail.otherFee" :disabled="prohibit">
                    <span slot="suffix">{{ templateDetail.currency }}</span>
                  </el-input>
                </el-form-item>
              </div>
              <div>
                <div class="blockTitle">
                  <div>物流运费</div>
                  <div class="line" />
                </div>
                <div>
                  <el-form-item label="头程运费:" class="itemWidth240">
                    <el-input v-model="templateDetail.headwayFee" :disabled="prohibit">
                      <span slot="suffix">CNY / kg</span>
                    </el-input>
                  </el-form-item>
                  <span style="line-height:32px;" class="ml10">(海外仓商品头程运费)</span>
                </div>
                <div>
                  <el-form-item label="尾程运费:" class="finalFreightForm">
                    <div class="finalFreight">
                      <div>
                        <el-form-item label="物流商:" class="itemWidth240" label-width="80px">
                          <el-input v-model="templateDetail.carrierName" :disabled="prohibit" />
                          <!-- <dyt-select v-model="templateDetail.carrierId" :disabled="prohibit" >
                            <el-option v-for="(data, i) in logisticsList" :key="i" :label="data.carrierName"
                              :value="data.carrierId" />
                          </dyt-select> -->
                        </el-form-item>
                        <el-form-item label="国家:" class="itemWidth240" label-width="80px">
                          <el-input v-model="templateDetail.countryName" :disabled="prohibit" />
                          <!-- <dyt-select v-model="templateDetail.countryCode" :disabled="prohibit">
                            <el-option v-for="(item, index) in countryList" :key="index" :label="item.cnName"
                              :value="item.mainCountryCode" />
                          </dyt-select> -->
                        </el-form-item>
                      </div>
                      <div>
                        <el-form-item label="物流渠道:" class="itemWidth100Percent finalFreightForm" label-width="80px">
                          <el-input v-model="templateDetail.shippingMethodName" :disabled="prohibit" />
                          <!-- <dyt-select v-model="templateDetail.shippingMethodId" :disabled="prohibit">
                            <el-option v-for="(data, i) in mailingList" :key="i" :label="data.carrierShippingMethodName"
                              :value="data.shippingMethodId" />
                          </dyt-select> -->
                        </el-form-item>
                      </div>
                    </div>
                  </el-form-item>
                </div>
              </div>

              <div>
                <div class="blockTitle">
                  <div>仓库费用</div>
                  <div class="line" />
                </div>
                <div>
                  <div>
                    <el-form-item label="操作费用模版:" label-width="130px" class="itemWidth240">
                      <el-input v-model="templateDetail.operatingExpenseTemplateName" :disabled="prohibit" />
                      <!-- <dyt-select v-model="templateDetail.operatingExpenseTemplateId" :disabled="prohibit">
                        <el-option v-for="item in OperatingTemplateList" :key="item.templateId"
                          :label="item.templateName" :value="item.templateId" />
                      </dyt-select> -->
                    </el-form-item>
                    <el-form-item label="仓储费用模版:" label-width="130px" class="itemWidth240">
                      <el-input v-model="templateDetail.storageCostTemplateName" :disabled="prohibit" />
                      <!-- <dyt-select v-model="templateDetail.storageCostTemplateId" :disabled="prohibit">
                        <el-option v-for="item in storageTemplateList" :key="item.templateId" :label="item.templateName"
                          :value="item.templateId" />
                      </dyt-select> -->
                    </el-form-item>
                  </div>
                  <div>
                    <!-- v-if="templateDetail.storageCostTemplateId" -->
                    <el-form-item label="计算的库龄:" label-width="130px" class="itemWidth240">
                      <el-input v-model="templateDetail.storageAge" :disabled="prohibit">
                        <span slot="suffix">天</span>
                      </el-input>
                    </el-form-item>
                    <el-form-item label="出仓费用模版:" label-width="130px" class="itemWidth240">
                      <el-input v-model="templateDetail.outOfWarehouseExpensesTemplateName" :disabled="prohibit" />
                      <!-- <dyt-select v-model="templateDetail.outOfWarehouseExpensesTemplateId" :disabled="prohibit">
                        <el-option v-for="item in deliverTemplateList" :key="item.templateId" :label="item.templateName"
                          :value="item.templateId" />
                      </dyt-select> -->
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-if="templateEdit == 'edit'" type="primary" :loading="loading" @click="confirmHandle()">确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ComponentsReplaceTemplate",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    templateType: {//模板（1、批量，2、全部，3、单个）
      type: Number,
      default: 1
    },
    templateNum: {//模板数量
      type: Number,
      default: 0
    },
    templateData: {//模板数据
      type: Array,
      default() { return [] }
    },
    templateEdit: {//模板是否可编辑
      type: String,
      default: 'edit'
    },
  },
  data() {
    return {
      dialogVisible: false,//组件弹框
      loading: false,
      formLoading: false,
      selectLoading: false,
      formData: {
        templateId: '',
      },
      rules: {
        templateId: [{ required: true, message: "请选择模板", trigger: "blur" }],
      },
      templateDetail: {},
      platformList: [
        {
          label: 'Ebay',
          value: 'ebay',
        },
        {
          label: 'Walmart',
          value: 'walmart',
        }
      ],//平台列表
      templateList: [],//模板列表
      stationList: [],//站点列表
      prohibit: true,//控制表单是否可编辑

      // storageTemplateList: [],//仓储费用模板
      // OperatingTemplateList: [],//操作费用模板
      // mailingList: [],//物流渠道
      // countryList: [],//国家
      // logisticsList: [],//物流商
      // currencyList: [],//售价币种
      // deliverTemplateList: [],//出仓费用模版
    }
  },
  watch: {
    modelVisible(val) {
      val && this.open();
    },
    dialogVisible(val) {
      !val && this.$emit('update:modelVisible', val);
    },
  },
  methods: {
    open() {
      this.getList();
      this.dialogVisible = this.modelVisible;
      this.templateDetail = {};
      this.$nextTick(() => {
        this.$refs['replaceTemplateForm'].resetFields();

        // 单个模板反显模板信息
        let templateData = this.templateData;
        if (this.templateType == 3 && templateData.length && templateData[0].templateId) {
          this.formData.templateId = templateData[0].templateId;
          this.templateChange();
        }
      })
    },
    // 获取模板列表
    getList() {
      this.selectLoading = true;
      this.$store.dispatch('platformList/gettemplateList')
        .then(list => {
          this.templateList = list;
        }).finally(() => {
          this.selectLoading = false;
        })
    },
    // 模板切换
    templateChange() {
      this.templateDetail = {};//清空
      let templateId = this.formData.templateId;
      if (!templateId) return;
      this.formLoading = true;
      this.$http.get(this.api.salePrice.getTemplateInfo, { params: { templateId } })
        .then((res) => {
          this.templateDetail = res.data || {};
        }).finally(() => {
          this.formLoading = false;
        })
    },
    // 确认修改
    confirmHandle() {
      this.$refs['replaceTemplateForm'].validate((valid) => {
        if (!valid) return;
        let templateId = this.formData.templateId;
        let list = this.templateList.filter(k => k.templateId === templateId);
        this.$emit('templateReturn', list.length ? list[0] : {});
        // this.dialogVisible = false;
      });
    },
  }
}
</script>
<style lang="scss">
.replaceTemplatePage {
  .content {
    height: calc(80vh - 20px);
  }

  .templateForm {
    height: 100%;
    display: flex;
    flex-direction: column;

    .el-input.is-disabled .el-input__inner {
      color: #606266;
    }

    .formMain {
      flex: 1;
      overflow: hidden;
      border: 1px solid #DCDFE6;
    }

    .formContent {
      padding: 10px;
      height: 100%;
      overflow-y: auto;
    }

    .el-select {
      width: 100%;
    }

    .itemWidth500 {
      .el-form-item__content {
        width: 500px;
      }
    }

    .itemWidth120 {
      .el-form-item__content {
        width: 120px;
      }
    }

    .itemWidth353 {
      .el-form-item__content {
        width: 353px;
      }
    }

    .itemWidth240 {
      .el-form-item__content {
        width: 240px;
      }
    }

    .itemWidth100Percent {
      width: 100%;

      .el-form-item__content {
        width: 100%;
      }
    }

    .blockTitle {
      padding: 10px 0 0 30px;
      font-weight: bold;

      .line {
        width: 410px;
        height: 2px;
        margin: 4px 0 18px;
        background-color: #DCDFE6;
      }
    }

    .finalFreightForm {
      display: flex;

      .el-form-item__content {
        flex: 1;
        overflow: hidden;
      }

      .finalFreight {
        padding: 18px 10px 0 10px;
        border: 1px solid #DCDFE6;
      }
    }

  }
}
</style>
