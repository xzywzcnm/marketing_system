<template>
  <div class="dialog-content">
    <el-dialog :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false" class="replenishmenPage">
      <div slot="title" class="dialog-title">
        <span class="titles">库存管理</span>
        <span class="itemids">SPU ID: {{ spuId }}</span>
      </div>
      <div class="mainContent" style="height:600px;">
        <el-form ref="ruleForm" :model="ruleForm" class="tableWrap formb0" style="height:100%;">
          <el-table ref="table" v-loading="loading" :data="ruleForm.tableData" height="100%" border
            :class="!ruleForm.tableData.length ? 'nolength' : ''">
            <el-table-column label="序号" type="index" width="50" align="center" />
            <el-table-column label="店铺" prop="accountCode" align="center" min-width="100px" />
            <el-table-column label="SKU ID" prop="skuId" align="center" min-width="120px" />
            <el-table-column label="SKU" prop="erpSku" align="center" min-width="110px">
              <template slot-scope="{row}">
                <div v-for="(item, index) in row.skuList" :key="index + 'erpSku'">
                  <span>{{ item.sku || "-" }}</span>
                  <span v-if="item.quantity">*{{ item.quantity }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品状态" prop="erpGoodsStatus" align="center" width="100px">
              <template slot-scope="{row}">
                <div v-for="(item, index) in row.skuList" :key="index + 'tag'" class="mr4">
                  <span v-if="goodsStatusArr[item.erpGoodsStatus]">{{ goodsStatusArr[item.erpGoodsStatus].label }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="多属性" align="left" min-width="130px">
              <template slot-scope="{row}">
                <div v-for="(item, index) in row.attrList" :key="index" class="mb6">
                  {{ item }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="价格" prop="price" width="100px" align="center" />
            <el-table-column label="库存" width="120px" align="center">
              <template slot-scope="{row,$index}">
                <el-form-item :prop="'tableData.' + $index + '.inventoryQuantity'"
                  :rules="[{ validator: validateInventory, trigger: 'blur' }]">
                  <drop-input v-model.number="row.inventoryQuantity" :list="dropdownInvenList" :index="$index"
                    type="number" @dropdownCommand="inventoryCommand" />
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column label="补货保持值" width="120px" align="center">
              <!-- 停售状态变更为不允许开启自动补货 ![0].includes(row.goodsStatus) -->
              <template v-if="!row.skuStatusList.includes(0)" slot-scope="{row,$index}">
                <el-form-item :prop="'tableData.' + $index + '.autoReplenishment'"
                  :rules="[{ validator: validateAutoNum, trigger: 'blur' }]">
                  <drop-input v-model.number="row.autoReplenishment" :disabled="!row.autoChecked" :list="dropdownList"
                    :index="$index" type="number" @dropdownCommand="autoCommand" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column align="center" width="100px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">自动补货</span>
                  <el-checkbox v-if="showReplenishmentChecked" v-model="replenishmentChecked"
                    @change="checkSame('replenishment')" />
                </span>
              </template>
              <!-- 停售状态变更为不允许开启自动补货 ![0].includes(row.goodsStatus)-->
              <template v-if="!row.skuStatusList.includes(0)" slot-scope="{row,$index}">
                <el-checkbox v-model="row.autoChecked" @change="singleChange($index, 'replenishment')" />
              </template>
            </el-table-column>
            
            <el-table-column align="center" width="100px">
              <template slot="header" slot-scope="{ }">
                <span class="flexAllcenter">
                  <span class="mr10">防超卖</span>
                  <el-checkbox v-if="showInventoryChecked" v-model="inventoryChecked" @change="checkSame('inventory')" />
                </span>
              </template>
              <!-- 除了无状态/盲盒都可开启防超卖![6, 8].includes(row.goodsStatus)-->
              <template v-if="!(row.skuStatusList.includes(6) || row.skuStatusList.includes(8))"
                slot-scope="{row,$index}">
                <el-checkbox v-model="row.invenChecked" @change="singleChange($index, 'inventory')" />
              </template>
            </el-table-column>

            <el-table-column align="center" width="130px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">
                    <el-tooltip placement="top-start" effect="light">
                      <span class="lapa icon-tishi replenIcon" />
                      <div slot="content" class="tooltip-style">
                        <div>链接忽略初始化后，定时初始化任务将忽略该链接，不再自动补偿该链接的防超卖以及自动补货功能的启用/禁用</div>
                      </div>
                    </el-tooltip>
                    忽略初始化
                  </span>
                  <el-checkbox v-model="ignoreInitChecked" @change="checkSame('ignoreInitChecked')" />
                </span>
              </template>
              <template slot-scope="{row,$index}">
                <el-checkbox v-model="row.ignoreChecked" @change="singleChange($index, 'ignoreChecked')" />
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
import regular from '@/utils/regular';
import dropInput from '@/views/components/dropInput';
import { getSalesStatus } from '@/utils/staticDataOrigin';
export default {
  name: "ReplenishmenTable",
  components: { dropInput },
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default() {
        return {
          detailsInfo: {}
        }
      },
    },
    platformCode: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      dialogVisible: false,

      wareChecked: false,//仓库全选
      replenishmentChecked: false,//自动补货全选
      inventoryChecked: false,//防超卖全选
      ignoreInitChecked: false,//初始化全选

      ruleForm: { tableData: [] },
      dropdownList: [{ label: '应用至所有', command: 1 }],//通用的dropdown下拉配置
      dropdownInvenList: [],//库存的dropdown下拉配置
      defaultList: [],// 最初始化的值（用于比较变动）

      showInventoryChecked: false,// 是否显示防超卖总勾选框
      showReplenishmentChecked: false,// 是否显示自动补货总勾选框

      fixedAttr: ['Colour', 'Size'],// 用来匹配返回属性字段
    }
  },
  computed: {
    spuId () {
      if (this.$common.isEmpty(this.data)) return '';
      return this.data.spuId;
    },
    // 商品状态
    goodsStatusArr() {
      let list = getSalesStatus(['1', '2', '3', '4', '5', '6', '7', '8']);
      let statusObj = {};
      list.forEach(k => statusObj[k.value] = k);
      return statusObj;
    },
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit('update:modelVisible', val);
      this.tableData = [];
    },
  },
  methods: {
    open() {
      this.reset();
      this.dialogVisible = this.modelVisible;
      this.getDetail();
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
    getDetail() {
      let [_self, data] = [this, this.data];
      //区分平台区分api
      let plantformData = {
        'tiktok': {
          api: _self.api.tiktok.queryErpSkuDetailByLink,
          data() {
            return { linkId: data.linkId }
          },
          resultFun(data) {
            let [autoFlag, invenFlag, ignoreFlag, attrLabel] = [true, true, true, []];
            _self.ruleForm.tableData = data.map(k => {
              // 处理多属性
              let attrList = k.variationSpecifics ? k.variationSpecifics.split(';') : [];
              attrLabel = [];//只取其中一条
              attrList.forEach(attrK => {
                if (!attrK) return;
                let list = attrK.split(':');
                k[list[0]] = list[1];
                attrLabel.push(list[0]);
              })
              k.attrList = attrList;
              k.skuList = _self.handleMappingSku(k);
              k.skuStatusList = (k.skuList || []).map(k => {
                const numType = !!(typeof k.erpGoodsStatus === 'string' && k.erpGoodsStatus);
                let status = numType ? Number(k.erpGoodsStatus) : k.erpGoodsStatus;
                return status;
              });
              // console.log(k.skuStatusList, k.skuList)

              // 处理勾选
              k.autoChecked = k.autoReplenishment > 0 ? true : false;//自动补货
              k.invenChecked = k.syncInventoryStatus == 1 ? true : false;//防超卖
              k.ignoreChecked = k.ignoreInitialization == 1 ? true : false;//初始化
              // 用于处理全选勾选框
              // autoFlag && ![0].includes(k.goodsStatus) && (autoFlag = k.autoChecked);//自动补货是否存在非选中
              autoFlag && !k.skuStatusList.includes(0) && (autoFlag = k.autoChecked);//自动补货是否存在非选中
              // invenFlag && ![6, 8].includes(k.goodsStatus) && (invenFlag = k.invenChecked);//防超卖是否存在非选中
              invenFlag && !(k.skuStatusList.includes(6) || k.skuStatusList.includes(8)) && (invenFlag = k.invenChecked);//防超卖是否存在非选中
              ignoreFlag && (ignoreFlag = k.ignoreChecked);//初始化是否存在非选中
              return k;
            });
            // 固定的属性存在属性列表中
            _self.dropdownInvenList = [{ label: '应用至所有', command: 1 }];
            if (attrLabel.includes(_self.fixedAttr[0]) && attrLabel.includes(_self.fixedAttr[1])) {
              _self.dropdownInvenList.push(...[
                { label: '应用到同Color', command: 2 },
                { label: '应用到同Size', command: 3 },
              ])
            }
            // 全选是否选中
            if (data.length) {
              autoFlag && (_self.replenishmentChecked = true);
              invenFlag && (_self.inventoryChecked = true);
              ignoreFlag && (_self.ignoreInitChecked = true);
            }
            // 是否显示防超卖总勾选框![6, 8].includes(k.goodsStatus)
            _self.showInventoryChecked = !!data.filter(k => { return !(k.skuStatusList.includes(6) || k.skuStatusList.includes(8)) }).length;
            // 是否显示自动补货总勾选框![0].includes(k.goodsStatus)
            _self.showReplenishmentChecked = !!data.filter(k => { return !k.skuStatusList.includes(0) }).length;
            _self.defaultList = _self.$common.copy(_self.ruleForm.tableData);
          },
        },
      }

      let temp = plantformData[this.platformCode];
      if (!temp) return this.$message.error("平台异常~");
      this.loading = true;
      if (this.$common.isEmpty(temp.api)) {
        this.loading = false;
        return console.error('获取库存地址不能为空');
      }
      this.$http.get(temp.api, { params: temp.data() }).then(({ data }) => {
        temp.resultFun(data || []);
      }).finally(() => {
        this.loading = false;
      })
    },
    // 处理映射sku关系
    handleMappingSku(k) {
      // 正常状态SKU和映射SKU处理统一格式
      let skuList = [];
      const goodsStatus = k.erpGoodsStatus;
      if ([6].includes(goodsStatus)) {
        // goodsStatus为6展示无状态SKU
        skuList.push({
          sku: null,
          erpGoodsStatus: goodsStatus,
        })
      } else if ([7].includes(goodsStatus)) {
        // goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
        let erpSkuMappingVO = k.erpSkuMappingVO || [];
        let blindBox = false;//是否盲盒
        erpSkuMappingVO.forEach(vo => {
          if (blindBox) return;
          // 映射类型，0：组合产品，1：随机发一个SKU产品
          blindBox = vo.skuType == 1;
          const sku = blindBox ? k.erpSku : vo.erpSku;
          skuList.push({
            sku: sku,
            quantity: blindBox ? null : vo.quantity,
            erpGoodsStatus: blindBox ? 8 : vo.erpGoodsStatus,
          })
        })
      } else {
        // goodsStatus为0-5展示erpSku 或者不在其中状态的也展示最基础的
        skuList.push({
          sku: k.erpSku,
          erpGoodsStatus: goodsStatus,
        })
      }
      return skuList;
    },
    // 确认修改
    confirmHandle() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return;
        let [list, defaultList, _self] = [[], this.defaultList || [], this];
        this.ruleForm.tableData.forEach((k, i) => {
          let dk = defaultList[i] || {};
          let replenish = Number(k.autoReplenishment) === Number(dk.autoReplenishment);//补货保持量
          let autoChecked = k.autoChecked === dk.autoChecked;//自动补货
          let invenChecked = k.invenChecked === dk.invenChecked;//防超卖
          let ignoreChecked = k.ignoreChecked === dk.ignoreChecked;//初始化
          let inventory = Number(k.inventoryQuantity) === Number(dk.inventoryQuantity);//库存

          if (replenish && autoChecked && invenChecked && ignoreChecked && inventory) return;
          list.push(k);
        })
        if (!list.length) {
          this.$message.warning("数据无改动~");
          return;
        }
        //区分平台区分api
        let plantformData = {
          'tiktok': {
            api: _self.api.tiktok.updateAutoReplenishment,
            data: () => {
              return list.map(k => {
                return {
                  linkDetailId: k.linkDetailId,
                  newAutoReplenishment: k.autoChecked ? k.autoReplenishment : 0,
                  newIgnoreInitialization: k.ignoreChecked ? 1 : 0,
                  newInventoryQuantity: k.inventoryQuantity || 0,
                  newSyncInventoryStatus: k.invenChecked ? 1 : 0
                }
              })
            },
          },
        }
        let temp = plantformData[this.platformCode];
        if (!temp) return this.$message.error("平台异常~");
        // console.log(temp.data());
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
    // 全部勾选中
    checkSame(checkType) {
      let _self = this;
      let temp = {
        //自动补货
        replenishment() {
          let checked = _self['replenishmentChecked'];
          _self.ruleForm.tableData.forEach((k, i) => {
            // 停售状态变更为不允许开启自动补货[0].includes(k.goodsStatus)
            if (k.skuStatusList.includes(0)) return;
            _self.$set(_self.ruleForm.tableData[i], 'autoChecked', checked);
            // 自动补货 与防超卖互斥
            if (checked) {
              _self.$set(_self.ruleForm.tableData[i], 'invenChecked', false);
            } else {
              _self.$set(_self.ruleForm.tableData[i], 'autoReplenishment', 0);
            }
          })
          checked && (_self.inventoryChecked = false);
        },
        //防超卖
        inventory() {
          let checked = _self['inventoryChecked'];
          _self.ruleForm.tableData.forEach((k, i) => {
            // 除了无状态/盲盒都可开启防超卖[6, 8].includes(k.goodsStatus)
            if (k.skuStatusList.includes(6) || k.skuStatusList.includes(8)) return;
            _self.$set(_self.ruleForm.tableData[i], 'invenChecked', checked);
            // 防超卖 与自动补货互斥
            if (checked) {
              _self.$set(_self.ruleForm.tableData[i], 'autoChecked', false);
              _self.$set(_self.ruleForm.tableData[i], 'autoReplenishment', 0);
            }
          })
          checked && (_self.replenishmentChecked = false);
        },
        // 忽略初始化
        ignoreInitChecked() {
          let checked = _self['ignoreInitChecked'];
          _self.ruleForm.tableData.forEach((k, i) => {
            _self.$set(_self.ruleForm.tableData[i], 'ignoreChecked', checked);
          })
        },
      }
      temp[checkType] && temp[checkType]();
    },
    // 单个勾选中
    singleChange(index, checkType) {
      let [_self, tableData] = [this, this.ruleForm.tableData];
      let row = tableData[index] || {};
      let temp = {
        // 自动补货 与防超卖互斥
        replenishment() {
          if (row.autoChecked) {
            _self.$set(_self.ruleForm.tableData[index], 'invenChecked', false);
          } else {
            _self.$set(_self.ruleForm.tableData[index], 'autoReplenishment', 0);
          }
          temp.autoAndInventory();
        },
        // 防超卖 与自动补货互斥
        inventory() {
          if (row.invenChecked) {
            _self.$set(_self.ruleForm.tableData[index], 'autoChecked', false);
            _self.$set(_self.ruleForm.tableData[index], 'autoReplenishment', 0);
          }
          temp.autoAndInventory();
        },
        // 忽略初始化
        ignoreChecked() {
          let ignoreList = tableData.filter(k => !k.ignoreChecked);
          _self.ignoreInitChecked = !ignoreList.length;// 总复选框根据列复选框变更
        },
        // 补货和防超卖是相互影响的 一起放这里处理总复选框
        autoAndInventory() {
          // 停售状态变更为不允许开启自动补货![0].includes(k.goodsStatus)
          let autoList = tableData.filter(k => {
            return !k.skuStatusList.includes(0);
          })
          // 自动补货总复选框根据列复选框变更
          let unAutoCheckList = autoList.filter(k => !k.autoChecked);
          _self.replenishmentChecked = autoList.length && !unAutoCheckList.length;

          // 除了无状态/盲盒都可开启防超卖![6, 8].includes(k.goodsStatus)
          let invenList = tableData.filter(k => {
            return !(k.skuStatusList.includes(6) || k.skuStatusList.includes(8));
          })
          // 防超卖总复选框根据列复选框变更
          let unInvenCheckList = invenList.filter(k => !k.invenChecked);//无防超卖存在
          _self.inventoryChecked = invenList.length && !unInvenCheckList.length;
        }
      }
      temp[checkType] && temp[checkType]();
    },
    // 补货保持量下拉返回值
    autoCommand(data) {
      if (data.command != 1) return;
      let tableData = this.ruleForm.tableData || [];
      let num = tableData[data.index].autoReplenishment;
      tableData.forEach((row, i) => {
        if (!row.autoChecked) return;
        this.$set(this.ruleForm.tableData[i], 'autoReplenishment', num);
      })
    },
    // 补货保持量输入限制
    validateAutoNum(rule, value, callback) {
      let arr = rule.field.split('.');
      let row = this.ruleForm[arr[0]][arr[1]];
      if (!row.autoChecked) return callback();
      if (!value) return callback(new Error('请输入'));
      let reg = /^\+?[1-9][0-9]{0,4}$/;
      if (!reg.test(value)) return callback(new Error('请输入正整数,最多5位'));
      callback();
    },
    // 库存输入限制
    validateInventory(rule, value, callback) {
      if (['', null, undefined].includes(value)) {
        callback(new Error('请输入'));
        return;
      }
      if (!regular.checkIsPositiveInteger.test(value)) {
        callback(new Error('请输入大于或等于0的整数'));
        return;
      }
      callback();
    },
    // 库存下拉返回值
    inventoryCommand(data) {
      if (!data.command) return;
      let tableData = this.ruleForm.tableData || [];
      let item = tableData[data.index];
      if (['', null, undefined].includes(item.inventoryQuantity)) return false;
      tableData.forEach((row, i) => {
        // 应用至color 只匹配Colour这种
        if (data.command == 2 && (!(this.fixedAttr[0] in row) || !row.Colour || row.Colour !== item.Colour)) return;
        // 应用至size 只匹配Size这种
        if (data.command == 3 && (!(this.fixedAttr[1] in row) || !(row.Size || row.Size === 0) || row.Size !== item.Size)) return;
        this.$set(this.ruleForm.tableData[i], 'inventoryQuantity', item.inventoryQuantity);
      })
    },
    // 防超卖输入限制
    validOverSaleNum(rule, value, callback) {
      let arr = rule.field.split('.');
      let row = this.ruleForm[arr[0]][arr[1]];
      if (!row.invenChecked) return callback();
      if (['', undefined, null].includes(value)) return callback(new Error('请输入'));
      if (!regular.checkIsPositiveInteger.test(value)) return callback(new Error('请输入大于或等于0的整数'));
      callback();
    },
  }
}
</script>
<style lang="scss" scoped>
.replenishmenPage {
  .dialog-title {
    line-height: 22px;

    .titles {
      font-size: 16px;
      line-height: 22px;
    }

    .itemids {
      margin-left: 24px;
    }
  }
}

.tooltip-style {
  div {
    line-height: 20px;
  }
}
</style>