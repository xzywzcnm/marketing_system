<template>
  <div class="dialog-content product-manage--edit">
    <el-dialog title="操作修改" :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false"
      class="walmartReplenish">
      <div class="mainContent" style="height:600px;">
        <el-form ref="ruleForm" :model="ruleForm" class="tableWrap formb0" style="height:100%;" :show-message="false">
          <el-table ref="table" :data="ruleForm.tableData" height="100%" border :loading="tableLoading"
            :class="!ruleForm.tableData.length ? 'nolength' : ''">
            <el-table-column align="center" label="序号" type="index" width="50" />
            <el-table-column align="center" label="Itemid" prop="itemId" min-width="100px" />
            <el-table-column align="center" label="平台SKU" prop="platformSku" min-width="110px">
              <template slot-scope="{row}">
                <div v-for="(item, index) in row.skuList" :key="index + 'erpSku'">
                  <span>{{ item.sku || "-" }}</span>
                  <span v-if="item.sku && item.quantity">*{{ item.quantity }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="商品状态" width="90px">
              <template slot-scope="{ row }">
                <div v-for="(item, index) in row.statusList" :key="index + 'status'" class="mr4">
                  <span v-if="goodsStatusArr[item]">{{ goodsStatusArr[item].label }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="多属性" min-width="120px">
              <template slot-scope="{ row }">
                <div v-if="row.variationSpecifics">
                  <div v-for="(item, index) in row.variationSpecifics.split(';')" :key="index" class="mb6">
                    {{ item }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="配送类型" width="120px">
              <template slot-scope="{ row }">
                <div v-if="deliveryTypeList[row.fulfillmentType]">
                  {{ deliveryTypeList[row.fulfillmentType].label }}
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" width="150px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">仓库</span>
                  <el-checkbox v-if="ruleForm.tableData.length" v-model="wareChecked"
                    @change="checkSame('warehouseIdList')" />
                </span>
              </template>
              <template slot-scope="{row,$index}">
                <div v-if="![1, '1'].includes(row.fulfillmentType)">
                  <el-form-item :prop="'tableData.' + $index + '.warehouseIdList'"
                    :rules="[{ required: true, message: '请选择仓库', trigger: 'change' }]">
                    <dyt-select v-model="row.warehouseIdList" multiple class="wareStyle">
                      <el-option v-for="(item, index) in userWarehouseList" :key="index" :label="item.warehouseName"
                        :value="item.id" />
                    </dyt-select>
                  </el-form-item>
                </div>
              </template>
            </el-table-column>

            <el-table-column align="center" label="价格" width="130px">
              <template slot-scope="{ row,$index }">
                <el-form-item :prop="'tableData.' + $index + '.newPrice'"
                  :rules="[{ validator: validateInventory, trigger: 'blur', name: 'newPrice' }]">
                  <drop-input v-model="row.newPrice" :list="dropdownList" :index="$index"
                    @dropdownCommand="modifyPriceCommand" />
                </el-form-item>
                <div class="mt4">{{ row.currency || "" }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="库存" width="120px">
              <template slot-scope="{row,$index}">
                <div v-if="![1, '1'].includes(row.fulfillmentType)">
                  <el-form-item :prop="'tableData.' + $index + '.availQuantity'"
                    :rules="[{ validator: validateInventory, trigger: 'blur', name: 'availQuantity' }]">
                    <drop-input v-model="row.availQuantity" :list="dropdownList" :index="$index"
                      @dropdownCommand="inventoryCommand" />
                  </el-form-item>
                </div>
                <span v-else>{{ row.availQuantity || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="补货保持量" width="120px">
              <template slot-scope="{row,$index}">
                <div v-if="!row.statusList.includes(0) && ![1, '1'].includes(row.fulfillmentType)">
                  <el-form-item :prop="'tableData.' + $index + '.autoReplenishment'"
                    :rules="[{ validator: validateReplenish, trigger: 'blur' }]">
                    <!-- 当自动补货开启时，才可以输入补货保持值 -->
                    <drop-input v-model="row.autoReplenishment" :disabled="!row.autoChecked" :list="dropdownList"
                      :index="$index" type="number" @dropdownCommand="autoReplenishCommand" />
                  </el-form-item>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" width="100px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">自动补货</span>
                  <el-checkbox v-model="replenishmentChecked" @change="checkSame('replenishment')"
                    v-if="ruleForm.tableData.length" />
                </span>
              </template>
              <template slot-scope="{row,$index}">
                <!-- 停售状态不显示复选框 -->
                <div v-if="!row.statusList.includes(0) && ![1, '1'].includes(row.fulfillmentType)">
                  <el-checkbox v-model="row.autoChecked" @change="singleChange($index, 'replenishment')" />
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" width="90px">
              <template slot="header" slot-scope="{ }">
                <span class="flexAllcenter">
                  <span class="mr10">防超卖</span>
                  <el-checkbox v-model="inventoryChecked" @change="checkSame('availQuantity')"
                    v-if="ruleForm.tableData.length" />
                </span>
              </template>
              <template slot-scope="{row,$index}">
                <!-- 防超卖功能新增除无状态SKU外全部状态子链接可启用 -->
                <div v-if="!row.statusList.includes(6) && ![1, '1'].includes(row.fulfillmentType)">
                  <el-checkbox v-model="row.invenChecked" @change="singleChange($index, 'availQuantity')" />
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" width="110px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">忽略初始化</span>
                  <el-checkbox v-model="ignoreInitChecked" @change="checkSame('ignoreInitChecked')" />
                </span>
              </template>
              <template slot-scope="{row,$index}">
                <el-checkbox v-model="row.ignoreChecked" @change="singleChange($index, 'ignoreChecked')"
                  v-if="![1, '1'].includes(row.fulfillmentType)" />
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import regular from '@/utils/regular.js';
import { deliveryTypeList } from './fileData.js';
import dropInput from '@/views/components/dropInput';
import { getSalesStatus } from '@/utils/staticDataOrigin';
export default {
  name: "EbayReplenishmenTable",
  components: { dropInput },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default() { return {} }
    },
    platformCode: {
      type: String,
      default: 'walmart'
    },
  },
  data() {
    return {
      tableLoading: false,
      btnLoading: false,
      dialogVisible: false,

      wareChecked: false,//仓库全选
      replenishmentChecked: false,//自动补货全选
      inventoryChecked: false,//防超卖全选
      ignoreInitChecked: false,//初始化全选

      ruleForm: { tableData: [] },
      dropdownList: [{ label: '应用至所有', command: 1 }],
      defaultList: [],
      deliveryTypeList: deliveryTypeList,
      userWarehouseList: [],//用户权限仓库列表
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit('update:modelVisible', val);
    },
  },
  computed: {
    goodsStatusArr() {
      let list = getSalesStatus(['1', '2', '3', '4', '5', '6', '8']);
      let statusObj = {};
      list.forEach(k => statusObj[k.value] = k);
      return statusObj;
    },
  },
  methods: {
    open() {
      this.reset();
      this.dialogVisible = true;
      this.getDetail();
      this.getWarehouseList();
    },
    // 重置
    reset() {
      this.defaultList = [];
      this.ruleForm.tableData = [];

      let resetList = ['wareChecked', 'replenishmentChecked', 'inventoryChecked', 'ignoreInitChecked'];
      resetList.forEach(k => {
        this[k] = false;
      })
    },
    // 获取用户权限仓库列表
    getWarehouseList() {
      this.$store.dispatch("platformList/getUserWarehouseList").then((list) => {
        this.userWarehouseList = list || [];
      }).finally(() => {
        this.getDetail();
      })
    },
    // 获取详情
    getDetail() {
      let [_self, data] = [this, this.data];
      let userWarehouseList = this.userWarehouseList;
      //区分平台区分api
      let plantformData = {
        'walmart': {
          api: _self.api.walmart.getLinkDetail,
          data: {
            linkId: data.linkId
          },
          resultFun(data) {
            plantformData.commonResultFun(data);
          },
        },
        'commonResultFun'(data) {
          _self.ruleForm.tableData = (data || []).map(k => {
            k.availQuantity = k.availQuantity || 0;//库存
            k.autoReplenishment = k.autoReplenishment || 0;
            k.autoChecked = k.autoReplenishment > 0 ? true : false;//自动补货
            k.invenChecked = k.syncInventoryStatus == 1 ? true : false;//防超卖
            k.ignoreChecked = k.ignoreInitialization == 1 ? true : false;//初始化
            k.newPrice = k.price;
            // 处理仓库（无权限不显示）
            const warehouseIdList = k.warehouseIds ? k.warehouseIds.split(',') : [];
            k.warehouseIdList = warehouseIdList.map(k => Number(k)).filter(fk => {
              let flag = false;
              userWarehouseList.forEach(userWare => {
                !flag && userWare.id === fk && (flag = true);
              })
              return flag;
            });
            _self.handleMappingSku(k);//处理映射sku关系
            return k;
          });
          _self.checkAllShow();
          _self.checkAllIgnoreShow();
          // 存下初始值，比较提交时的改动数据
          _self.defaultList = _self.$common.copy(_self.ruleForm.tableData);
        }
      }

      let temp = plantformData[this.platformCode];
      if (!temp) return this.$message.error("平台异常~");
      this.tableLoading = true;
      this.$http.get(temp.api, { params: temp.data }).then(({ data }) => {
        temp.resultFun(data);
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 正常状态SKU和映射SKU处理统一格式
    handleMappingSku(k) {
      let [skuList, goodsStatus, statusList] = [[], k.erpGoodsStatus, []];
      if ([6].includes(goodsStatus)) {// goodsStatus为6展示无状态SKU
        skuList.push({ sku: null });
        statusList.push(goodsStatus);
      } else if ([7].includes(goodsStatus)) {// goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
        let erpSkuMappingVO = k.erpSkuMappingVO || [];
        let blindBox = false;//是否盲盒
        erpSkuMappingVO.forEach(vo => {
          if (blindBox) return;
          blindBox = vo.skuType == 1;// 映射类型，0：组合产品，1：随机发一个SKU产品
          k.productName = vo.name;
          const sku = blindBox ? k.erpSku : vo.erpSku;
          skuList.push({
            sku: sku,
            quantity: blindBox ? null : vo.quantity,
          })
          statusList.push(blindBox ? 8 : vo.erpGoodsStatus);
        })
      } else { // goodsStatus为0-5展示erpSku 或者不在其中状态的也展示最基础的
        skuList.push({ sku: k.erpSku });
        statusList.push(goodsStatus);
      }
      k.skuList = skuList;

      k.statusList = Array.from(new Set(statusList)).map(k => {
        const numType = !!(typeof k === 'string' && k);
        let status = numType ? Number(k) : k;
        return status;
      });
    },
    // 验证补货保持量
    validateReplenish(rule, value, callback) {
      let arr = rule.field.split('.');
      let row = this.ruleForm[arr[0]][arr[1]];
      if (row.autoChecked) {
        if (['', undefined, null].includes(value)) {
          callback(new Error('请输入内容'));
          return;
        }
        let reg = regular.integerZero;
        if (!reg.test(value)) {
          callback(new Error('请输入大于等于0的整数'));
          return;
        }
      }
      callback();
    },
    // 验证库存
    validateInventory(rule, value, callback) {
      // if (['', undefined, null].includes(value)) {
      //   callback(new Error('请输入内容'));
      //   return;
      // }
      // let reg = regular.integerZero;
      // if (!reg.test(value)) {
      //   callback(new Error('请输入大于等于0的整数'));
      //   return;
      // }
      // callback();

      if (['', undefined, null].includes(value)) {
        callback(new Error('请输入内容'));
        return;
      }
      let regList = {
        'availQuantity': {
          reg: regular.integerZero,
          msg: '只允许输入0跟正整数',
        },
        'newPrice': {
          reg: regular.positiveFloat,
          msg: '允许输入正数,最多2位小数',
        }
      }
      let reg = regList[rule.name].reg;
      if (!reg.test(value)) {
        callback(new Error(regList[rule.name].msg));
        return;
      }
      callback();

    },
    // 确认修改
    confirmHandle() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return;
        let [list, defaultList, _self] = [[], this.defaultList || [], this];
        this.ruleForm.tableData.forEach((k, i) => {
          let dk = defaultList[i] || {};

          let params = {};
          params['quantity'] = Number(k.availQuantity) === Number(dk.availQuantity);//库存
          params['replenish'] = Number(k.autoReplenishment) === Number(dk.autoReplenishment);//补货保持量
          params['autoChecked'] = k.autoChecked === dk.autoChecked;//自动补货
          params['invenChecked'] = k.invenChecked === dk.invenChecked;//防超卖
          params['ignoreChecked'] = k.ignoreChecked === dk.ignoreChecked;//忽略初始化
          params['warehouseIdList'] = JSON.stringify(k.warehouseIdList) === JSON.stringify(dk.warehouseIdList);//仓库
          params['newPrice'] = k.newPrice === dk.newPrice;//价格
          const newList = Object.keys(params).filter(k => {
            return !params[k];
          })
          if (newList.length) list.push(k);
        })
        if (!list.length) {
          this.$message.warning("数据无改动~");
          return;
        }
        //区分平台区分api
        let plantformData = {
          'walmart': {
            api: _self.api.walmart.updateLinksInfo,
            data: () => {
              return list.map(k => {
                return {
                  id: k.id,
                  newInventoryQuantity: k.availQuantity,//新库存值
                  newAutoReplenishment: k.autoChecked ? k.autoReplenishment : 0,
                  newSyncInventoryStatus: k.invenChecked ? 1 : 0,
                  newIgnoreInitialization: k.ignoreChecked ? 1 : 0,
                  newWarehouseIdList: k.warehouseIdList,
                  newPrice: k.newPrice,
                  updatePriceType: 0,//0：按数值调整，1：按比例调整
                  updatePriceSymbol: 1,//0：减少，1：等于，2：增加
                }
              })
            },
          },
        }
        let temp = plantformData[this.platformCode];
        if (!temp) return this.$message.error("平台异常~");
        // console.log(temp.data())
        this.btnLoading = true;
        this.$http.post(temp.api, temp.data()).then((res) => {
          this.$message.success("操作成功~");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.btnLoading = false;
        })
      });
    },
    // 自动补货/防超卖/初始化
    checkSame(checkType) {
      let _self = this;
      let temp = {
        //自动补货
        replenishment() {
          let checked = _self.replenishmentChecked;
          _self.ruleForm.tableData.forEach((k, i) => {
            // 停售状态不显示复选框
            if (k.statusList.includes(0)) return;
            _self.$set(_self.ruleForm.tableData[i], 'autoChecked', checked);
            _self.$set(_self.ruleForm.tableData[i], 'invenChecked', false);
            !checked && _self.$set(_self.ruleForm.tableData[i], 'autoReplenishment', 0);
          })
          _self.inventoryChecked = false;
        },
        //防超卖
        availQuantity() {
          let checked = _self.inventoryChecked;
          _self.ruleForm.tableData.forEach((k, i) => {
            // 防超卖功能新增除无状态SKU外全部状态子链接可启用
            if (k.statusList.includes(6)) return;
            _self.$set(_self.ruleForm.tableData[i], 'autoChecked', false);
            _self.$set(_self.ruleForm.tableData[i], 'invenChecked', checked);
          })
          _self.replenishmentChecked = false;
        },
        // 忽略初始化
        ignoreInitChecked() {
          let checked = _self['ignoreInitChecked'];
          _self.ruleForm.tableData.forEach((k, i) => {
            _self.$set(_self.ruleForm.tableData[i], 'ignoreChecked', checked);
          })
        },
        // 仓库
        warehouseIdList() {
          let checked = _self['wareChecked'];
          if (!checked) return;
          let row = _self.ruleForm.tableData[0];//取第一行值
          _self.ruleForm.tableData.forEach((k, i) => {
            _self.$set(_self.ruleForm.tableData[i], 'warehouseIdList', row.warehouseIdList);
          })
        },
      }
      temp[checkType] && temp[checkType]();
    },
    // 单个选中（自动补货与防超卖功能冲突，只允许开启一个，开启自动补货自动关闭防超卖，开启防超卖自动关闭自动补货；）
    singleChange(index, checkType) {
      let [_self, tableData] = [this, this.ruleForm.tableData];
      let temp = {
        replenishment() {//自动补货
          _self.$set(_self.ruleForm.tableData[index], 'invenChecked', false);
          this.common();
        },
        availQuantity() {//防超卖
          _self.$set(_self.ruleForm.tableData[index], 'autoChecked', false);
          this.common();
        },
        common() {
          // 自动补货关闭清除补货值
          tableData.forEach((k, i) => {
            !k.autoChecked && _self.$set(_self.ruleForm.tableData[i], 'autoReplenishment', 0);
          })
          _self.checkAllShow();
        },
        // 忽略初始化
        ignoreChecked() {
          _self.checkAllIgnoreShow();
        },
      }
      temp[checkType] && temp[checkType]();
    },
    inventoryCommand(data) {
      this.dropdownCommand(data, 'availQuantity');
    },
    autoReplenishCommand(data) {
      this.dropdownCommand(data, 'autoReplenishment', 'autoChecked');
    },
    modifyPriceCommand(data) {
      this.dropdownCommand(data, 'newPrice');
    },
    // 下拉框返回值
    dropdownCommand(data, type, power) {
      if (data.command != 1) return;
      let tableData = this.ruleForm.tableData || [];
      let num = tableData[data.index][type];
      tableData.forEach((row, i) => {
        if (power && !row[power]) return;
        this.$set(this.ruleForm.tableData[i], type, num);
      })
    },
    checkAllShow() {
      let tableData = this.ruleForm.tableData;
      let [autoFlag, invenFlag] = [false, false];
      // 自动补货支持除停售外的其他状态的SKU开启，停售状态不显示复选框
      let autoList = tableData.filter(k => {
        return !k.statusList.includes(0) && ![1, '1'].includes(k.fulfillmentType);
      })
      autoFlag = autoList.filter(k => !k.autoChecked).length;
      this.replenishmentChecked = !!(autoList.length && !autoFlag);

      // 防超卖功能新增除无状态SKU外全部状态子链接可启用
      let invenList = tableData.filter(k => {
        return !k.statusList.includes(6) && ![1, '1'].includes(k.fulfillmentType);
      })
      invenFlag = invenList.filter(k => !k.invenChecked).length;
      this.inventoryChecked = !!(invenList.length && !invenFlag);
    },
    checkAllIgnoreShow() {
      let tableData = this.ruleForm.tableData;
      let ignoreList = tableData.filter(k => !k.ignoreChecked);
      this.ignoreInitChecked = tableData.length && !ignoreList.length;// 总复选框根据列复选框变更
    }
  }
}
</script>
<style lang="less">
.walmartReplenish {
  .tooltip-style {
    div {
      line-height: 20px;
    }
  }

  .el-input__inner {
    text-align: center;
  }
}
</style>