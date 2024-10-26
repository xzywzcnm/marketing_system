<template>
  <div class="dialog-content product-manage--edit">
    <el-dialog title="下架链接" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="ruleForm" v-loading="loading" :model="ruleForm" :rules="rules" label-width="90px">
        <el-form-item label="" prop="verifyTxt" label-width="0">
          <p>您选择的【{{ total }}】个主链接将会从平台上下架！</p>
          <div v-if="moduleData.type === '3' && total > 0" class="mt10">
            <p>如果确定进行此操作，指定位置输入“立即下架”4个字</p>
            <el-input v-model.trim="ruleForm.verifyTxt" :disabled="total === 0" type="text" />
          </div>
          <div v-if="total === 0" class="mt10" style="color:#f20;">
            因选择的数据或检索条件查找不到已上架的主链接，暂不能批量操作下架
          </div>
        </el-form-item>
        <el-form-item label="下架原因:" class="mt20" prop="endReasonCode">
          <dyt-select v-model="ruleForm.endReasonCode" style="width: 100%;" :disabled="total === 0">
            <el-option v-for="(item, index) in soldOutReasonList" :key="`reason_${index}`" :label="item.label" :value="item.value" />
          </dyt-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-if="total > 0" type="primary" :loading="loading" @click="confirmHandle()">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="js">
import Qs from "qs";

export default {
  name: "SoldOutLink",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default: () => {
        return {
          type: '2',
          total: 0,
          rowList: [],
          filter: {}
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        verifyTxt: '',
        endReasonCode: []
      },
      rules: {
        verifyTxt: [
          { required: true, validator: this.validateVerifyTxt, trigger: "change" },
          { required: true, validator: this.validateVerifyTxt, trigger: "blur" }
        ],
        endReasonCode: [
          { required: true, message: "请选择下架原因", trigger: "change" }
        ],
      },
      soldOutReasonList: [
        { value: 0, label: 'The start price or reserve price is incorrect' },
        { value: 1, label: 'The item was lost or broken' },
        { value: 2, label: 'The item is no longer available for sale' },
        { value: 3, label: 'The listing contained an error' }
      ],
      total: 0
    };
  },
  computed: {
    confirmApi () {
      if (this.moduleData.type === '3') {
        let formData = this.$common.copy(this.ruleForm);
        delete this.ruleForm.verifyTxt;
        return `${this.api.ebay.ebayEndItemsForQuery}?${Qs.stringify(formData)}`;
      }
      return this.api.ebay.ebayEndItems;
    },
    checkRowList () {
      return this.moduleData.rowList;
    },
    getFilter () {
      let newFilter = this.$common.copy(this.moduleData.filter);
      delete newFilter.status;
      Object.keys(newFilter).forEach(params => {
        if (newFilter[params] === "") newFilter[params] = null;
      });
      return newFilter
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit("update:modelVisible", val);
    }
  },
  methods: {
    open() {
      this.loading = true;
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].resetFields();
      });
      this.getTotal().then(res => {
        this.total = res;
        this.loading = false;
      }).catch((error) => {
        console.error(error);
        this.loading = false;
      });
    },
    getTotal () {
      return new Promise((reserve, reject) => {
        if (this.moduleData.type !== '3') {
          return reserve(this.checkRowList.length);
        }
        let newFilter = this.getFilter;
        this.$http.post(this.api.ebay.ebayCountEndItemsForQuery, newFilter).then(({ data }) => {
          reserve(data);
        }).catch((error) => {
          console.error(error);
          reserve(0);
        })
      })
    },
    confirmData () {
      delete this.ruleForm.verifyTxt;
      if (this.moduleData.type !== '3') {
        return this.checkRowList.map(item => {
          return {
            endReasonCode: this.ruleForm.endReasonCode,
            commonStoreId: item.commonStoreId,
            linkId: item.linkId,
            itemId: item.itemId
          }
        })
      }
      return this.getFilter;
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate(valid => {
        if (!valid) return;
        let formData = this.confirmData();
        this.loading = true;
        this.$http.post(this.confirmApi, formData).then(res => {
          this.loading = false;
          this.dialogVisible = false;
          this.$emit('search');
          this.$confirm('操作成功！数据正在同步，可15分钟后刷新查看~', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: false,
            type: 'success',
            showCancelButton: false,
          }).then(() => {}).catch(() => { });
        }).catch(() => {
          this.loading = false;
        })
      });
    },
    validateVerifyTxt (rule, value, callback) {
      if (this.moduleData.type !== '3') {
        return callback();
      }
      if (this.$common.isEmpty(value) || value.trim() !== '立即下架') {
        return callback(new Error('请输入“立即下架”4个字'));
      }
      callback();
    }
  }
};
</script>
<style lang="scss" scoped></style>
