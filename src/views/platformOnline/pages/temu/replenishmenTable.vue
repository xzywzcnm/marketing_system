<template>
  <div class="dialog-content product-manage--edit">
    <el-dialog title="库存管理" :visible.sync="dialogVisible" width="1200px" :close-on-click-modal="false">
      <div class="mainContent" style="height:600px;">
        <el-form ref="ruleForm" :model="ruleForm" class="tableWrap formb0" style="height:100%;">
          <el-table ref="table" :data="ruleForm.tableData" height="100%" border :loading="loading"
            :class="!ruleForm.tableData.length ? 'nolength' : ''">
            <el-table-column label="序号" type="index" width="50" align="center" />
            <el-table-column label="SKU货号" prop="erpSku" align="center" min-width="120px" />
            <el-table-column label="状态" align="center" width="100px">
              <template slot-scope="{row}">
                <span v-for="gitem in goodsStatusArr" :key="'goodsStatusArr' + gitem.value">
                  {{ gitem.value === row.erpGoodsStatus ? gitem.label : '' }}
                </span>
              </template>
            </el-table-column>
            <!-- 多属性 -->
            <template v-if="attrColumns.length">
              <el-table-column v-for="(item, index) in attrColumns" :key="index" :label="item" :prop="item"
                align="center" min-width="100px" />
            </template>
            <el-table-column label="数量" prop="inventoryQuantity" width="120px" align="center" />
            <el-table-column label="售价" prop="price" width="120px" align="center" />
            <el-table-column align="center" width="130px">
              <template slot="header">
                <span class="flexAllcenter">
                  <span class="mr10">
                    <el-tooltip placement="top-start" effect="light">
                      <span class="lapa icon-tishi replenIcon" />
                      <div slot="content" class="tooltip-style">
                        <div>开启同步库存功能后，系统定时检测链接库存是否与ERP实际库存一致，如不一致则调整至库存保持一致（库存管理功能仅限JIT链接使用）</div>
                      </div>
                    </el-tooltip>
                    同步库存
                  </span>
                  <el-checkbox v-model="syncInventoryChecked" @change="checkSame()" />
                </span>
              </template>
              <template slot-scope="{row,$index}">
                <!-- 非Jit模式屏蔽 -->
                <el-checkbox v-if="row.jitModeStatus == 1" v-model="row.inventoryChecked"
                  @change="singleChange($index)" />
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
import { goodsStatusArr } from '@/views/marketingStrategy/pages/components/fileData.js';
export default {
  name: "TemuReplenishmenTable",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default() { return {} }
    },
  },
  data() {
    return {
      loading: false,
      btnLoading: false,
      dialogVisible: false,
      syncInventoryChecked: false,//同步库存全选
      ruleForm: {
        tableData: [],
      },
      defaultList: [],
      goodsStatusArr: goodsStatusArr(),//ERP商品状态
      attrColumns: [],//属性表头
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
      this.reset();
      this.dialogVisible = this.modelVisible;
      this.getDetail();
    },
    // 重置
    reset() {
      this.defaultList = [];
      this.ruleForm.tableData = [];
      this.syncInventoryChecked = false;
    },
    getDetail() {
      // console.log(this.data, 222);
      let api = this.api.temu.queryDetailByLink;
      let temp = { linkId: this.data.id };
      this.loading = true;
      this.$http.get(api, { params: temp }).then(({ data }) => {
        let inventoryFlag = true;
        this.ruleForm.tableData = (data || []).map(k => {
          k.inventoryChecked = k.syncInventoryStatus == 1 ? true : false;//同步库存
          inventoryFlag && (inventoryFlag = k.inventoryChecked);
          // 属性数据处理
          let colums = [];
          let attrlist = k.specification ? k.specification.split(';') : [];
          attrlist.forEach((aitem, aindex) => {
            let index = aitem.indexOf(':');
            k[aitem.slice(0, index)] = aitem.slice(index + 1, aitem.length);
            colums.push(aitem.slice(0, index));
          })
          !this.attrColumns.length && (this.attrColumns = colums);
          return k;
        });
        this.defaultList = this.$common.copy(this.ruleForm.tableData);//备份用于对比更改的数据
        // 全选是否选中
        data.length && inventoryFlag && (this.syncInventoryChecked = true);
      }).finally(() => {
        this.loading = false;
      })
    },
    // 确认修改
    confirmHandle() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return;
        let [list, defaultList] = [[], this.defaultList || []];
        this.ruleForm.tableData.forEach((k, i) => {
          let dk = defaultList[i] || {};
          let result = k.inventoryChecked === dk.inventoryChecked;
          if (result) return;
          list.push(k);
        })
        if (!list.length) {
          this.$message.warning("数据无改动~");
          return;
        }
        let api = this.api.temu.updateSyncInfo;
        let temp = list.map(k => {
          return {
            linkDetailId: k.id,
            syncInventoryStatus: k.inventoryChecked ? 1 : 0,
          }
        })
        this.btnLoading = true;
        this.$http.post(api, temp).then((res) => {
          this.$message.success("操作成功~");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.btnLoading = false;
        })
      });
    },
    // 自动补货/防超卖/初始化
    checkSame() {
      let checked = this['syncInventoryChecked'];
      this.ruleForm.tableData.forEach((k, i) => {
        this.$set(this.ruleForm.tableData[i], 'inventoryChecked', checked);
      })
    },
    // 选中
    singleChange() {
      // 总复选框根据列复选框变更
      let list = this.ruleForm.tableData.filter(k => !k.inventoryChecked);
      this.syncInventoryChecked = !list.length;
    },
  }
}
</script>
<style lang="scss" scoped>
.tooltip-style {
  div {
    line-height: 20px;
  }
}
</style>