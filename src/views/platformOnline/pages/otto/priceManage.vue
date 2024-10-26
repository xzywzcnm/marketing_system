<template>
  <div class="dialog-content product-manage--edit ottoReplenishment">
    <el-dialog
      title="价格管理"
      :visible.sync="dialogVisible"
      width="1210px"
      :close-on-click-modal="false"
    >
      <div class="mainContent" style="height: 600px">
        <el-form
          ref="ruleForm"
          :model="ruleForm"
          class="tableWrap formb0"
          style="height: 100%"
          :show-message="false"
        >
          <el-table
            ref="table"
            :data="ruleForm.tableData"
            height="100%"
            border
            :loading="tableLoading"
            :class="!ruleForm.tableData.length ? 'nolength' : ''"
          >
            <el-table-column
              label="序号"
              type="index"
              width="50"
              align="center"
            />
            <el-table-column label="图片" width="90px" align="center">
              <template slot-scope="{ row }">
                <preview-image
                  :url="row.pictureUrl"
                  :file-list="[row.pictureViewUrl]"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="平台SKU"
              prop="platformSku"
              min-width="100px"
              align="center"
            />
            <el-table-column
              label="SKU"
              prop="erpSku"
              align="center"
              min-width="100px"
            >
              <template slot-scope="{ row }">
                <div
                  v-for="(item, index) in row.skuList"
                  :key="index + 'erpSku'"
                >
                  <span>{{ item.sku || "-" }}</span>
                  <span v-if="item.quantity">*{{ item.quantity }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品状态" width="100px" align="center">
              <template slot-scope="{ row }">
                <div
                  v-for="(item, index) in row.skuList"
                  :key="index + 'tag'"
                  class="mr4"
                >
                  <span v-if="goodsStatusArr[item.erpGoodsStatus]">{{
                    goodsStatusArr[item.erpGoodsStatus].label
                  }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="价格" width="130px" align="center">
              <template slot-scope="{ row, $index }">
                <el-form-item
                  :prop="'tableData.' + $index + '.amount'"
                  :rules="[
                    {
                      validator: validatePrice,
                      trigger: 'blur',
                      name: 'amount',
                    },
                  ]"
                >
                  <drop-input
                    v-model="row.amount"
                    :list="dropdownList"
                    :index="$index"
                    @dropdownCommand="amountCommand"
                  />
                </el-form-item>
                <div class="mt4 currency">
                  {{ row.amountCurrency || "" }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="工厂建议价" width="130px" align="center">
              <template slot-scope="{ row, $index }">
                <el-form-item
                  :prop="'tableData.' + $index + '.factoryAmount'"
                  :rules="[
                    {
                      validator: validatePrice,
                      trigger: 'blur',
                      name: 'factoryAmount',
                    },
                  ]"
                >
                  <drop-input
                    v-model="row.factoryAmount"
                    :list="dropdownList"
                    :index="$index"
                    @dropdownCommand="factoryAmountCommand"
                  />
                </el-form-item>
                <div class="mt4 currency">
                  {{ row.factoryAmountCurrency || "" }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="活动价格" width="130px" align="center">
              <template slot-scope="{ row, $index }">
                <el-form-item
                  :prop="'tableData.' + $index + '.salePriceAmount'"
                  :rules="[
                    {
                      validator: validatePrice,
                      trigger: 'blur',
                      name: 'salePriceAmount',
                    },
                    {
                      validator: validActive,
                      trigger: 'blur',
                      index: $index,
                    },
                  ]"
                >
                  <drop-input
                    v-model="row.salePriceAmount"
                    :list="dropdownList"
                    :index="$index"
                    @dropdownCommand="salePriceAmountCommand"
                    type="number"
                    class="salePriceAmount"
                    @change="editNumChange($index)"
                  />
                </el-form-item>
                <div class="mt4 currency">
                  {{ row.salePriceCurrency || "" }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="活动时间" width="320px" align="center">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">活动时间</span>

                  <el-dropdown trigger="click" @command="checkSame">
                    <span class="lapa icon-tihuan blueIcon"></span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="handleTime"
                        >应用至所有(以第一列为准)</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                </span>
              </template>
              <template slot-scope="{ row, $index }">
                <el-form-item
                  :prop="'tableData.' + $index + '.handleTime'"
                  :rules="[
                    {
                      validator: validActive,
                      trigger: 'change',
                      index: $index,
                    },
                    {
                      validator: validActive,
                      trigger: 'blur',
                      index: $index,
                    },
                  ]"
                  class="datetimeranges"
                >
                  <dyt-timePicker
                    v-model="row.handleTime"
                    type="datetimerange"
                    :hidePicker="true"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    :disabled-date="disableData"
                    class="handleTime"
                  >
                  </dyt-timePicker>
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="btnLoading" @click="confirmHandle()"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script >
import regular from "@/utils/regular.js";
import dropInput from "@/views/components/dropInput";
import previewImage from "@/components/previewImage";
import { goodsStatusArr } from "./fileData.js";
export default {
  name: "EbayReplenishmenTable",
  components: { dropInput, previewImage },
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
    platformCode: {
      type: String,
      default: "otto",
    },
  },
  data() {
    return {
      dialogVisible: false,
      tableLoading: false,
      btnLoading: false,
      ruleForm: {
        tableData: [],
      },
      dropdownList: [{ label: "应用至所有", command: 1 }],
      defaultList: [],
      disableData: {
        disabledDate(time) {
          let times = Date.now() - 24 * 60 * 60 * 1000;
          return time.getTime() < times;
        },
      },
      goodsStatusArr: goodsStatusArr(),
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
      this.reset();
      this.dialogVisible = true;
      this.getDetail();
    },
    // 重置
    reset() {
      this.defaultList = [];
      this.ruleForm.tableData = [];
    },
    // 获取详情
    getDetail() {
      let [_self, data] = [this, this.data];
      //区分平台区分api
      let temp = {
        type: "get",
        api: _self.api.otto.queryLinkDetailPriceByLink,
        data: () => {
          let { linkId } = data;
          return { linkId };
        },
        resultFun(data) {
          _self.ruleForm.tableData = (data || []).map((k) => {
            k.handleTime = null;
            if (k.salePriceStartDate && k.salePriceEndDate) {
              k.handleTime = [k.salePriceStartDate, k.salePriceEndDate];
            }
            k.skuList = _self.handleMappingSku(k);
            let picUrl = k.platformPictureUrl;
            k.pictureUrl = picUrl || _self.$common.urlMontage(k.erpPictureUrl);
            k.pictureViewUrl =
              picUrl || _self.$common.urlMontage(k.erpPictureUrl, false);
            return k;
          });
          // 存下初始值，比较提交时的改动数据
          _self.defaultList = _self.$common.copy(_self.ruleForm.tableData);
        },
      };
      this.tableLoading = true;
      this.$http[temp.type](temp.api, { params: temp.data() })
        .then(({ data }) => {
          temp.resultFun(data);
        })
        .finally(() => {
          this.tableLoading = false;
        });
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
        });
      } else if ([7].includes(goodsStatus)) {
        // goodsStatus为7展示erpSkuMappingVO信息->根据skuType展示
        let erpSkuMappingVO = k.erpSkuMappingVOS || [];
        let blindBox = false; //是否盲盒
        erpSkuMappingVO.forEach((vo) => {
          if (blindBox) return;
          // 映射类型，0：组合产品，1：随机发一个SKU产品
          blindBox = vo.skuType == 1;
          const sku = blindBox ? k.erpSku : vo.erpSku;
          skuList.push({
            sku: sku,
            quantity: blindBox ? null : vo.quantity,
            erpGoodsStatus: blindBox ? 8 : vo.erpGoodsStatus,
          });
        });
      } else {
        // goodsStatus为0-5展示erpSku 或者不在其中状态的也展示最基础的
        skuList.push({
          sku: k.erpSku,
          erpGoodsStatus: goodsStatus,
        });
      }
      return skuList;
    },
    // 验证库存
    validatePrice(rule, value, callback) {
      let haveVal = ["", undefined, null].includes(value);
      if (!["salePriceAmount"].includes(rule.name)) {
        if (haveVal) {
          callback(new Error("请输入内容"));
          return;
        }
      }
      if (!haveVal && !regular.positiveFloat.test(value)) {
        callback(new Error("允许输入正数,最多2位小数"));
        return;
      }
      callback();
    },
    // 活动价格和活动时间必填
    validActive(rule, value, callback) {
      let row = this.ruleForm.tableData[rule.index];
      let { salePriceAmount, handleTime } = row;
      if (
        (!salePriceAmount && handleTime) ||
        (salePriceAmount && !handleTime)
      ) {
        callback(new Error("活动价格和活动时间必填!"));
        return;
      }
      callback();
    },
    // 确认修改
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        let [list, defaultList, _self] = [[], this.defaultList || [], this];
        this.ruleForm.tableData.forEach((k, i) => {
          let dk = defaultList[i] || {};
          let params = {};
          params["amount"] = k.amount === dk.amount; //价格
          params["factoryAmount"] = k.factoryAmount === dk.factoryAmount; //工厂建议价
          params["salePriceAmount"] = k.salePriceAmount === dk.salePriceAmount; //销售价格
          params["handleTime"] =
            JSON.stringify(k.handleTime || []) ===
            JSON.stringify(dk.handleTime || []); //销售价格
          const newList = Object.keys(params).filter((k) => {
            return !params[k];
          });
          if (newList.length) list.push(k);
        });
        if (!list.length) {
          this.$message.warning("数据无改动~");
          return;
        }
        //区分平台区分api
        let temp = {
          api: _self.api.otto.updatePrices,
          data: () => {
            return list.map((k) => {
              let handleTime = k.handleTime || [];
              let temp = {};
              temp.linkDetailId = k.linkDetailId;
              temp.newAmount = k.amount;
              temp.newFactoryAmount = k.factoryAmount;
              k.salePriceAmount &&
                (temp.newSalePriceAmount = k.salePriceAmount);
              handleTime[0] && (temp.newSalePriceStartDate = handleTime[0]);
              handleTime[1] && (temp.newSalePriceEndDate = handleTime[1]);
              return temp;
            });
          },
        };
        // console.log(temp.data());
        this.btnLoading = true;
        this.$http
          .post(temp.api, temp.data())
          .then((res) => {
            this.$message.success("操作成功~");
            this.dialogVisible = false;
            this.$emit("search");
          })
          .finally(() => {
            this.btnLoading = false;
          });
      });
    },
    amountCommand(data) {
      this.dropdownCommand(data, "amount");
    },
    factoryAmountCommand(data) {
      this.dropdownCommand(data, "factoryAmount");
    },
    salePriceAmountCommand(data) {
      this.dropdownCommand(data, "salePriceAmount");
    },
    // 下拉框返回值
    dropdownCommand(data, type, power) {
      if (data.command != 1) return;
      let tableData = this.ruleForm.tableData || [];
      let num = tableData[data.index][type];
      tableData.forEach((row, i) => {
        if (power && !row[power]) return;
        this.$set(this.ruleForm.tableData[i], type, num);
      });
    },
    editNumChange(index) {
      this.ruleForm.tableData[index].handleTime = null;
    },
    checkSame(valType) {
      let tableData = this.ruleForm.tableData;
      let item = tableData[0] || {};
      tableData.forEach((k, i) => {
        this.$set(this.ruleForm.tableData[i], valType, item[valType]);
      });
    },
  },
};
</script>
<style lang="scss">
.ottoReplenishment {
  .currency {
    height: 16px;
  }
  .datetimeranges {
    .el-date-editor {
      padding: 3px 4px;
      width: 100%;
      .el-range-input {
        width: 42%;
      }
      .el-range__close-icon {
        width: 0;
      }
    }
  }
}
</style>