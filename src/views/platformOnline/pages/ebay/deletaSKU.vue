<template>
   <div class="dialog-content product-manage--edit">
    <el-dialog title="删除SKU" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="ruleForm" v-loading="loading" :model="ruleForm" :rules="rules" label-width="90px">
        <el-form-item label="" prop="verifyTxt" label-width="0">
          <p>您选择的【{{ allTotal }}】个SKU将会从平台上删除！</p>
          <div v-if="moduleData.type === 2" class="mt10">
            <p>如果确定进行此操作，指定位置输入“立即删除”4个字</p>
            <el-input v-model.trim="ruleForm.verifyTxt" :disabled="total === 0" type="text" />
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-if="total > 0" type="primary" :loading="loading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FetchFun from "@/utils/listPage";
export default {
  name: "DeleteSKU",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default: () => {
        return {
          type:1,
          total: 0,
          rowList: [],
          filter: {}
        }
      }
    },
    total: {
      type: Number,
      default: 0
    },
    list: {
      type:Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        verifyTxt: '',
      },
      allTotal: 0,
      // 存储选中删除sku的对象
      RemoveEbaySkuDTO:{},
      rules: {
        verifyTxt: [
          { required: true, validator: this.validateVerifyTxt, trigger: "change" },
          { required: true, validator: this.validateVerifyTxt, trigger: "blur" }
        ],  
      },
    };
  },
  computed: {
    confirmApi() {
      if (this.moduleData.type === 2) {
        return this.api.ebay.delLinkDetailAll;
      }
      return this.api.ebay.delLinkDetail;
    },
    checkRowList() {
      return this.moduleData.rowList;
    },
    getFilter() {
      let newFilter = this.$common.copy(this.moduleData.filter);
      let reqParams = FetchFun.returnSearchOptions(newFilter, "post");
      return reqParams.data;
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
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].resetFields();
      });
      this.getTotal()
    },
    confirmData() {
      if (this.moduleData.type !== 2) {
        this.RemoveEbaySkuDTO = this.checkRowList.map(item => {
          return {
            sku: item.platformSku,
            commonStoreId: item.commonStoreId.toString(),
            linkDetailId: parseInt(item.linkDetailId),
            itemId: item.itemId,
            linkId:parseInt(item.linkId)
          }
        })
        return this.RemoveEbaySkuDTO
      }
      return this.getFilter;
    },
    getTotal() {
      if(this.moduleData.type === 1) {
        this.allTotal = this.list.length;
      } else {
        this.allTotal = this.total
      }
    },
    validateVerifyTxt (rule, value, callback) {
      if (this.moduleData.type !== 2) {
        return callback();
      }
      if (this.$common.isEmpty(value) || value.trim() !== '立即删除') {
        return callback(new Error('请输入“立即删除”4个字'));
      }
      callback();
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate(valid => {
        if (!valid) return;
        let formData = this.confirmData();
        this.loading = true;
        this.$http.post(this.confirmApi, formData).then(res => {
          this.loading = false;
          this.dialogVisible = false;
          this.$message.success("操作成功~");
          this.$emit('search');
        }).catch(() => {
          this.loading = false;
        })
      });
    }
  },
}
</script>
<style>
    
</style>