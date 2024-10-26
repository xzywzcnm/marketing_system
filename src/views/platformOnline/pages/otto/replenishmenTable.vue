<template>
  <div class="dialog-content product-manage--edit ottoReplenishment">
    <el-dialog title="库存管理" :visible.sync="dialogVisible" width="1380px" :close-on-click-modal="false">
      <div class="mainContent" style="height: 600px">
        <el-form ref="ruleForm" :model="ruleForm" class="tableWrap formb0" style="height: 100%" :show-message="false">
          <el-table ref="table" :data="ruleForm.tableData" height="100%" border :loading="tableLoading"
            :class="!ruleForm.tableData.length ? 'nolength' : ''">
            <el-table-column label="序号" type="index" width="50" align="center" />
            <el-table-column label="图片" width="90px" align="center">
              <template slot-scope="{ row }">
                <preview-image :url="row.pictureUrl" :file-list="[row.pictureViewUrl]" />
              </template>
            </el-table-column>
            <el-table-column label="平台SKU" prop="platformSku" min-width="100px" align="center" />
            <el-table-column label="SKU" prop="erpSku" align="center" min-width="100px">
              <template slot-scope="{ row }">
                <div v-for="(item, index) in row.skuList" :key="index + 'erpSku'">
                  <span>{{ item.sku || "-" }}</span>
                  <span v-if="item.quantity">*{{ item.quantity }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品状态" width="100px" align="center">
              <template slot-scope="{ row }">
                <div v-for="(item, index) in row.skuList" :key="index + 'tag'" class="mr4">
                  <span v-if="goodsStatusArr[item.erpGoodsStatus]">{{
                    goodsStatusArr[item.erpGoodsStatus].label
                  }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="仓库" width="200px" align="center">
              <template slot-scope="{ row }">
                <mulWarehouseSet v-model="row.warehouseList" :list="userWarehouseList" optionLabel="warehouseName"
                  optionValue="id" />
              </template>
            </el-table-column>
            <!-- <el-table-column label="处理时间" width="130px" align="center">
              <template slot-scope="{ row, $index }">
                <el-form-item :prop="'tableData.' + $index + '.deliveryTime'" :rules="[
                  {
                    validator: validateInventory,
                    trigger: 'blur',
                    name: 'deliveryTime',
                  },
                ]">
                  <drop-input v-model="row.deliveryTime" :list="dropdownList" :index="$index"
                    @dropdownCommand="processingCommand" />
                  <span class="fixHeight18">days</span>
                </el-form-item>
              </template>
            </el-table-column> -->
            <el-table-column label="运输组" width="130px" align="center">
              <template slot-scope="{ row, $index }">
                <el-form-item :prop="'tableData.' + $index + '.shippingProfileId'" :rules="[
                  { required: true, message: '请选择', trigger: 'change' }
                ]">
                  <dyt-select v-model="row.shippingProfileId">
                    <el-option v-for="(item, index) in transportGroupList" :key="index + 'brand'"
                      :label="item.platformShippingProfileName" :value="item.id" />
                  </dyt-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="库存" width="130px" align="center">
              <template slot-scope="{ row, $index }">
                <el-form-item :prop="'tableData.' + $index + '.inventoryQuantity'" :rules="[
                  {
                    validator: validateInventory,
                    trigger: 'blur',
                    name: 'inventoryQuantity',
                  },
                ]">
                  <drop-input v-model="row.inventoryQuantity" :list="dropdownList" :index="$index"
                    @dropdownCommand="inventoryCommand" />
                  <!-- <span class="fixHeight18"></span> -->
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="补货保持值" width="130px" align="center">
              <template slot-scope="{ row, $index }">
                <el-form-item :prop="'tableData.' + $index + '.autoReplenishment'"
                  :rules="[{ validator: validateReplenish, trigger: 'blur' }]">
                  <drop-input v-model="row.autoReplenishment" :disabled="!row.autoChecked" :list="dropdownList"
                    :index="$index" type="number" @dropdownCommand="autoReplenishCommand" />
                  <!-- <span class="fixHeight18"></span> -->
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column align="center" width="100px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">自动补货</span>
                  <el-checkbox v-model="replenishmentChecked" @change="checkSame('replenishmentChecked')" />
                </span>
              </template>
              <template slot-scope="{ row, $index }">
                <el-checkbox v-model="row.autoChecked" @change="singleChange($index, 'autoChecked')" />
              </template>
            </el-table-column>
            <!-- 跟自动补货互斥，匹配SKU失败的子链接无法开启库存助手，勾选框置灰 -->
            <el-table-column align="center" width="100px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter" :title="!isMatchSku ? '平台SKU未匹配SKU，无法使用库存助手' : ''
                  ">
                  <span class="mr10">库存助手</span>
                  <el-checkbox v-model="syncInventoryChecked" @change="checkSame('syncInventoryChecked')"
                    :disabled="!isMatchSku" />
                </span>
              </template>
              <template slot-scope="{ row, $index }">
                <el-checkbox v-model="row.inventoryChecked" @change="singleChange($index, 'inventoryChecked')"
                  :disabled="!row.matchSku" :title="!row.matchSku ? '平台SKU未匹配SKU，无法使用库存助手' : ''
                    " />
              </template>
            </el-table-column>
            <!-- 开启了库存助手才可以开自动修改处理时间 -->
            <!-- <el-table-column align="center" width="100px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">自动修改处理时间</span>
                  <el-checkbox v-model="syncDeliveryTimeChecked" @change="checkSame('syncDeliveryTimeChecked')"
                    :disabled="!syncInventoryChecked || !hasInventoryList" :title="!hasInventoryList
                      ? '自动修改处理时间所选择的仓库需要设置处理时间'
                      : ''
                      " />
                </span>
              </template>
              <template slot-scope="{ row, $index }">
                <el-checkbox v-model="row.deliveryTimeChecked" @change="singleChange($index, 'deliveryTimeChecked')"
                  :disabled="deliDisable(row, $index)" :title="row.unInventory
                    ? '自动修改处理时间所选择的仓库需要设置处理时间'
                    : ''
                    " />
              </template>
            </el-table-column> -->

            <!-- 开启了库存助手才可以开自动修改运输组 -->
            <el-table-column align="center" width="100px">
              <template slot="header" slot-scope="{}">
                <span class="flexAllcenter">
                  <span class="mr10">自动修改运输组</span>
                  <el-checkbox v-model="syncShippingProfileIdChecked" @change="checkSame('syncShippingProfileIdChecked')"
                    :disabled="!syncInventoryChecked || !hasInventoryList" :title="!hasInventoryList
                      ? '自动修改运输组所选择的仓库需要设置运输组'
                      : ''
                      " />
                </span>
              </template>
              <template slot-scope="{ row, $index }">
                <el-checkbox v-model="row.shippingProfileIdChecked"
                  @change="singleChange($index, 'shippingProfileIdChecked')" :disabled="deliDisable(row, $index)" :title="row.unInventory
                    ? '自动修改运输组所选择的仓库需要设置运输组'
                    : ''
                    " />
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

