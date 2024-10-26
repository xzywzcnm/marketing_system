<template>
  <div class="dialog-content">
    <el-dialog title="设置" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false"
      class="ottoSettingPage">
      <div class="formb8" style="padding: 0 20px">
        <el-form ref="formValidate" :model="formData" label-width="100px" :show-message="false">
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
          <div class="mt10 wareList">
            <div class="displayFlex alignItemEnd mb10">
              <span class="title">仓库对应运输组</span>
              <span class="tips">用于库存助手自动修改运输组</span>
              <el-button type="primary" @click="addColumn" size="mini">新增</el-button>
            </div>
            <el-table :data="formData.tableData" style="width: 100%" border v-loading="tableLoading">
              <el-table-column label="仓库" align="center">
                <template slot-scope="{ $index }">
                  <el-form-item :prop="'tableData.' + $index + '.warehouseId'" :rules="[
                    {
                      required: true,
                      message: '请选择仓库',
                      trigger: 'change',
                    },
                  ]" label-width="0">
                    <dyt-select v-model="formData.tableData[$index].warehouseId" class="wareStyle">
                      <el-option v-for="(item, index) in allWarehouseList" :key="index" :label="item.warehouseName"
                        :value="item.id" :disabled="checkedList.includes(item.id)" />
                    </dyt-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <!-- <el-table-column label="对应处理时间" align="center">
                <template slot-scope="{ $index }">
                  <el-form-item :prop="'tableData.' + $index + '.deliveryTime'" :rules="[
                    {
                      validator: validateInventory,
                      trigger: 'blur',
                    },
                  ]" label-width="0">
                    <el-input v-model.number="formData.tableData[$index].deliveryTime" type="number"></el-input>
                  </el-form-item>
                </template>
              </el-table-column> -->
              <el-table-column label="运输组" align="center">
                <template slot-scope="{ $index }">
                  <el-form-item :prop="'tableData.' + $index + '.shippingProfileId'" label-width="0" :rules="[
                    { required: true, message: '请选择', trigger: 'change' }
                  ]">
                    <dyt-select v-model="formData.tableData[$index].shippingProfileId">
                      <el-option v-for="(item, index) in transportGroupList" :key="index"
                        :label="item.platformShippingProfileName" :value="item.id" />
                    </dyt-select>
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template slot-scope="scope">
                  <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
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
// deliveryTime: "", 
let columnOption = { warehouseId: "", shippingProfileId: '' };
// import regular from "@/utils/regular.js";
export default {
  name: "OttoSetting",
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
      formData: {
        tableData: [],
      },
      tableLoading: false,
      allWarehouseList: [],
      transportGroupList: [],
    };
  },
  computed: {
    checkedList() {
      let list = this.formData.tableData
        .map((k) => k.warehouseId)
        .filter((k) => k);
      return list;
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
    // 初始化数据
    initPage() {
      this.dialogVisible = true;
      this.getDetail();
      this.getWarehouseList();
      this.getTransportGroupList();
    },
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch("platformList/getAllWarehouseList").then((list) => {
        this.allWarehouseList = list || [];
      });
    },
    // 根据店铺获取运输组
    getTransportGroupList() {
      let { commonStoreId } = this.moduleData;
      this.$store.dispatch("otto/getTransportGroupList", { commonStoreId }).then((list) => {
        this.transportGroupList = list;
      });
    },
    getDetail() {
      let { commonStoreId } = this.moduleData;
      this.tableLoading = true;
      this.$http
        .get(this.api.storeManagement.otto.getDetail, {
          params: { commonStoreId },
        })
        .then((res) => {
          if (res.status != 200) {
            this.disabledEdit = true;
            return false;
          }
          // this.formData.tableData = res.data.ottoStoreDeliveryDTOList || [];
          this.formData.tableData = res.data.ottoStoreShippingProfileRelDTOList || [];
        })
        .catch(() => {
          this.disabledEdit = true;
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 提交表单
    handleForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;
        let { commonStoreId } = this.moduleData;
        let temp = { commonStoreId };
        // temp.ottoStoreDeliveryDTOList = this.formData.tableData.map((k) => {
        temp.ottoStoreShippingProfileRelDTOList = this.formData.tableData.map((k) => {
          let obj = this.$common.copy(k);
          delete obj.warehouseName;
          return obj;
        });
        // console.log(temp, 'temp')
        this.loading = true;
        this.$http
          .post(this.api.storeManagement.otto.update, temp)
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
    addColumn() {
      this.formData.tableData.push(this.$common.copy(columnOption));
    },
    handleDelete(index, row) {
      this.formData.tableData.splice(index, 1);
    },
    // // 验证库存
    // validateInventory(rule, value, callback) {
    //   if (["", undefined, null].includes(value)) {
    //     callback(new Error("请输入内容"));
    //     return;
    //   }
    //   if (!regular.positiveNumber.test(value)) {
    //     callback(new Error("请输入正整数"));
    //     return;
    //   }
    //   callback();
    // },
  },
};
</script>

<style lang="less">
.ottoSettingPage {
  .formb8 {
    .el-form-item {
      margin-bottom: 8px;
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