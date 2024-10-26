<template>
  <div class="dialog-content">
    <el-dialog title="设置" :visible.sync="dialogVisible" width="800px" :close-on-click-modal="false" class="settingPage">
      <div v-loading="loading" style="padding:0 10px;">
        <el-form ref="formValidate" :model="formData" :rules="rules" label-width="140px">
          <el-form-item label="店铺代号:">
            <el-input v-model="detail.accountCode" disabled />
          </el-form-item>
          <el-form-item label="账号名:">
            <el-input v-model="detail.account" disabled />
          </el-form-item>
          <el-form-item label="授权状态:">
            <dyt-select v-model="detail.authStatus" disabled>
              <el-option v-for="item in grantStatus" :key="item.value" :label="item.label" :value="item.value" />
            </dyt-select>
          </el-form-item>
          <el-form-item v-if="detail.authStatus == 1" label="付款订阅功能:" prop="fixedPriceTransactionStatus">
            <el-radio-group v-model="formData.fixedPriceTransactionStatus"
              :disabled="formData.syncInventoryStatus == 1 || formData.autoReplenishmentStatus == 1">
              <el-radio v-for="(item, index) in openDownStatus" :key="index + 'fixedPriceTransactionStatus'"
                :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <el-popover placement="right" trigger="hover" popper-class="table-el-popover"
              content="启用店铺防超卖时，自动启用该功能。若店铺需要开启自动补货功能，需启用该功能。">
              <i slot="reference" class="popover-tips-icon el-icon-question" />
            </el-popover>
          </el-form-item>

          <el-form-item label="防超卖:" prop="syncInventoryStatus">
            <el-radio-group v-model="formData.syncInventoryStatus" @change="syncInventoryChange">
              <el-radio v-for="(item, index) in openDownStatus" :key="index + 'syncInventoryStatus'" :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <el-popover placement="right" trigger="hover" popper-class="table-el-popover"
              content="启用店铺防超卖功能后，将自动开启对应状态链接的防超卖功能（停售状态默认超卖警戒值为0）">
              <i slot="reference" class="popover-tips-icon el-icon-question" />
            </el-popover>
          </el-form-item>
          <div v-if="[1, '1'].includes(formData.syncInventoryStatus)" class="replenishment-content">
            <el-form-item v-if="inventoryList.length > 0" label="链接状态:" prop="syncInventoryGoodsStatusList">
              <el-checkbox-group v-model="formData.syncInventoryGoodsStatusList"
                @change="checkboxChange('syncInventoryGoodsStatusList')">
                <el-checkbox v-for="(item, index) in inventoryList" :key="`item-${index}`" :label="item.value"
                  :disabled="[0, '0'].includes(item.value)">
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="超卖警戒值:" class="itemWidth140" prop="syncInventoryWarningValue">
              <el-input v-model.number="formData.syncInventoryWarningValue" placeholder="输入0或者正整数" type="number" />
            </el-form-item>
          </div>

          <el-form-item label="自动开启补货:" prop="autoReplenishmentStatus">
            <el-radio-group v-model="formData.autoReplenishmentStatus">
              <el-radio v-for="(item, index) in openDownStatus" :key="index + 'autoReplenishmentStatus'"
                :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <el-popover placement="right" trigger="hover" popper-class="table-el-popover"
              content="启用该功能后，抓取店铺新链接以及链接状态变更时，会给链接状态与设置的筛选状态一致的链接自动开启自动补货功能。">
              <i slot="reference" class="popover-tips-icon el-icon-question" />
            </el-popover>
          </el-form-item>
          <div v-if="[1, '1'].includes(formData.autoReplenishmentStatus)" class="replenishment-content">
            <el-form-item v-if="checkLinkList.length > 0" label="链接状态:" prop="autoReplenishmentGoodsStatusList">
              <el-checkbox-group v-model="formData.autoReplenishmentGoodsStatusList"
                @change="checkboxChange('autoReplenishmentGoodsStatusList')">
                <el-checkbox v-for="(item, index) in checkLinkList" :key="`item-${index}`" :label="item.value">
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="自动补货值:" class="itemWidth140" prop="autoReplenishment">
              <el-input v-model.number="formData.autoReplenishment" placeholder="请输入大于零的整数" type="number" />
            </el-form-item>
          </div>
          <el-form-item label="盲盒链接自动下架:" prop="autoShelveBlindBoxStatus">
            <el-radio-group v-model="formData.autoShelveBlindBoxStatus">
              <el-radio v-for="(item, index) in openDownStatus" :key="index + 'autoShelveBlindBoxStatus'"
                :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
            <el-popover placement="right" trigger="hover" popper-class="table-el-popover"
              content="启用该功能后，当链接出单时，将会判断主链接中有库存的非随机映射SKU子链接占比是否超过链接总数的40%，若低于40%则下架链接中的随机映射SKU。（链接中存在在售/试卖子链接时，忽略该主链接）">
              <i slot="reference" class="popover-tips-icon el-icon-question" />
            </el-popover>
          </el-form-item>
          <el-form-item label="链接默认绑定仓库:" prop="warehouseIdList">
            <dyt-select v-model="formData.warehouseIdList" multiple>
              <el-option v-for="(item, index) in userWarehouseList" :key="index + 'warehouseIdList'"
                :label="item.warehouseName" :value="item.id" />
            </dyt-select>
            <el-popover placement="right" trigger="hover" content="新上架的链接将自动绑定所选仓库">
              <i slot="reference" class="popover-tips-icon el-icon-question" />
            </el-popover>
          </el-form-item>
          <el-form-item label="默认售价估算模板:">
            <div class="flexCenter">
              <div class="iconParent">
                <el-input class="templateInput" v-model="templateObj.templateInfo.name" disabled />
                <span class="el-icon-circle-close closeIcon" v-if="templateObj.templateInfo.name"
                  @click="templateReturn({})"></span>
              </div>
              <el-button type="success" class="ml20" @click="replaceTemplateCommand(3)">
                更换
                <i class="el-icon-sort transiRorate" />
              </el-button>
            </div>
          </el-form-item>
        </el-form>
        <!-- 更换模板 -->
        <replace-template ref="replaceTemplate" :model-visible.sync="templateObj.templateDialog"
          :template-type="templateObj.templateType" :template-num="templateObj.templateNum"
          :template-data="templateObj.templateData" @templateReturn="templateReturn" />
      </div>
      <span slot="footer" class="dialog-footer">
        <span v-if="disabledEdit" style="color:#f20;">获取数据失败暂不能保存数据，请尝试重新打开</span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-if="!disabledEdit" type="primary" :loading="loading" @click="handleForm('formValidate')">确
          定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FETCH from "@/mixins/fetch";
