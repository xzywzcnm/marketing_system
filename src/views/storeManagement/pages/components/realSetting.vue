<template>
  <div class="dialog-content">
    <el-dialog title="设置" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false"
      class="realSettingPage" v-loading="pageLoading">
      <div class="formb8" style="padding: 0 20px">
        <el-form ref="formValidate" :model="formData" :rules="rules" label-width="140px" :show-message="false">
          <div class="formWidthLimit">
            <el-form-item label="店铺代号:">
              {{ moduleData.accountCode }}
            </el-form-item>
            <el-form-item label="账号名:">
              {{ moduleData.account }}
            </el-form-item>
            <el-form-item label="授权状态:">
              <span v-if="grantStatus[moduleData.authStatus]">
                {{ grantStatus[moduleData.authStatus].label }}
              </span>
            </el-form-item>
            <el-form-item label="默认仓库:" prop="warehouseList" :rules="[...commonRules]">
              <mulWarehouseSet v-model="formData.warehouseList" :list="userWarehouseList" optionLabel="warehouseName"
                optionValue="id" />
            </el-form-item>
            <el-form-item label="自动开启库存功能:" prop="inventoryFunction" :rules="[...commonRules]">
              <dyt-select v-model="formData.inventoryFunction" @change="formData.autoReplenishment = null">
                <el-option v-for="(item, index) in openInventoryList" :key="index + 'inventoryFunction'"
                  :label="item.label" :value="item.value" />
              </dyt-select>
            </el-form-item>
            <el-form-item label="补货保持值:" prop="autoReplenishment" v-if="formData.inventoryFunction == 2" :rules="[
              {
                required: false,
                validator: validateInventory,
                trigger: 'blur',
                regular: 'positiveNumber',
                message: '请输入正整数'
              },
            ]">
              <el-input v-model.number="formData.autoReplenishment" type="number"></el-input>
            </el-form-item>
            <el-form-item label="自动修改物流信息:" prop="syncDeliveryInfoStatus" :rules="[...commonRules]">
              <el-radio-group v-model="formData.syncDeliveryInfoStatus">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane :label="sitem.name" :name="sitem.id" v-for="(sitem, sindex) in formData.stationList"
              :key="sindex">
              <div class="wareList">
                <div class="displayFlex alignItemEnd mb10">
                  <span class="title">仓库对应处理时间</span>
                  <span class="tips">用于自动调整物流功能</span>
                  <el-button type="primary" @click="addColumn(sindex)" size="mini">新增</el-button>
                </div>
                <el-table :data="sitem.wareProcessTime" style="width: 100%" border>
                  <el-table-column label="仓库" align="center">
                    <template slot-scope="{ $index }">
                      <el-form-item :prop="'stationList.' + sindex + '.wareProcessTime.' + $index + '.warehouseId'"
                        label-width="0">
                        <dyt-select v-model="formData.stationList[sindex].wareProcessTime[$index].warehouseId"
                          @change="addItems($index, sindex, 'warehouseId')">
                          <el-option v-for="(item, index) in userWarehouseList" :key="index" :label="item.warehouseName"
                            :value="item.id" :disabled="disWareList(sindex, item)" />
                        </dyt-select>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="产品类型" align="center">
                    <template slot-scope="{ $index,row }">
                      <el-form-item :prop="'stationList.' + sindex + '.wareProcessTime.' + $index + '.productTypeCode'"
                        label-width="0">
                        <dyt-select v-model="formData.stationList[sindex].wareProcessTime[$index].productTypeCode"
                          @change="addItems($index, sindex, 'productTypeCode')">
                          <el-option v-for="(item, index) in productTypeAllList" :key="index" :label="item.label"
                            :value="item.value" :disabled="row.disProductType.includes(item.value)" />
                        </dyt-select>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="对应处理时间" align="center">
                    <template slot-scope="{ $index }">
                      <el-form-item :prop="'stationList.' + sindex + '.wareProcessTime.' + $index + '.deliveryTime'"
                        :rules="[
                          {
                            required: false,
                            validator: validateInventory,
                            trigger: 'blur',
                            regular: 'integerZero',
                            message: '大于等于0的整数',
                          },
                        ]" label-width="0">
                        <el-input v-model.number="formData.stationList[sindex].wareProcessTime[$index].deliveryTime"
                          type="number"></el-input>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="运输组" align="center">
                    <template slot-scope="{ $index }">
                      <el-form-item :prop="'stationList.' + sindex + '.wareProcessTime.' + $index + '.shippingGroupId'"
                        label-width="0">
                        <dyt-select v-model="formData.stationList[sindex].wareProcessTime[$index].shippingGroupId"
                          @change="shippingGroupChange($index, 'wareProcessTime', sindex)">
                          <el-option v-for="(item, index) in sitem.transportGroupList" :key="index" :label="item.name"
                            :value="item.shippingGroupId" />
                        </dyt-select>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="总交货时间" align="center">
                    <template slot-scope="scope">
                      <div>{{ calDeliverTime(scope.row) }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" align="center">
                    <template slot-scope="{ $index,row }">
                      <el-button size="mini" type="danger" @click="handleDelete($index, sindex)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div class="mt10 wareList">
                <div class="displayFlex alignItemEnd mb10">
                  <span class="title">零库存对应处理时间</span>
                  <span class="tips">用于所有仓库无库存后自动补货，仅适用于自动补货</span>
                </div>
                <el-table :data="sitem.zeroInventory" style="width: 100%" border>
                  <el-table-column label="产品类型" align="center">
                    <template slot-scope="{ $index,row }">
                      <el-form-item :prop="'stationList.' + sindex + '.zeroInventory.' + $index + '.productTypeCode'"
                        label-width="0">
                        <dyt-select v-model="formData.stationList[sindex].zeroInventory[$index].productTypeCode"
                          @change="productTypeChange($index, sindex)">
                          <el-option v-for="(item, index) in productTypeList" :key="index" :label="item.label"
                            :value="item.value" :disabled="disProductTypeList(sindex, item)" />
                        </dyt-select>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="对应处理时间" align="center">
                    <template slot-scope="{ $index }">
                      <el-form-item :prop="'stationList.' + sindex + '.zeroInventory.' + $index + '.deliveryTime'" :rules="[
                        {
                          required: false,
                          validator: validateInventory,
                          trigger: 'blur',
                          regular: 'integerZero',
                          message: '大于等于0的整数',
                        },
                      ]" label-width="0">
                        <el-input v-model.number="formData.stationList[sindex].zeroInventory[$index].deliveryTime"
                          type="number"></el-input>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="运输组" align="center">
                    <template slot-scope="{ $index }">
                      <el-form-item :prop="'stationList.' + sindex + '.zeroInventory.' + $index + '.shippingGroupId'"
                        label-width="0">
                        <dyt-select v-model="formData.stationList[sindex].zeroInventory[$index].shippingGroupId"
                          @change="shippingGroupChange($index, 'zeroInventory', sindex)">
                          <el-option v-for="(item, index) in sitem.transportGroupList" :key="index" :label="item.name"
                            :value="item.shippingGroupId" />
                        </dyt-select>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column label="总交货时间" align="center">
                    <template slot-scope="scope">
                      <div>{{ calDeliverTime(scope.row) }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <span v-if="disabledEdit" style="color: #f20">获取数据失败暂不能保存数据，请尝试重新打开</span>
        <el-button @click="cansel()">取 消</el-button>
        <el-button v-if="!disabledEdit" type="primary" :loading="loading" @click="handleForm('formValidate')">确
          定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Big from 'big.js';
import regular from "@/utils/regular.js";
import mulWarehouseSet from "@/views/components/mulWarehouseSet";
const formData = {
  warehouseList: [],
  inventoryFunction: 0,
  autoReplenishment: null,
  syncDeliveryInfoStatus: null,
  stationList: {},
}

export default {
  name: "realSetting",
  components: { mulWarehouseSet },
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    moduleData: {
      type: Object,
      default() {
        return {};
      },
    },
    grantStatus: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      disabledEdit: false,
      formData: this.$common.copy(formData),
      rules: {},
      pageLoading: false,
      userWarehouseList: [],
      openInventoryList: {
        0: { label: '不开启', value: 0 },
        1: { label: '库存助手', value: 1 },
        2: { label: '自动补货', value: 2 },
      },
      productTypeList: [
        { label: '带电', value: 1 },
        { label: '不带电', value: 2 },
      ],
      commonRules: [
        { required: true, message: '请选择', trigger: 'change' },
        { required: true, message: '请输入', trigger: 'blur' },
      ],
      // transportGroupList: [],
      activeName: null,
    };
  },
  computed: {
    productTypeAllList() {
      return [
        { label: '全部', value: 0 },
        ...this.productTypeList,
      ]
    },
  },
  watch: {
    modelVisible(val) {
      val && this.initPage();
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit("update:modelVisible", val);
      }
    },
  },
  methods: {
    disWareList(sindex, item) {
      let list = this.formData.stationList[sindex].wareProcessTime;
      let conditionList = list.filter(k => {
        // 当A仓库已被选择，且产品类型=全部时，不允许A仓库被再次选择，置灰A仓库
        const conditionOne = k.warehouseId && k.productTypeCode === 0;
        // 已经选中的仓库和产品类型不能再次选择
        const conditionTwo = !(this.$common.isEmpty(k.warehouseId) || this.$common.isEmpty(k.productTypeCode));
        return conditionOne || conditionTwo;
      }).map(k => k.warehouseId);
      return conditionList.includes(item.id);
    },
    disProductTypeList(sindex, item) {
      let list = this.formData.stationList[sindex].zeroInventory;
      let conditionList = list.filter(k => {
        return !this.$common.isEmpty(k.productTypeCode);
      }).map(k => k.productTypeCode);
      return conditionList.includes(item.value);
    },
    getRandomNumber() {
      return parseInt(new Date().getTime() + Math.random() * 1000000000);
    },
    getZeroInventoryRow() {
      return {
        productTypeCode: null,
        shippingGroupId: null,
        deliveryTime: null,
        disProductType: [],
        id: this.getRandomNumber(),
      }
    },
    // 初始化数据
    async initPage() {
      this.formData = this.$common.copy(formData);
      let { commonStoreId } = this.moduleData;
      this.getUserWarehouseList();
      await this.getStationList(commonStoreId);
      await this.getTransportGroupList(commonStoreId);
      this.getDetail(commonStoreId);
      this.dialogVisible = true;
    },
    // 根据店铺获取运输组
    getTransportGroupList(commonStoreId) {
      return this.$store.dispatch("real/getTransportGroupList", { commonStoreId }).then((datas) => {
        Object.values(this.formData.stationList).forEach(item => {
          item.transportGroupList = datas[item.id] || [];
        })
      });
    },
    // 根据店铺获取站点
    getStationList(commonStoreId) {
      return this.$store.dispatch("real/getRealStationList", { commonStoreId }).then((list) => {
        this.activeName = list[0] ? list[0].id : null;
        list = list.map(k => {
          k.wareProcessTime = [];
          k.zeroInventory = [];
          return k;
        })
        this.formData.stationList = this.$common.arrayToObj(list, 'id');
      });
    },
    // 获取用户仓库列表
    getUserWarehouseList() {
      this.$store.dispatch("platformList/getUserWarehouseList").then((list) => {
        this.userWarehouseList = list || [];
      });
    },
    getDetail(commonStoreId) {
      this.pageLoading = true;
      this.$http.get(this.api.storeManagement.real.getDetail, { params: { commonStoreId } })
        .then((res) => {
          if (res.status != 200) {
            this.disabledEdit = true;
            return false;
          }
          let data = res.data || {};
          Object.keys(this.formData).forEach(key => {
            if (key in data) this.formData[key] = data[key];
          })
          let warehouseList = data.warehouseIds ? data.warehouseIds.split(',') : [];
          this.formData.warehouseList = warehouseList;
          this.formData.commonStoreId = commonStoreId;
          this.formData.id = data.id;

          let wareProcessTime = {};
          (data.realStoreWarehouseDeliveryRelDTOList || []).forEach(k => {
            if (!wareProcessTime[k.site]) wareProcessTime[k.site] = [];
            wareProcessTime[k.site].push({
              ...k,
              disProductType: [],
              id: this.getRandomNumber(),
            })
          })
          let zeroInventory = {};
          (data.realStoreZeroInventoryDeliveryRelDTOList || []).forEach(k => {
            if (!zeroInventory[k.site]) zeroInventory[k.site] = [];
            zeroInventory[k.site].push({
              ...k,
              disProductType: [],
              id: this.getRandomNumber(),
            })
          })

          Object.keys(this.formData.stationList).forEach(key => {
            let wareList = wareProcessTime[key] || [];
            this.formData.stationList[key].wareProcessTime = wareList;
            let zeroList = zeroInventory[key] || [];
            if (!zeroList.length) zeroList.push(this.getZeroInventoryRow());
            this.formData.stationList[key].zeroInventory = zeroList;
          })
          this.handleProductType();
        })
        .catch(() => {
          this.disabledEdit = true;
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid, failData) => {
        if (!valid) {
          let tabName = null;
          let stationList = Object.keys(this.formData.stationList);
          Object.keys(failData).forEach(key => {
            let keyList = key.split('.');
            let site = keyList[1];
            if (!tabName && site && stationList.includes(site)) tabName = site;
          })
          tabName && (this.activeName = tabName);
          return false;
        }
        let { commonStoreId } = this.moduleData;
        let temp = this.$common.copy(this.formData);
        temp.warehouseIds = temp.warehouseList.join(',');
        let [wareProcessTime, zeroInventory] = [[], []]
        Object.keys(temp.stationList).forEach(key => {
          let data = temp.stationList[key];
          let siteWareProcessTime = data.wareProcessTime.filter(w => {
            return !(this.$common.isEmpty(w.warehouseId) && this.$common.isEmpty(w.productTypeCode) && this.$common.isEmpty(w.deliveryTime) && this.$common.isEmpty(w.shippingGroupId))
          }).map(w => {
            w.commonStoreId = commonStoreId;
            w.site = key;
            return w;
          })
          let siteZeroInventory = data.zeroInventory.filter(w => {
            return !(this.$common.isEmpty(w.productTypeCode) && this.$common.isEmpty(w.deliveryTime) && this.$common.isEmpty(w.shippingGroupId))
          }).map(w => {
            w.commonStoreId = commonStoreId;
            w.site = key;
            return w;
          })
          wareProcessTime.push(...siteWareProcessTime);
          zeroInventory.push(...siteZeroInventory);
        })
        temp.realStoreWarehouseDeliveryRelDTOList = wareProcessTime;
        temp.realStoreZeroInventoryDeliveryRelDTOList = zeroInventory;
        delete temp.warehouseList;
        delete temp.stationList;
        // console.log(temp);
        // return;
        this.loading = true;
        this.$http
          .post(this.api.storeManagement.real.update, temp)
          .then((res) => {
            if (res.status != 200) return;
            this.$message.success("操作成功!");
            this.dialogVisible = false;
            this.$emit("search");
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    cansel() {
      this.dialogVisible = false;
      this.$refs["formValidate"].resetFields();
    },
    addColumn(sindex) {
      let columnOption = {
        warehouseId: null,
        productTypeCode: null,
        shippingGroupId: null,
        deliveryTime: null,
        disProductType: [],
        id: this.getRandomNumber(),
      }
      this.formData.stationList[sindex].wareProcessTime.push(this.$common.copy(columnOption));
    },
    handleDelete(index, sindex) {
      this.$confirm('确定要删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.formData.stationList[sindex].wareProcessTime.splice(index, 1);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    // 验证库存
    validateInventory(rule, value, callback) {
      if (rule.required && ["", undefined, null].includes(value)) {
        callback(new Error("请输入内容"));
        return;
      }
      if (!this.$common.isEmpty(value) && !regular[rule.regular].test(value)) {
        callback(new Error(rule.message));
        return;
      }
      callback();
    },
    // 计算交货时间
    calDeliverTime(row = {}) {
      let deliveryTime = row.deliveryTime || 0;
      let transportTimeMin = row.transportTimeMin || 0;
      let transportTimeMax = row.transportTimeMax || 0;
      let min = new Big(transportTimeMin).plus(deliveryTime) - 0;
      let max = new Big(transportTimeMax).plus(deliveryTime) - 0;
      if (min === 0 && max === 0) {
        return '';
      }
      if (min === max) {
        return min + ' 工作日';
      }
      return min + '-' + max + ' 工作日';
    },
    addItems(index, sindex, type) {
      let list = this.formData.stationList[sindex].wareProcessTime;
      let row = list[index];
      if (!(this.$common.isEmpty(row.warehouseId) || this.$common.isEmpty(row.productTypeCode))) {
        // 产品类型选择带电或不带电的时候，自动新增一条，仓库相同，产品类型=带电或者不带电的数据
        let sameWareList = list.filter(k => k.warehouseId === row.warehouseId);
        if (!(sameWareList.length > 1 || row.productTypeCode === 0)) {
          let reverProductType = row.productTypeCode == 1 ? 2 : 1;
          this.formData.stationList[sindex].wareProcessTime.splice(index + 1, 0, this.$common.copy({
            ...row,
            productTypeCode: reverProductType,
            id: this.getRandomNumber(),
          }));
        }
      }
      this.handleProductType();
    },
    // 根据产品类型值是否置灰
    handleProductType() {
      this.$nextTick(() => {
        Object.values(this.formData.stationList).forEach((stationItem) => {
          let list = stationItem.wareProcessTime;
          let obj = {};
          list.forEach(k => {
            if (!obj[k.warehouseId]) obj[k.warehouseId] = [];
            obj[k.warehouseId].push(k);
          })
          Object.values(obj).forEach(sameList => {
            list.forEach(lk => {
              sameList.forEach(sk => {
                if (lk.id === sk.id) {
                  let typeList = sameList.filter(k => {
                    return k.id !== sk.id && !this.$common.isEmpty(k.productTypeCode)
                  }).map(k => k.productTypeCode);
                  // 如果存在全部，其余的选项都不能选择
                  let exitsAllList = sameList.filter(k => {
                    return [0, '0'].includes(k.productTypeCode);
                  })
                  let allTypeList = this.productTypeAllList.map(k => k.value);
                  if ([0, '0'].includes(lk.productTypeCode)) {
                    lk.disProductType = [];
                  } else {
                    if (exitsAllList.length) {
                      lk.disProductType = allTypeList;
                    } else {
                      lk.disProductType = typeList.length ? [0, ...typeList] : [];
                    }
                  }
                }
              })
            })
          })
        })
      })
    },
    productTypeChange(index, sindex) {
      let list = this.formData.stationList[sindex].zeroInventory;
      let row = list[index];
      if (!this.$common.isEmpty(row.productTypeCode) && list.length < 2) {
        let reverProductType = row.productTypeCode == 1 ? 2 : 1;
        this.formData.stationList[sindex].zeroInventory.splice(index + 1, 0, this.$common.copy({
          ...row,
          productTypeCode: reverProductType,
          id: this.getRandomNumber(),
        }))
      }
    },
    shippingGroupChange(index, type, sindex) {
      let stationData = this.formData.stationList[sindex];
      let list = stationData[type];
      let row = list[index];
      let transportGroupList = this.$common.arrayToObj(stationData.transportGroupList, 'shippingGroupId');
      let transData = transportGroupList[row.shippingGroupId] || {};
      this.$set(this.formData.stationList[sindex][type][index], 'transportTimeMin', transData.transportTimeMin || 0);
      this.$set(this.formData.stationList[sindex][type][index], 'transportTimeMax', transData.transportTimeMax || 0);
    },
    handleClick(tab, event) {
      // console.log(tab, event);
    }
  },
};
</script>

<style lang="less">
.realSettingPage {
  .formb8 {
    .el-form-item {
      margin-bottom: 8px;
    }
  }

  .formWidthLimit {

    .el-form-item__content,
    .el-select {
      width: 320px;
    }
  }

  .wareList {
    .title {
      font-size: 18px;
      font-weight: bold;
      line-height: 18px;
    }

    .tips {
      line-height: 14px;
      margin: 0 50px 0 30px;
    }
  }
}
</style>