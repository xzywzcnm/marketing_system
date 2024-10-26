<template>
  <div class="dialog-content">
    <el-dialog title="售价估算明细" :visible.sync="dialogVisible" width="1400px" :close-on-click-modal="false"
      class="estimationDetailsPage">
      <div class="content">
        <el-table ref="table" v-loading="loading" :data="tableData" border>
          <el-table-column prop="platformSku" label="链接SKU" min-width="120px" />
          <el-table-column prop="erpSku" label="erp_sku" min-width="90px" />
          <el-table-column prop="weight" label="重量g" width="60px" />
          <el-table-column prop="volume" label="体积cm" width="100px" />
          <el-table-column prop="currency" label="币种" width="60px" />
          <el-table-column prop="goodsCost" label="商品成本" width="70px" />
          <el-table-column prop="logisticsCost" label="物流成本" width="70px" />
          <el-table-column prop="platformCommission" label="平台佣金" width="70px" />
          <el-table-column prop="taxesAndFees" label="税费" width="70px" />
          <el-table-column prop="transactionFee" label="交易费用" width="70px" />
          <el-table-column prop="papalProcedureFee" label="papal手续费" width="100px" />
          <el-table-column prop="advertisingFee" label="广告费用" width="70px" />
          <el-table-column prop="storeMiscellaneousFees" label="店铺杂费" width="70px" />
          <el-table-column prop="guestDropFee" label="客退费率" width="70px" />
          <el-table-column prop="othersFee" label="其他费用" width="70px" />
          <el-table-column prop="warehouseFee" label="仓库费用" width="70px" />
          <el-table-column prop="profits" label="利润" width="70px" />
          <el-table-column prop="totalPrice" label="估算价格" width="70px" />
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "SalePriceComponentsEstimationDetails",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default() { return {} }
    },
  },
  data() {
    return {
      loading: false,
      tableData: [],
      dialogVisible: false,//组件弹框
    }
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
      this.dialogVisible = true;
      this.getList();
    },
    getList() {
      let { templateId, erpSku } = this.detailData;
      this.loading = true;
      this.$http.post(this.api.salePrice.showDetail, { templateId, erpSku }).then(({ data }) => {
        let temp = Object.assign({}, this.detailData, data);
        this.tableData = [temp];
      }).finally(() => {
        this.loading = false;
      })
    }
  }
}
</script>