import regular from '@/utils/regular';
import { getSalesStatus } from '@/utils/staticDataOrigin';
import replaceTemplate from "@/views/components/replaceTemplate";
export default {
  name: "ComponentsSetting",
  components: { replaceTemplate },
  mixins: [FETCH],
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default() { return {} }
    },
    grantStatus: {
      type: Object,
      default() { return {} }
    },
  },
  data() {
    return {
      dialogVisible: false,
      disabledEdit: false,
      formData: {
        fixedPriceTransactionStatus: 0,
        syncInventoryStatus: 0,
        syncInventoryGoodsStatusList: [0],
        syncInventoryWarningValue: '',
        autoReplenishmentStatus: 0,
        autoReplenishmentGoodsStatusList: [],
        autoReplenishment: '',
        autoShelveBlindBoxStatus: null,
        templateId: '',
        warehouseIdList: [],
      },
      rules: {
        fixedPriceTransactionStatus: [
          { required: true, message: '请选择付款订阅功能', trigger: 'change' }
        ],
        syncInventoryStatus: [
          { required: true, message: '请选择防超卖', trigger: 'change' }
        ],
        autoReplenishmentStatus: [
          { required: true, message: '请选择自动开启补货', trigger: 'change' }
        ],
        autoReplenishmentGoodsStatusList: [
          { required: true, message: '请选择筛选链接状态', trigger: 'change' }
        ],
        autoShelveBlindBoxStatus: [
          { required: true, message: '请选择盲盒链接自动下架项', trigger: 'change' }
        ],
        autoReplenishment: [
          { required: true, validator: this.verificationInteger, trigger: 'blur', type: 'number' },
          { required: true, validator: this.verificationInteger, trigger: 'change', type: 'number' }
        ],
        syncInventoryGoodsStatusList: [
          { required: true, message: '请选择筛选链接状态', trigger: 'change' }
        ],
        syncInventoryWarningValue: [
          { required: true, message: '请输入', trigger: 'blur', type: 'number' },
          { pattern: regular.integerZero, message: '请输入大于等于0的整数', trigger: 'blur', type: 'number' },
        ],
        warehouseIdList: [
          { required: true, message: '请选择绑定的仓库', trigger: 'change' }
        ],
      },
      inventoryList: getSalesStatus(['1', '2', '3', '4', '5', '6']),
      checkLinkList: getSalesStatus(['1', '2', '3', '4', '5', '8', '7']),
      openDownStatus: [
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
      loading: false,
      detail: {},

      templateObj: {
        templateDialog: false,//模板弹框
        templateType: 1,//模板（1、批量，2、全部，3、单个）
        templateNum: 0,//模板数量
        templateData: [],//模板数据
        templateInfo: {},//选中模板数据
      },
      userWarehouseList: [],
    }
  },
  watch: {
    modelVisible(val) {
      this.dialogVisible = val;
      val && this.initPage();
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:modelVisible', val);
        this.$refs['formValidate'].resetFields();
      }
    },
    'formData.autoReplenishmentStatus'(val) {
      if ([1, '1'].includes(val)) {
        this.formData.fixedPriceTransactionStatus = 1;
        return;
      }
      this.formData.autoReplenishmentGoodsStatusList = [];
      this.formData.autoReplenishment = null;
    },
    'formData.syncInventoryStatus'(val) {
      if ([0, '0'].includes(val)) return;
      let list = this.formData.syncInventoryGoodsStatusList;
      // 启用时，保证停售为锁定勾选
      if (list.includes(0) || list.includes('0')) return;
      this.formData.syncInventoryGoodsStatusList.push(0);
    }
  },
  methods: {
    getEbayStoreDetail() { // 获取店铺详情
      return new Promise((resolve) => {
        this.$http.get(this.api.storeManagement.getEbayStoreDetail, {
          params: {
            commonStoreId: this.data.commonStoreId
          }
        }).then((res) => {
          resolve(res.data || {});
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 获取全部仓库列表
    getWarehouseList() {
      return new Promise((resolve) => {
        this.$store.dispatch("platformList/getUserWarehouseList").then((list) => {
          resolve(list || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 初始化数据
    initPage() {
      this.loading = true;
      this.disabledEdit = false;
      let data = this.$common.copy(this.data);
      const getInit = [
        { request: this.getEbayStoreDetail(), key: 'ebayStoreDetail' },
        { request: this.getWarehouseList(), key: 'userWarehouseList' },
      ];
      // 获取初始页面数据
      Promise.all(getInit.map(m => m.request)).then((arr) => {
        arr.forEach((res, index) => {
          if (getInit[index].key === 'ebayStoreDetail') {
            this.detail = { ...data, ...res };
          }
          if (getInit[index].key === 'userWarehouseList') {
            this.userWarehouseList = res;
          }
        });
        // 表单赋值
        Object.keys(this.formData).forEach(key => {
          if (key === 'warehouseIdList') {
            let list = (this.detail['erpWarehouseVOList'] || []).map(k => k.id);
            this.$set(this.formData, key, list);
          } else if (typeof this.detail[key] !== 'undefined') {
            this.$set(this.formData, key, this.detail[key]);
          }
        });

        // 模板信息
        let ebayStoreTemplateVO = this.detail.ebayStoreTemplateVO || {};
        ebayStoreTemplateVO.templateName && (ebayStoreTemplateVO.name = ebayStoreTemplateVO.templateName);
        this.templateObj.templateInfo = ebayStoreTemplateVO;
        this.formData.templateId = ebayStoreTemplateVO.templateId || '';

        this.loading = false;
        this.$nextTick(() => {
          this.$refs.formValidate && this.$refs.formValidate.clearValidate();
        })
      }).catch(() => {
        this.disabledEdit = true;
        this.loading = false;
      })
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        let temp = this.$common.copy(this.formData);
        temp.commonStoreId = this.data.commonStoreId;
        temp.autoReplenishment = Number(temp.autoReplenishment);
        temp.templateId = temp.templateId || null;
        // console.log(temp);
        this.loading = true;
        this.$http.post(this.api.storeManagement.updateSyncInventory, temp).then((res) => {
          this.$message.success("操作成功!");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      });
    },
    syncInventoryChange(e) {
      e == 1 && (this.formData.fixedPriceTransactionStatus = 1);
    },
    // 验证补货保持量
    verificationInteger(rule, value, callback) {
      if (this.$common.isEmpty(value, true)) {
        callback(new Error('请输入补货保持量'));
        return;
      }
      const newVal = (Number((value.toString()).replace(/[^\d]/g, '')).toString());
      if (isNaN(Number(value)) || Number(value) <= 0 || newVal.length > 5) {
        callback(new Error('请输入最长5位非零正整数'));
        return;
      }
      value !== newVal && (this.formData.autoReplenishment = newVal);
      callback();
    },
    // 更换模板
    replaceTemplateCommand(e) {
      this.templateObj.templateType = e;
      this.templateObj.templateDialog = true;
      this.templateObj.templateData = [{ templateId: this.formData.templateId }]
    },
    // 模板选择结果
    templateReturn(data) {
      this.formData.templateId = data.templateId;
      this.templateObj.templateInfo = data;
      this.$refs.replaceTemplate.dialogVisible = false;
    },
    // 防超卖商品状态与自动补货的商品状态互斥
    checkboxChange(type) {
      let formData = this.formData;
      if (type == 'syncInventoryGoodsStatusList') {
        this.formData.autoReplenishmentGoodsStatusList = formData.autoReplenishmentGoodsStatusList.filter(k => {
          return !formData.syncInventoryGoodsStatusList.includes(k);
        })
      }
      if (type == 'autoReplenishmentGoodsStatusList') {
        this.formData.syncInventoryGoodsStatusList = formData.syncInventoryGoodsStatusList.filter(k => {
          return !formData.autoReplenishmentGoodsStatusList.includes(k);
        })
      }
    }
  }
}
</script>

<style lang="less">
.table-el-popover {
  min-width: 500px;
  max-width: calc((100vw - 700px) / 2);
}

.settingPage {
  .popover-tips-icon {
    font-size: 16px;
    color: #f60;
  }

  .replenishment-content {
    position: relative;
    padding-top: 10px;
    margin-bottom: 10px;
    border: 1px solid #dcdee2;
    border-radius: 5px;

    .itemWidth140 {
      .el-form-item__content {
        width: 140px;
      }
    }
  }

  .transiRorate {
    transform: rotate(90deg);
  }

  .iconParent {
    position: relative;
    flex: 1;
    overflow: hidden;

    &:hover .closeIcon {
      display: block;
    }

    .el-input__inner {
      padding-right: 24px !important;
    }

    .closeIcon {
      display: none;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 6px;
      cursor: pointer;
    }
  }
}
</style>