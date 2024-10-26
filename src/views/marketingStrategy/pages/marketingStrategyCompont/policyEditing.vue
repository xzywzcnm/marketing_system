<template>
  <div>
    <detail-model ref="detailModel" :detail-visible.sync="detailVisible" @confirmBtn="confirmBtn" @cancelBtn="cancelBtn">
      <div v-loading="pageLoading" class="content plr10">
        <el-form ref="basicInfo" :model="basicInfo" :rules="rules" :inline="true" label-width="84px" class="basicInfo">
          <!-- 基础信息 -->
          <div class="basicInfo_item basicInfo_first">
            <el-form-item label="策略名称" prop="strategyName" class="form_name">
              <el-input v-model="basicInfo.strategyName" :disabled="isDisabled" />
            </el-form-item>
            <el-form-item label="策略类型" prop="strategyType">
              <dyt-select v-model="basicInfo.strategyType" :disabled="isDisabled" @change="strategyTypeChange">
                <el-option v-for="(item, index) in policyType" :key="'p' + index" :label="item.name"
                  :value="item.value" />
              </dyt-select>
            </el-form-item>
            <el-form-item label="触发频次" prop="triggerFrequency">
              <div class="el-form-item_box">
                <dyt-select v-model="basicInfo.triggerFrequency" :disabled="isDisabled">
                  <el-option v-for="(item, index) in triggerFrequencyList" :key="'t' + index" :label="item.name"
                    :value="item.value" />
                </dyt-select>
                <el-tooltip content="每4小时触发频次只适用于Ebay平台" placement="top-start" effect="light">
                  <span class="lapa icon-tishi ml10" />
                </el-tooltip>
              </div>
            </el-form-item>
            <el-form-item label="状态" prop="strategyStatus">
              <dyt-select v-model="basicInfo.strategyStatus" :disabled="isDisabled">
                <el-option v-for="(item, index) in strategyStatuslist" :key="'s' + index" :label="item.name"
                  :value="item.value" />
              </dyt-select>
            </el-form-item>
            <el-form-item label="优先级" prop="priority">
              <dyt-select v-model="basicInfo.priority" :disabled="isDisabled">
                <el-option v-for="(item, index) in 10" :key="'y' + index" :label="item" :value="item" />
              </dyt-select>
            </el-form-item>
          </div>
          <!-- 触发条件 -->
          <div class="basicInfo_item basicInfo_second">
            <div class="basicInfo_second__content">
              <el-form-item label="触发条件:" prop="strategyJudgeList">
                <el-button v-if="!isDisabled" type="primary" plain icon="el-icon-plus" size="mini" @click="addCondition">
                  添加条件
                </el-button>
              </el-form-item>
              <div v-if="basicInfo.strategyJudgeList && basicInfo.strategyJudgeList.length">
                <div v-for="(conItem, conIndex) in basicInfo.strategyJudgeList" :key="'condition' + conIndex">
                  <el-form-item :label="`条件${conItem.sortNo}:`">
                    <div class="basicInfo_flex basicInfo_condition">
                      <span class="mr10">
                        <el-form-item label-width="0" :prop="'strategyJudgeList.' + conIndex + '.dictionaryId'"
                          :rules="{ required: true, message: '请选择', trigger: 'change' }">
                          <dyt-select v-model="conItem.dictionaryId" :disabled="isDisabled"
                            @change="dictionaryChange(conIndex)">
                            <el-option v-for="(item, index) in conditionList" :key="'if' + index" :label="item.type"
                              :value="item.dictionaryId" />
                          </dyt-select>
                        </el-form-item>
                      </span>
                      <span class="mr10">
                        <el-form-item label-width="0" :prop="'strategyJudgeList.' + conIndex + '.conditionJudge'"
                          :rules="{ required: true, message: '请选择', trigger: 'change' }">
                          <dyt-select v-model="conItem.conditionJudge" :disabled="isDisabled || conItem.dictionaryId == 7"
                            @change="conditionJudgeChange(conIndex)">
                            <el-option v-for="(item, index) in conditionalSymbol" :key="'conditionJudge' + index"
                              :label="item.name" :value="item.value" />
                          </dyt-select>
                        </el-form-item>
                      </span>
                      <span class="mr20">
                        <!-- erp商品状态 下拉框的值为ERP中SKU的所有状态值 单选 -->
                        <template v-if="conItem.dictionaryId == 7">
                          <el-form-item label-width="0" :prop="'strategyJudgeList.' + conIndex + '.conditionValue'"
                            :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
                            <dyt-select v-model="conItem.conditionValue" :disabled="isDisabled">
                              <el-option v-for="(item, index) in goodsStatusArr" :key="'conditionValue' + index"
                                :label="item.label" :value="item.value" />
                            </dyt-select>
                          </el-form-item>
                        </template>
                        <!--  -->
                        <template v-else>
                          <el-form-item label-width="0" :prop="'strategyJudgeList.' + conIndex + '.conditionValue'"
                            :rules="[{ required: true, message: '请输入', trigger: 'blur' }, conItem.dictionaryUnit === '%' ? positiveFloat : positiveNumber]">
                            <el-input v-model="conItem.conditionValue" :disabled="isDisabled">
                              <span slot="suffix">{{
                                conditionList[conItem.dictionaryId] &&
                                conditionList[conItem.dictionaryId].unit
                              }}</span>
                            </el-input>
                          </el-form-item>
                        </template>
                      </span>
                      <el-form-item v-if="basicInfo.strategyJudgeList.length > 1 && !isDisabled" label-width="0">
                        <span class="el-icon-circle-close" @click="delCondition(conIndex)" />
                      </el-form-item>
                    </div>
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
          <!-- 提示 -->
          <div class="basicInfo_item basicInfo_explain">
            <div class="active_tips explain_main">
              <span class="explain_main__tit">说明：</span>
              <div class="explain_main__content">
                <span class="basicInfo_explain_tips" :class="{ hideTips: !isExpend }">Ebay平台的7/15/30销量数据不可用，转化率不可用。</span>
                <template v-if="isExpend">
                  <span
                    class="basicInfo_explain_tips">Walmart平台总销量目前不可用，7/15/30天销量每天根据订单同步；上架时间/转化率/收藏数/浏览量每日获取一次最新的数据当天不再更新，上架时间只精确到天。</span>
                </template>
              </div>
            </div>
            <a class="basicInfo_explain_posbtn" href="javascript:;" @click="isExpend = !isExpend">{{
              isExpend ? '隐藏' :
              '展开'
            }}说明</a>
          </div>
          <!-- 底部策略组合 -->
          <div class="basicInfo_footer">
            <div class="basicInfo_item basicInfo_arrange">
              <el-form-item label="调整方式:" prop="rangeMode">
                <el-radio-group v-model="basicInfo.rangeMode" :disabled="isDisabled">
                  <template v-if="basicInfo.strategyType == 2">
                    <el-radio :label="2">
                      同步ERP可用库存
                    </el-radio>
                    <el-radio :label="3">
                      同步ERP可用+在途库存
                    </el-radio>
                  </template>
                  <template v-else>
                    <el-radio v-if="basicInfo.strategyType < 1" :label="0">
                      按比例调整
                    </el-radio>
                    <el-radio :label="1">
                      按数值调整
                    </el-radio>
                  </template>
                </el-radio-group>
              </el-form-item>
              <template v-if="basicInfo.strategyType != 2">
                <el-form-item label="调整:" prop="rangeType">
                  <div class="basicInfo_flex basicInfo_adjust">
                    <span class="mr10">
                      <dyt-select v-model="basicInfo.rangeType" disabled>
                        <el-option v-for="(item, index) in rangeTypeList" :key="'rangeType' + index" :label="item.name"
                          :value="item.value" />
                      </dyt-select>
                    </span>
                    <span class="mr10">
                      <el-form-item label-width="0" prop="rangeStatus">
                        <dyt-select v-model="basicInfo.rangeStatus" :disabled="isDisabled">
                          <el-option v-for="(item, index) in conditionalSymbolText" :key="'rangeStatus' + index"
                            :label="item.name" :value="item.value" />
                        </dyt-select>
                      </el-form-item>
                    </span>
                    <span class="mr20">
                      <el-form-item label-width="0" prop="rangeNum" :rules="[
                            { required: true, message: '请输入', trigger: 'blur' },
                            basicInfo.rangeType === 1 ? positiveFloat : positiveNumber
                          ]">
                        <el-input v-model="basicInfo.rangeNum" :disabled="isDisabled">
                          <span v-if="basicInfo.rangeMode === 0" slot="suffix">%</span>
                        </el-input>
                      </el-form-item>
                    </span>
                  </div>
                </el-form-item>
                <!-- 调整方式为增加、等于时 -->
                <template v-if="basicInfo.rangeStatus !== 1">
                  <el-form-item :label="ajustName + '调整上限:'" class="basicInfo_input" prop="rangeUpperLimit"
                    label-width="110px">
                    <div class="flex-align">
                      <el-input v-model="basicInfo.rangeUpperLimit" :disabled="isDisabled">
                        <span v-if="basicInfo.strategyType === 0" slot="suffix">%</span>
                      </el-input>
                      <el-popover v-if="basicInfo.strategyType === 0" placement="top-start" title="" width="400"
                        trigger="hover" class="self_popover">
                        <!-- <div style="font-size: 12px;" v-html="tipContent('上')" /> -->
                        <div style="font-size: 12px;">
                          <p>原价指的是策略执行时第一次获取的链接SKU价格，设定的原价调整上限会针对每一个链接的SKU进行判断</p>
                          <p style="padding-top: 8px;">
                            计算判断方式为(判断失败则不执行修改)：
                          </p>
                          <p style="text-indent:2em;padding-top: 8px;">
                            增加价格时 （商品实际价格 + 调整数值=修改后价格）&lt;= （商品原价 + 商品原价 * 调整上限百分比=限定值）
                          </p>
                          <p style="text-indent:2em;padding-top: 8px;">
                            减少价格时 （商品实际价格-调整数值=修改后价格）&gt;= （商品原价-商品原价*调整上限百分比=限定值）
                          </p>
                        </div>
                        <div slot="reference" class="lapa icon-tishi ml10" />
                      </el-popover>
                    </div>
                  </el-form-item>
                </template>
                <!-- 调整方式为减少、等于时 -->
                <template v-if="basicInfo.rangeStatus !== 0">
                  <el-form-item :label="ajustName + '调整下限:'" class="basicInfo_input" prop="rangeLowerLimit"
                    label-width="110px">
                    <div class="flex-align">
                      <el-input v-model="basicInfo.rangeLowerLimit" :disabled="isDisabled">
                        <span v-if="basicInfo.strategyType === 0" slot="suffix">%</span>
                      </el-input>
                      <el-popover v-if="basicInfo.strategyType === 0" placement="top-start" title="" width="400"
                        trigger="hover" class="self_popover">
                        <!-- <div style="font-size: 12px;" v-html="tipContent('下')" /> -->
                        <div style="font-size: 12px;">
                          <p>原价指的是策略执行时第一次获取的链接SKU价格，设定的原价调整下限会针对每一个链接的SKU进行判断</p>
                          <p style="padding-top: 8px;">
                            计算判断方式为(判断失败则不执行修改)：
                          </p>
                          <p style="text-indent:2em;padding-top: 8px;">
                            增加价格时 （商品实际价格 + 调整数值=修改后价格）&lt;= （商品原价 + 商品原价 * 调整上限百分比=限定值）
                          </p>
                          <p style="text-indent:2em;padding-top: 8px;">
                            减少价格时 （商品实际价格-调整数值=修改后价格）&gt;= （商品原价-商品原价*调整上限百分比=限定值）
                          </p>
                        </div>
                        <div slot="reference" class="lapa icon-tishi ml10" />
                      </el-popover>
                    </div>
                  </el-form-item>
                </template>
              </template>
            </div>
            <div class="basicInfo_item basicInfo_combination">
              <div>
                <el-form-item label="策略组合:" prop="strategyCombination">
                  <div class="mb10 basicInfo_combinationBtn">
                    <div :class="{ basicInfo_button: combinationFlag }">
                      <el-button v-for="cs in conditSymbolName" :key="cs.value" type="primary" plain
                        :disabled="combinationFlag" @click="insertPolicy(1, cs)">
                        {{ cs.name }}
                      </el-button>
                      <span class="ml10">|</span>
                      <span v-for="(item, index) in basicInfo.strategyJudgeList" :key="'combination' + index">
                        <el-button type="primary" plain :disabled="combinationFlag" class="ml10"
                          @click="insertPolicy(2, item)">条件{{ item.sortNo }}</el-button>
                      </span>
                    </div>
                    <div class="basicInfo_edit">
                      <el-button v-show="combinationFlag && !isDisabled" type="primary" @click="editCombination(false)">
                        编辑
                      </el-button>
                      <div v-show="!combinationFlag">
                        <el-button @click="editCombination(true)">
                          取消
                        </el-button>
                        <el-button plain type="danger" @click="delCombination">
                          删除
                        </el-button>
                        <el-button type="primary" @click="confrimCombination">
                          确定
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div class="basicInfo_textarea" :class="{ basicInfo_textDiabled: combinationFlag }">
                    <span v-for="(item, index) in strategyCombinationList" :key="'strategy' + index">
                      <span v-if="item.type === 1">{{ item.val }}</span>
                      <span v-else style="color:#F56C6C;">{{ item.val }}</span>
                    </span>
                  </div>
                </el-form-item>
              </div>
              <div>
                <el-form-item label="组合预览:">
                  <div class="basicInfo_textarea basicInfo_textDiabled">
                    <span v-if="combinationFlag && strategyCombinationList.length">
                      <span style="color:#F56C6C;">如果</span>
                      <span v-for="(item, index) in strategyCombinationList" :key="'strategyCombination' + index">
                        <template v-if="item.type === 1">{{ item.val }}</template>
                        <template v-else>
                          <span
                            v-if="item.data && (item.data.dictionaryId || item.data.dictionaryId === 0) && (item.data.conditionJudge || item.data.conditionJudge === 0) && (item.data.conditionValue || item.data.conditionValue === 0)">
                            {{ item.data.dictionaryName }}
                            {{ item.data.conditionJudgeName }}
                            <template v-if="item.data.dictionaryId == 7">
                              <span v-for="gitem in goodsStatusArr" :key="'deGoodstatus' + gitem.value">{{
                                gitem.value
                                ===
                                item.data.conditionValue ? gitem.label : ''
                              }}</span>
                            </template>
                            <template v-else>
                              {{ item.data.conditionValue }}
                            </template>
                            {{ item.data.dictionaryUnit }}
                          </span>
                        </template>
                      </span>
                      <span v-if="soIf">
                        <span style="color:#F56C6C;">那么</span>
                        <span>
                          {{ rangeTypeList[basicInfo.rangeType] && rangeTypeList[basicInfo.rangeType].name }}
                          {{
                            conditionalSymbolText[basicInfo.rangeStatus] &&
                            conditionalSymbolText[basicInfo.rangeStatus].name
                          }}
                          {{ basicInfo.rangeNum }}
                          {{ basicInfo.rangeMode === 0 ? '%' : '' }}
                        </span>
                      </span>
                    </span>
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>
        </el-form>
      </div>
      <div v-if="isDisabled" slot="footer">
        <div class="page__content__footer">
          <el-button @click="cancelBtn()">
            返回
          </el-button>
        </div>
      </div>
    </detail-model>
  </div>