<script >
import regular from "@/utils/regular.js";
import dropInput from "@/views/components/dropInput";
import previewImage from "@/components/previewImage";
import mulWarehouseSet from "@/views/components/mulWarehouseSet";
import { goodsStatusArr } from "./fileData.js";
export default {
  name: "EbayReplenishmenTable",
  components: { dropInput, previewImage, mulWarehouseSet },
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
      tableLoading: false,
      btnLoading: false,
      dialogVisible: false,
      replenishmentChecked: false, //自动补货全选
      syncInventoryChecked: false, //库存助手
      // syncDeliveryTimeChecked: false, //自动修改处理时间
      syncShippingProfileIdChecked: false, //自动修改处理时间
      isMatchSku: false, //是否有匹配sku
      ruleForm: {
        tableData: [],
      },
      dropdownList: [{ label: "应用至所有", command: 1 }],
      defaultList: [],
      goodsStatusArr: goodsStatusArr(), //ERP商品状态
      userWarehouseList: [],
      storeToWareList: [], //店铺的仓库列表
      transportGroupList: [],
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
    hasInventoryList() {
      let list = this.ruleForm.tableData.filter((k) => !!!k.unInventory);
      console.log(list, 'list1111')
      return !!list.length;
    },
  },
  methods: {
    open() {
      this.reset();
      this.dialogVisible = true;
      this.getDetail();
      this.getUserWarehouseList();
      this.warehouseToHandleTime();
      this.getTransportGroupList();
    },
    // 重置
    reset() {
      this.defaultList = [];
      this.ruleForm.tableData = [];
      // this.syncDeliveryTimeChecked = false;
      this.replenishmentChecked = this.syncInventoryChecked = this.syncShippingProfileIdChecked = false;
    },
    // 根据店铺获取运输组
    getTransportGroupList() {
      let { commonStoreId } = this.data;
      this.$store.dispatch("otto/getTransportGroupList", { commonStoreId }).then((list) => {
        this.transportGroupList = list;
      });
    },
    deliDisable(row, index) {
      let data = this.storeToWareList[this.data.commonStoreId] || {};
      let unInventory = (row.warehouseList || [])
        .filter((k) => k)
        .filter((k) => {
          return !(data.warehouseList || []).includes(k);
        }).length;
      //有无库存
      this.$set(this.ruleForm.tableData[index], "unInventory", !!unInventory);
      // 存在无库存则清空选择
      if (!!unInventory) {
        // this.$set(this.ruleForm.tableData[index], "deliveryTimeChecked", false);
        // this.syncDeliveryTimeChecked = false;
        this.$set(this.ruleForm.tableData[index], "shippingProfileIdChecked", false);
        this.syncShippingProfileIdChecked = false;
      }
      return !row.inventoryChecked || !!unInventory;
    },
    // 获取用户权限仓库列表
    getUserWarehouseList() {
      this.$store.dispatch("platformList/getUserWarehouseList").then((list) => {
        this.userWarehouseList = list || [];
      });
    },
    // 仓库对应处理时间查询
    warehouseToHandleTime() {
      this.$http.get(this.api.otto.queryGroupByStoreId).then(({ data }) => {
        let list = (data || []).map((k) => {
          let list = k.warehouseIds ? k.warehouseIds.split(",") : [];
          k.warehouseList = list.map((k) => k - 0); //仓库
          return k;
        });
        this.storeToWareList = this.$common.arrayToObj(list, "commonStoreId");
      });
    },
    // 获取详情
    getDetail() {
      let [v, data] = [this, this.data];
      //区分平台区分api
      let temp = {
        type: "get",
        api: v.api.otto.queryLinkDetailInventoryByLink,
        data: () => {
          let { linkId } = data;
          return { linkId };
        },
        resultFun(data) {
          let [autoFlag, invenFlag, deliveryFlag, shippingFlag] = [false, false, false, false];
          v.ruleForm.tableData = (data || []).map((k) => {
            let list = k.warehouseIds ? k.warehouseIds.split(",") : [];
            k.warehouseList = list.map((k) => k - 0); //仓库
            k.skuList = v.handleMappingSku(k); //sku处理
            k.matchSku = !!k.skuList.filter((k) => k.sku).length;
            // k.deliveryTime = k.deliveryTime || 0; //处理时间
            // k.deliveryTimeChecked = k.syncDeliveryTimeStatus > 0 ? true : false; //自动修改处理时间
            k.shippingProfileIdChecked = k.syncShippingProfileStatus == 1 ? true : false; //自动修改运输组

            k.inventoryQuantity = k.inventoryQuantity || 0; //库存
            k.autoReplenishment = k.autoReplenishment || 0; //补货保持值
            k.autoChecked = k.autoReplenishment > 0 ? true : false; //自动补货
            k.inventoryChecked = k.syncInventoryStatus > 0 ? true : false; //库存助手
            let picUrl = k.platformPictureUrl;
            k.pictureUrl = picUrl || v.$common.urlMontage(k.erpPictureUrl);
            k.pictureViewUrl = picUrl || v.$common.urlMontage(k.erpPictureUrl, false);
            return k;
          });

          let list = v.ruleForm.tableData;
          autoFlag = list.filter((k) => !k.autoChecked).length; //无自动补货存在
          list.length && !autoFlag && (v.replenishmentChecked = true);
          invenFlag = list.filter((k) => !k.inventoryChecked).length; //库存助手
          list.length && !invenFlag && (v.syncInventoryChecked = true);

          // deliveryFlag = list.filter((k) => !k.deliveryTimeChecked).length; //自动修改处理时间
          // list.length && !deliveryFlag && (v.syncDeliveryTimeChecked = true);
          shippingFlag = list.filter((k) => !k.shippingProfileIdChecked).length; //自动修改运输组
          list.length && !shippingFlag && (v.syncShippingProfileIdChecked = true);

          v.isMatchSku = !!list.filter((k) => k.matchSku).length;
          // 存下初始值，比较提交时的改动数据
          v.defaultList = v.$common.copy(list);
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
    // 验证补货保持量
    validateReplenish(rule, value, callback) {
      let arr = rule.field.split(".");
      let row = this.ruleForm[arr[0]][arr[1]];
      if (row.autoChecked) {
        if (["", undefined, null].includes(value)) {
          callback(new Error("请输入内容"));
          return;
        }
        let reg = regular.integerZero;
        if (!reg.test(value)) {
          callback(new Error("请输入大于等于0的整数"));
          return;
        }
      }
      callback();
    },
    // 验证库存
    validateInventory(rule, value, callback) {
      if (["", undefined, null].includes(value)) {
        callback(new Error("请输入内容"));
        return;
      }
      let regList = {
        deliveryTime: {
          reg: regular.positiveNumber,
          msg: "请输入正整数",
        },
        inventoryQuantity: {
          reg: regular.integerZero,
          msg: "只允许输入0跟正整数",
        },
      };
      let reg = regList[rule.name].reg;
      if (!reg.test(value)) {
        callback(new Error(regList[rule.name].msg));
        return;
      }
      callback();
    },
    // 确认修改
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        let [list, defaultList, v] = [[], this.defaultList || [], this];
        this.ruleForm.tableData.forEach((k, i) => {
          let dk = defaultList[i] || {};
          let params = {};
          // params["pc"] = Number(k.deliveryTime) === Number(dk.deliveryTime); //处理时间
          // params["dTC"] = k.deliveryTimeChecked === dk.deliveryTimeChecked; //自动修改处理时间
          params["sg"] = Number(k.shippingProfileId) === Number(dk.shippingProfileId); //运输组
          params["sgC"] = k.shippingProfileIdChecked === dk.shippingProfileIdChecked; //自动修改运输组
          params["qt"] = Number(k.inventoryQuantity) === Number(dk.inventoryQuantity); //库存
          params["rn"] = Number(k.autoReplenishment) === Number(dk.autoReplenishment); //补货保持量
          params["aC"] = k.autoChecked === dk.autoChecked; //自动补货
          params["iC"] = k.inventoryChecked === dk.inventoryChecked; //库存助手
          params["ware"] = JSON.stringify(k.warehouseList) === JSON.stringify(dk.warehouseList); //仓库
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
          api: v.api.otto.updateSyncInventoryInfos,
          data: () => {
            return list.map((k) => {
              return {
                linkDetailId: k.linkDetailId,
                newWarehouseIds: k.warehouseList.filter((k) => k).join(","),
                newShippingProfileId: k.shippingProfileId,
                newSyncShippingProfileStatus: k.shippingProfileIdChecked ? 1 : 0,
                // newDeliveryTime: k.deliveryTime,
                // newSyncDeliveryTimeStatus: k.deliveryTimeChecked ? 1 : 0,
                newInventoryQuantity: k.inventoryQuantity,
                newAutoReplenishment: k.autoChecked ? k.autoReplenishment : 0,
                newSyncInventoryStatus: k.inventoryChecked ? 1 : 0,
              };
            });
          },
        };
        // console.log(temp.data());
        this.btnLoading = true;
        this.$http
          .post(temp.api, temp.data())
          .then((res) => {
            this.$confirm('操作成功！数据正在同步，可稍后刷新查看~', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: false,
              type: 'success',
              showCancelButton: false,
            }).then(() => {
              this.dialogVisible = false;
              this.$emit("search");
            }).catch(() => { });
          })
          .finally(() => {
            this.btnLoading = false;
          });
      });
    },
    // 自动补货/库存助手/初始化
    checkSame(checkType) {
      let v = this;
      let checked = this[checkType];
      let tableData = this.ruleForm.tableData;
      let temp = {
        //自动补货
        replenishmentChecked() {
          tableData.forEach((k, i) => {
            v.$set(v.ruleForm.tableData[i], "autoChecked", checked);
            v.$set(v.ruleForm.tableData[i], "inventoryChecked", false);
            // v.$set(v.ruleForm.tableData[i], "deliveryTimeChecked", false);
            v.$set(v.ruleForm.tableData[i], "shippingProfileIdChecked", false);
            if (!checked) {
              v.$set(v.ruleForm.tableData[i], "autoReplenishment", 0);
            }
          });
          v.syncInventoryChecked = false;
          // v.syncDeliveryTimeChecked = false;
          v.syncShippingProfileIdChecked = false;
        },
        //库存助手
        syncInventoryChecked() {
          tableData.forEach((k, i) => {
            if (!k.matchSku) return;
            v.$set(v.ruleForm.tableData[i], "inventoryChecked", checked);
            v.$set(v.ruleForm.tableData[i], "autoChecked", false);
            v.$set(v.ruleForm.tableData[i], "autoReplenishment", 0);
            if (!checked) {
              // v.$set(v.ruleForm.tableData[i], "deliveryTimeChecked", false);
              v.$set(v.ruleForm.tableData[i], "shippingProfileIdChecked", false);
            }
          });
          if (!checked) {
            // v.syncDeliveryTimeChecked = false;
            v.syncShippingProfileIdChecked = false;
          }
          v.replenishmentChecked = false;
        },
        // // 自动修改处理时间
        // syncDeliveryTimeChecked() {
        //   tableData.forEach((k, i) => {
        //     if (k.unInventory) return;
        //     v.$set(v.ruleForm.tableData[i], "deliveryTimeChecked", checked);
        //   });
        // },
        // 自动修改运输组
        syncShippingProfileIdChecked() {
          tableData.forEach((k, i) => {
            if (k.unInventory) return;
            v.$set(v.ruleForm.tableData[i], "shippingProfileIdChecked", checked);
          });
        },
      };
      temp[checkType] && temp[checkType]();
    },
    // 单个选中（自动补货与库存助手冲突，只允许开启一个，开启自动补货自动关闭库存助手，开启库存助手自动关闭自动补货；）
    singleChange(index, checkType) {
      let [v, tableData] = [this, this.ruleForm.tableData];
      let checked = tableData[index][checkType];
      let temp = {
        // 自动补货
        autoChecked() {
          v.$set(v.ruleForm.tableData[index], "inventoryChecked", false);
          // v.$set(v.ruleForm.tableData[index], "deliveryTimeChecked", false);
          v.$set(v.ruleForm.tableData[index], "shippingProfileIdChecked", false);
          this.common();
        },
        //库存助手
        inventoryChecked() {
          v.$set(v.ruleForm.tableData[index], "autoChecked", false);
          if (!checked) {
            // v.$set(v.ruleForm.tableData[index], "deliveryTimeChecked", false);
            v.$set(v.ruleForm.tableData[index], "shippingProfileIdChecked", false);
          }
          this.common();
        },
        // // 自动修改处理时间
        // deliveryTimeChecked() {
        //   this.common();
        // },
        // 自动修改运输组
        shippingProfileIdChecked() {
          this.common();
        },
        common() {
          // 自动补货关闭清除补货值
          tableData.forEach((k, i) => {
            !k.autoChecked &&
              v.$set(v.ruleForm.tableData[i], "autoReplenishment", 0);
          });
          // 自动补货总复选框根据列复选框变更
          let autoFlag = tableData.filter((k) => {
            return !k.autoChecked;
          });
          v.replenishmentChecked = tableData.length && !autoFlag.length;
          // 库存助手总复选框根据列复选框变更
          let invenFlag = tableData.filter((k) => {
            return !k.inventoryChecked;
          });
          v.syncInventoryChecked = tableData.length && !invenFlag.length;
          // // 处理时间总复选框根据列复选框变更
          // let deliveryFlag = tableData.filter((k) => {
          //   return !k.deliveryTimeChecked;
          // });
          // v.syncDeliveryTimeChecked = tableData.length && !deliveryFlag.length;
          // 运输组总复选框根据列复选框变更
          let shippingFlag = tableData.filter((k) => {
            return !k.shippingProfileIdChecked;
          });
          v.syncShippingProfileIdChecked = tableData.length && !shippingFlag.length;
        },
      };
      temp[checkType] && temp[checkType]();
    },
    // processingCommand(data) {
    //   this.dropdownCommand(data, "deliveryTime");
    // },
    inventoryCommand(data) {
      this.dropdownCommand(data, "inventoryQuantity");
    },
    autoReplenishCommand(data) {
      this.dropdownCommand(data, "autoReplenishment", "autoChecked");
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
  },
};
</script>
<style lang="scss">
.ottoReplenishment {
  .tooltip-style {
    div {
      line-height: 20px;
    }
  }

  .el-input__inner {
    text-align: center;
  }

  .fixHeight18 {
    height: 18px;
    line-height: 18px;
    display: block;
  }
}
</style>