</template>
<script>
import { policyType, triggerFrequencyList, strategyStatuslist, conditionalSymbol, conditionalSymbolText, rangeTypeList, goodsStatusArr } from '../components/fileData.js';
import regular from '@/utils/regular.js';
const conditionObj = {
  dictionaryId: '',
  dictionaryName: '',
  dictionaryUnit: '',
  conditionJudge: '',
  conditionJudgeName: '',
  conditionValue: '',
  sortNo: '',//排序
}
const positiveFloat = { message: "大于0且小数点后2位的数", pattern: regular.positiveFloat, trigger: 'blur' };
const positiveNumber = { required: false, message: "请输入大于0的整数", pattern: regular.positiveNumber, trigger: 'blur' };
const basicInfo = {
  strategyName: '',
  strategyType: '',
  triggerFrequency: '',
  strategyStatus: '',
  priority: '',
  strategyJudgeList: [],
  rangeMode: 0,
  rangeType: '',
  rangeStatus: '',
  rangeNum: '',
  rangeUpperLimit: '',
  rangeLowerLimit: '',
  strategyCombination: '',
}
export default {
  name: "MarketingStrategyCompontPolicyEditing",
  components: {},
  props: {
    detailVisible: {//控制弹框
      type: Boolean,
      default() { return false }
    },
    detailRow: {//详情数据
      type: Object,
      default() { return {} }
    },
    isEditdetail: {//控制编辑
      type: Boolean,
      default() { return false }
    },
  },
  data() {
    return {
      basicInfo: {},
      rules: {
        strategyName: [
          { required: true, message: '请输入', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        strategyType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        triggerFrequency: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        strategyStatus: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        priority: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        strategyJudgeList: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        rangeMode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        rangeType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        rangeStatus: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        strategyCombination: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        rangeUpperLimit: [
          { validator: this.rangeUpperLimit, trigger: 'blur' },
        ],
        rangeLowerLimit: [
          { validator: this.rangeLowerLimit, trigger: 'blur' },
        ],
      },
      strategyStatuslist: strategyStatuslist,//状态
      policyType: policyType,//策略类型
      triggerFrequencyList: triggerFrequencyList,//触发频次
      conditionList: {},//条件
      conditionalSymbol: conditionalSymbol,//条件符号
      conditionalSymbolText: conditionalSymbolText,//条件符号文字
      rangeTypeList: rangeTypeList,//调整类型
      combinationFlag: true,//策略组合编辑状态
      strategyJudgeListLen: 10,//条件上限
      strategyCombinationList: [],//策略组合列表
      compareStrategyCombinationList: [],//策略组合列表
      positiveFloat: positiveFloat, //验证浮点数
      positiveNumber: positiveNumber, //验证正数
      detailInfo: {},//详情数据
      pageLoading: false,//页面加载
      conditSymbolName: [
        { name: '插入“ ( ”', value: '(', oname: '(' },
        { name: '插入“ ) ”', value: ')', oname: ')' },
        { name: '且', value: '&&', oname: '且' },
        { name: '或', value: '||', oname: '或' },
      ],
      isExpend: true,
      goodsStatusArr: goodsStatusArr(),
    }
  },
  computed: {
    // 组合预览显示判断
    soIf() {
      let rangeType = Boolean(this.basicInfo.rangeType || this.basicInfo.rangeType === 0);
      let rangeStatus = Boolean(this.basicInfo.rangeStatus || this.basicInfo.rangeStatus === 0);
      let rangeNum = Boolean(this.basicInfo.rangeNum || this.basicInfo.rangeNum === 0);
      return rangeType && rangeStatus && rangeNum && this.basicInfo.strategyType !== 2;
    },
    // 是否可编辑
    isDisabled() {
      return !this.isEditdetail;
    },
    //调整前缀
    ajustName() {
      const ajustName = this.policyType[this.basicInfo.strategyType] && this.policyType[this.basicInfo.strategyType].ajustName;
      return ajustName || '';
    }
  },
  watch: {
    "detailVisible": {
      handler(newVal, oldVal) {
        if (newVal) {
          this.open();
        }
      },
      deep: true,
      immediate: true
    },
    // 将策略组合赋值
    "strategyCombinationList": {
      handler(newVal, oldVal) {
        let strategyCombination = (newVal || []).map(k => {
          let data = k.data || {};
          return k.type === 1 ? data.value : data.sortNo
        }).join('');
        this.basicInfo.strategyCombination = strategyCombination ? { strategyCombination } : '';
      },
      deep: true,
      immediate: true
    },
    "detailRow": {
      handler(newVal, oldVal) {
        if (!newVal || JSON.stringify(newVal) === '{}') {
          this.getConditionList();
        } else {
          this.getConditionList().then(() => {
            this.getDetail(newVal);
          })
        }
      },
      deep: true,
      immediate: true
    },
  },
  created() { },
  methods: {
    // 窗口打开
    open() {
      this.resetAll();
      this.addCondition();
    },
    // 获取策略详情
    getDetail(data) {
      this.pageLoading = true;
      this.$http.post(this.api.marketingStrategy.queryDetailById, { strategyId: data.strategyId }).then((res) => {
        let data = res.data || {};
        // console.log(data);
        this.detailInfo = data;
        Object.keys(this.basicInfo).forEach(k => {
          if (data[k] || data[k] === 0) this.basicInfo[k] = data[k];
        })
        // 处理触发条件数据
        this.basicInfo.strategyJudgeList.forEach((strategy, strategi) => {
          Object.values(this.conditionList).forEach(condition => {
            if (strategy.dictionaryId === condition.dictionaryId) {
              strategy.dictionaryName = condition.type;
              strategy.dictionaryUnit = condition.unit;
            }
          })
          strategy.conditionJudgeName = this.conditionalSymbol[strategy.conditionJudge] && this.conditionalSymbol[strategy.conditionJudge].name;
          strategy.sortNo = strategi + 1;
          strategy.dictionaryId == 7 && (strategy.conditionValue = strategy.conditionValue - 0);
        })

        // 处理策略组合
        let strategyList = [];
        let strategyCombination = data.strategyCombination.strategyCombination;
        let conditList = this.conditSymbolName.map(condit => { return condit.value });
        let totalsplitList = this.splitStrategyCombination([strategyCombination], strategyList, conditList);

        let strategyCombinationList = [];
        totalsplitList.forEach(totalItem => {
          this.conditSymbolName.forEach(condItem => {
            if (totalItem === condItem.value) {
              strategyCombinationList.push({
                type: 1,
                val: condItem.oname,
                data: condItem
              })
            }
          })
          this.basicInfo.strategyJudgeList.forEach(strategyItem => {
            if (totalItem == strategyItem.sortNo) {
              strategyCombinationList.push({
                type: 2,
                val: '条件' + strategyItem.sortNo,
                data: strategyItem
              })
            }
          })
        })
        this.strategyCombinationList = strategyCombinationList;
        this.compareStrategyCombinationList = this.$common.copy(strategyCombinationList);
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 将组合的策略拆分开来
    splitStrategyCombination(list, totaList, conditList) {
      list.forEach(litem => {
        let hasSplit = null;
        conditList.forEach(citem => {
          let index = litem.indexOf(citem);
          !hasSplit && index >= 0 && litem !== citem ? hasSplit = citem : '';
        })
        if (hasSplit) {
          let spliList = [];
          let arr = litem.split(hasSplit);
          arr.forEach((arritem, arrindex) => {
            arritem ? spliList.push(arritem) : '';
            arrindex < arr.length - 1 ? spliList.push(hasSplit) : '';
          })
          this.splitStrategyCombination(spliList, totaList, conditList);
        } else {
          totaList.push(litem);
        }
      })
      return totaList;
    },
    // 重置所有
    resetAll() {
      this.detailInfo = {};
      this.combinationFlag = true;
      this.strategyCombinationList = [];
      this.compareStrategyCombinationList = [];
      this.basicInfo = this.$common.copy(basicInfo);
      this.$nextTick(() => {
        this.$refs["basicInfo"].clearValidate();
      })
    },
    // 条件下拉框列表
    getConditionList() {
      return new Promise((resolve, reject) => {
        if (this.conditionList.length) {
          resolve();
          return;
        }
        this.$http.get(this.api.marketingStrategy.queryAll).then((res) => {
          let obj = {};
          (res.data || []).forEach(k => {
            k.dictionaryId = k.id; //后端更改dictionaryId字段为id
            obj[k.dictionaryId] = k;
          })
          this.conditionList = obj;
          resolve();
        })
      })
    },
    // 确定
    confirmBtn() {
      this.$refs.basicInfo.validate((valid) => {
        if (!valid) return;
        if (!this.combinationFlag) {
          this.$message.error('请确定策略组合~');
          return;
        }
        // 策略组合验证不通过，重新打开验证
        let combinResult = this.confrimCombination();
        if (!combinResult) {
          this.combinationFlag = false;
          return;
        }
        let api = 'saveCommonStrategy';
        let { strategyId } = this.detailInfo;
        let temp = this.$common.copy(this.basicInfo);
        temp.strategyJudgeList.map(k => {
          delete k.conditionJudgeName;
          delete k.dictionaryName;
          delete k.dictionaryUnit;
          return k;
        })
        // 编辑
        if (strategyId) {
          temp.strategyId = strategyId;
          api = 'updateCommonStrategy';
        }
        if (temp.rangeStatus === 0) {
          temp.rangeLowerLimit = '';
        }
        if (temp.rangeStatus === 1) {
          temp.rangeUpperLimit = '';
        }
        // console.log(temp);
        // return;
        this.$refs.detailModel.loading = true;
        this.$http.post(this.api.marketingStrategy[api], temp).then((res) => {
          this.$message.success('操作成功~');
          this.$emit('update:detailVisible', false);
          this.$emit('search', api);
        }).finally(() => {
          this.$refs.detailModel.loading = false;
        })
      });
    },
    // 取消
    cancelBtn() {
      this.$emit('update:detailVisible', false);
    },
    // 添加条件
    addCondition() {
      let len = this.basicInfo.strategyJudgeList.length;
      if (len >= this.strategyJudgeListLen) {
        this.$message.error('触发条件最多10个~');
        return;
      }
      let temp = this.$common.copy(conditionObj);
      temp.sortNo = len + 1;//自定义添加排序
      this.basicInfo.strategyJudgeList.push(temp);
      // console.log(this.basicInfo.strategyJudgeList);
    },
    // 删除条件
    delCondition(index) {
      let obj = this.basicInfo.strategyJudgeList[index] || {};
      // 删除条件，重新打开策略组合，并将对应的条件删除
      if (this.strategyCombinationList.length) {
        this.combinationFlag = false;
        let stratePosition = [];
        this.strategyCombinationList.forEach(strateItem => {
          strateItem.data.sortNo === obj.sortNo ? stratePosition.push(strateItem.data.sortNo) : '';
        })
        if (stratePosition.length) {
          let list = this.strategyCombinationList.filter(strateItem => {
            return !stratePosition.includes(strateItem.data.sortNo);
          })
          this.strategyCombinationList = this.$common.copy(list);
          // 重新对条件排序
          this.strategyCombinationList.forEach(strateItem => {
            if (strateItem.type === 2 && index < strateItem.data.sortNo) {
              strateItem.data.sortNo = strateItem.data.sortNo - 1;
              strateItem.val = '条件' + strateItem.data.sortNo;
            }
          })
          this.compareStrategyCombinationList = this.$common.copy(this.strategyCombinationList);
        }
      }

      this.basicInfo.strategyJudgeList.splice(index, 1);
      // 重新排序
      this.basicInfo.strategyJudgeList.forEach((strategy, strategi) => {
        strategy.sortNo = strategi + 1;
      })
    },
    // 策略类型
    strategyTypeChange(e) {
      this.basicInfo.rangeType = '';
      if (e === 0) this.basicInfo.rangeType = 1;// 价格
      if (e === 1) this.basicInfo.rangeType = 0;// 库存
      this.basicInfo.rangeMode = e || 0;
    },
    // 编辑策略组合
    editCombination(val) {
      this.combinationFlag = val;
      if (val) this.strategyCombinationList = this.$common.copy(this.compareStrategyCombinationList);
    },
    // 符号、条件按钮点击(1:符号；2:条件)
    insertPolicy(type, val) {
      let list = this.strategyCombinationList;
      let result = this.inserValidate(type, val, list);
      if (!result) return;
      if (result.message) {
        this.$message.error(result.message);
      } else {
        this.strategyCombinationList.push(result)
      }
    },
    // 符号条件按钮验证
    inserValidate(type, val = {}, list = []) {
      if (type === 2) {
        const { dictionaryId, conditionJudge, conditionValue } = val;
        if (!((dictionaryId || dictionaryId === 0) && (conditionJudge || conditionJudge === 0) && (conditionValue || conditionValue === 0))) {
          // 触发部分表单
          this.$refs["basicInfo"].validateField([`strategyJudgeList.${val.sortNo - 1}.dictionaryId`, `strategyJudgeList.${val.sortNo - 1}.conditionJudge`, `strategyJudgeList.${val.sortNo - 1}.conditionValue`], valid => { });
          return false;
        }
      }

      let fun = { ...this.normalSet() };
      // 计算出左右括号的数量
      fun.leftBrackets = fun.getBrackets(list, '(');
      fun.rightBrackets = fun.getBrackets(list, ')');
      // 就算左右括号是否对等
      fun.bracketsLengthSame = fun.doubleBrackets();

      let faultResult = this.regularValid(list, val, fun);

      // 将错误返回
      if (!faultResult.valid) { return faultResult }

      return {
        type,
        val: type === 1 ? val.oname : '条件' + val.sortNo,
        data: val
      }
    },
    // 验证括号
    normalSet() {
      return {
        leftBrackets: [],//左括号
        rightBrackets: [],//右括号
        bracketsLengthSame: false,//括号是否对等
        // 获取括号长度
        getBrackets(list, val) {
          return list.map(k => { return k.val }).filter(k => { return k === val })
        },
        // 验证括号是否成对
        doubleBrackets() {
          return this.leftBrackets.length === this.rightBrackets.length;
        },
      }
    },
    // 验证规则
    regularValid(list, val, fun) {
      if (val.oname === '(') {
        // 左边存在左括号
        if (fun.leftBrackets.length) {
          // 检验右括号是否数量对等
          if (!fun.bracketsLengthSame) {
            return {
              valid: false,
              message: `括号必须成对存在~`,
            };
          }
          // 存在数量对等，但是左边不存在且、或
          let orand = list[list.length - 1];//取最后的位置，判断是否为且、或
          if (!['且', '或'].includes(orand.val)) {
            return {
              valid: false,
              message: `相邻俩个条件中间必须有且或者或存在~`,
            };
          }
        }
        // 左边存在条件
        let condition = list.map(k => { return k.type }).filter(k => { return k === 2 });
        let obj = list[list.length - 1];
        if (condition.length && !(['且', '或'].includes(obj.val))) {
          return {
            valid: false,
            message: `相邻俩个条件中间必须有且或者或存在~`,
          };
        }
      } else if (val.oname === ')') {
        // 不存在左括号，或者左右括号长度不对等，或者左括号小于右括号
        if (!fun.leftBrackets.length || fun.bracketsLengthSame || (fun.leftBrackets.length < fun.rightBrackets.length)) {
          return {
            valid: false,
            message: `括号必须成对存在~`,
          };
        }
        // 检验是否存在条件
        let obj = list[list.length - 1];
        let secObj = list[list.length - 2];
        if (!obj || obj.type !== 2) {
          return {
            valid: false,
            message: `括号内必须存在条件~`,
          };
        }
        // 必须存在两个条件才能闭合右括号
        if (obj && obj.type == 2 && secObj.val == '(') {
          return {
            valid: false,
            message: `括号内必须存在两个条件以上~`,
          };
        }
      } else if (['且', '或'].includes(val.oname)) {
        let obj = list[list.length - 1];
        if (!obj || (obj.type !== 2 && obj.val !== ')')) {
          return {
            valid: false,
            message: `"${val.oname}" 左右两边要为条件~`,
          };
        }
      } else {
        // 是否存在右括号
        let obj = list[list.length - 1];
        if (obj && (obj.val === ')' || obj.type === 2)) {
          return {
            valid: false,
            message: `相邻条件中间必须有且或者或存在~`,
          };
        }
        // 是否存在相同条件
        let existCondition = list.filter(k => { return k.data.sortNo === val.sortNo });
        if (existCondition.length) {
          return {
            valid: false,
            message: `${existCondition[0].val}已存在~`,
          };
        }
      }
      return {
        valid: true,
        message: `成功`
      };
    },
    // 确认策略
    confrimCombination() {
      let list = this.strategyCombinationList || [];
      for (let i = 0; i < list.length; i++) {
        let item = list[i] || {};
        let partList = list.slice(0, i);
        let result = this.inserValidate(item.type, item.data, partList);
        if (result.message) {
          this.$message.error(result.message);
          return false;
        }
      }
      // 取最后一个值进行判断是否符合
      let obj = list[list.length - 1];
      if (obj.val === '(') {
        this.$message.error(`括号必须成对存在~`);
        return false;
      }
      if (['且', '或'].includes(obj.val)) {
        this.$message.error(`"${obj.val}" 左右两边要为条件~`);
        return false;
      }
      this.combinationFlag = true;
      this.compareStrategyCombinationList = this.$common.copy(list);
      return true;
    },
    // 删除策略
    delCombination() {
      this.strategyCombinationList = [];
      this.compareStrategyCombinationList = [];
    },
    // 条件切换
    dictionaryChange(index) {
      let obj = this.basicInfo.strategyJudgeList[index];
      Object.values(this.conditionList).forEach(k => {
        if (obj.dictionaryId === k.dictionaryId) {
          obj.dictionaryName = k.type;
          obj.dictionaryUnit = k.unit;
        }
      })
      obj.conditionValue = '';
      // erp商品状态 固定等于号，不可编辑
      if (obj.dictionaryId == 7) {
        obj.conditionJudge = 2;
        this.conditionJudgeChange(index);
      }
    },
    // 符号切换
    conditionJudgeChange(index) {
      let obj = this.basicInfo.strategyJudgeList[index];
      Object.values(this.conditionalSymbol).forEach(k => {
        if (obj.conditionJudge === k.value) obj.conditionJudgeName = k.name;
      })
    },
    // 验证调整上限
    rangeUpperLimit(rule, value, callback) {
      this.rangeLimit(rule, value, callback, 'rangeUpperLimit');
    },
    // 验证调整下限
    rangeLowerLimit(rule, value, callback) {
      this.rangeLimit(rule, value, callback, 'rangeLowerLimit');
    },
    rangeLimit(rule, value, callback, rangeType) {
      if (value) {
        let basicInfo = this.basicInfo;
        if (basicInfo.strategyType === 0) { // 价格
          if (!/^(?!0+(\.0+)?$)\d+(\.\d{0,1})?$/.test(value)) {
            callback(new Error('大于0且小数点后1位'));
            return;
          }
        } else {
          if (!/^-?\d+$/.test(value)) {
            callback(new Error('请输入整数'));
            return;
          }
        }
        if (value > 1000) {
          callback(new Error('最大值不超过1000'));
          return;
        }
        if (rangeType === 'rangeUpperLimit') {
          if (basicInfo.rangeStatus === 2 && basicInfo.rangeLowerLimit && basicInfo.rangeLowerLimit - value > 0) {
            callback(new Error('上限不能小于下限'));
            return;
          }
        }
        if (rangeType === 'rangeLowerLimit') {
          if (basicInfo.rangeStatus === 2 && basicInfo.rangeUpperLimit && basicInfo.rangeUpperLimit - value < 0) {
            callback(new Error('下限不能大于上限'));
            return;
          }
        }
        callback();
      } else {
        callback(new Error('请输入'));
      }
    },
    // tipContent(type) {
    //   return `
    //   <p>原价指的是策略执行时第一次获取的链接SKU价格，设定的原价调整${type}限会针对每一个链接的SKU进行判断</p>
    //   <p style="padding-top: 8px;">计算判断方式为(判断失败则不执行修改)：</p>
    //   <p style="text-indent:2em;padding-top: 8px;">增加价格时 （商品实际价格 + 调整数值=修改后价格）<= （商品原价 + 商品原价 * 调整上限百分比=限定值） </p>
    //   <p style="text-indent:2em;padding-top: 8px;">减少价格时 （商品实际价格-调整数值=修改后价格）>= （商品原价-商品原价*调整上限百分比=限定值）</p>
    //   `
    // }
  }
}
</script>
<style lang="scss">
.content {
  height: 100%;

  .basicInfo {
    height: 100%;
    display: flex;
    flex-direction: column;

    .basicInfo_item {
      padding: 16px 8px 0;
      border-bottom: 1px solid #dcdee2;
    }

    .basicInfo_flex {
      display: flex;
      align-items: center;
    }

    .basicInfo_first {
      .el-form-item {
        margin-bottom: 16px;
      }

      .form_name .el-form-item__content {
        width: 260px;
      }

      .el-form-item_box {
        display: flex;
        flex-direction: row;
      }

      .el-select {
        width: 120px;
      }
    }

    .basicInfo_second {
      flex: 1;
      overflow: hidden;
      min-height: 200px;
      border-bottom: none;

      .basicInfo_second__content {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;

        /*滚动条样式*/
        &::-webkit-scrollbar {
          width: 4px;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 10px;
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          background: rgba(245, 247, 250, 0.1);
        }

        &::-webkit-scrollbar-track {
          -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
          border-radius: 0;
          background: rgba(245, 247, 250, 0.1);
        }

        .item-lists-temp:not(:last-child) {
          margin-bottom: 10px;
        }
      }

      .basicInfo_condition {
        span:nth-child(1) {
          .el-select {
            width: 180px;
          }
        }

        span:nth-child(2) {
          .el-select {
            width: 100px;
          }
        }

        span:nth-child(3) {
          .el-form-item__content {
            width: 120px;
          }
        }

        .el-icon-circle-close {
          font-size: 20px;
          color: #f56c6c;
          cursor: pointer;
        }

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }

    .basicInfo_footer {
      .basicInfo_arrange {
        .el-form-item {
          margin-bottom: 16px;
        }

        .basicInfo_adjust {
          .el-input {
            width: 110px;
          }

          .el-select {
            width: 110px;
          }

          .el-form-item {
            margin-bottom: 0;
          }
        }

        .basicInfo_input {
          .el-form-item__content {
            width: 160px;
          }

          .self_popover {
            height: 32px;
            line-height: 32px;
          }

          .el-popover__reference-wrapper {
            height: 32px;
            line-height: 32px;
            display: inline-flex;
            align-items: center;
          }
        }
      }

      .basicInfo_combination {
        border-bottom: none;
        padding-bottom: 0;

        .el-form-item {
          display: flex;

          .el-form-item__content {
            flex: 1;
          }
        }

        .basicInfo_button {
          .el-button {
            color: #515a6e;
            background: #f0f2f5;
            border-color: #dcdee2;
          }
        }

        .basicInfo_combinationBtn {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .basicInfo_textarea {
          line-height: 20px;
          padding: 10px;
          height: 100px;
          border: 1px solid #dcdee2;
        }

        .basicInfo_textDiabled {
          background: #f0f2f5;
          border-color: #dcdee2;
        }
      }
    }

    .basicInfo_explain {
      font-size: 12px;
      padding: 10px 8px;
      display: flex;
      align-items: flex-end;

      .explain_main {
        color: #d06339;

        display: inline-block;
        display: flex;
        align-items: flex-start;

        .explain_main__tit {
          width: 40px;
          overflow: hidden;
        }

        .explain_main__content {
          .basicInfo_explain_tips {
            display: block;
          }

          .hideTips {
            width: 280px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }
      }

      .basicInfo_explain_posbtn {
        text-decoration: underline;
        color: #409eff;
        width: 80px;
        overflow: hidden;
      }
    }
  }

  .pt6 {
    padding-top: 6px;
  }
}

.page__content__footer {
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
