<template>
  <div class="dialog-content">
    <el-dialog :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false" class="inventoryInformationPage">
      <template slot="title">
        <div style="font-weight:700">
          <span>商品库存信息</span>
          <span v-if="platformCode === 'ebay'" class="ml10">ItemId: {{ data.itemId }}</span>
        </div>
      </template>
      <div class="mainContent" style="height:600px;">
        <div class="tableWrap table-maxheight">
          <el-table ref="tables" v-loading="loading" :data="tableData" height="100%" border :row-class-name="rowClass"
            :class="searchClass">
            <el-table-column label="平台SKU" prop="platformSku" min-width="120" align="center" key="platformSku"
              fixed="left" />
            <el-table-column label="SPU" prop="erpSpu" min-width="100" align="center" key="erpSpu" fixed="left" />
            <el-table-column label="SKU" min-width="150" align="center" key="erpSku" fixed="left">
              <template slot-scope="{ row }">
                <!-- erpGoodsStatus 判断是否匹配sku -->
                <div v-if="!row.erpSkuArr">
                  {{ (!row.erpGoodsStatus ? row.erpSku : row.erpGoodsStatus !== 6 ? row.erpSku : '-') || '-' }}
                </div>
                <div v-else>
                  <div v-for="(item, index) in row.erpSkuArr" :key="index">
                    {{ item }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="库存" prop="availQuantity" key="availQuantity" min-width="80" align="center"
              fixed="left" />
            <el-table-column v-for="(item, index) in warehouseList" :key="index" :label="item.warehouseName"
              align="center">
              <el-table-column label="在途" width="80" align="center">
                <template slot-scope="{ row }">
                  {{ row['onWayInventory' + item.warehouseName] || 0 }}
                </template>
              </el-table-column>
              <el-table-column label="可用库存" width="80" align="center">
                <template slot-scope="{ row }">
                  {{ row['inventoryQuantity' + item.warehouseName] || 0 }}
                </template>
              </el-table-column>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "InventoryInformation",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    platformCode: {
      type: String,
      default: 'walmart',
    },
    data: {
      type: Object,
      default() { return {} },
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      tableData: [],
      warehouseList: [],
      fixOrderList: {
        '佛山丽山仓': 1,
        '佛山2号仓': 2,
        'SHL': 3,
        '万邑通': 4,
        '谷仓': 5,
        'EF': 6,
      },
      deliveryTypeList: {
        0: { label: 'Seller Fulfilled', value: 0, inventory: 'availQuantity' },
        1: { label: 'Walmart Fulfilled', value: 1, inventory: 'wfsAvailQuantity' },
        2: { label: 'WFS Eligible', value: 2, inventory: 'availQuantity' },
      },
      searchStatus: false,
    }
  },
  computed: {
    searchClass() {
      if (this.loading) return "";
      if (this.searchStatus) {
        return !this.tableData.length && "nolength";
      } else {
        return "nosearch";
      }
    },
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
  methods: {
    open() {
      this.warehouseList = {};
      this.dialogVisible = true;
      this.getList();
    },
    getList() {
      const [data, _self] = [this.data, this];
      let fun = {
        walmart: {
          api: _self.api.walmart.queryInventoryInfoByLink,
          params() {
            return {
              commonStoreId: data.commonStoreId,
              platformSpu: data.platformSpu,
            }
          },
        },
        otto: {
          api: _self.api.otto.queryInventoryInfoByLink,
          params() {
            return {
              linkId: data.linkId,
            }
          },
        },
        ebay: {
          api: _self.api.ebay.queryInventoryInfoByLink,
          params() {
            return {
              linkId: data.linkId,
            }
          },
        },
        real: {
          api: _self.api.real.queryInventoryInfoByLink,
          params() {
            return {
              linkId: data.id,
            }
          },
        },
        temuHalfPipe: {
          api: _self.api.temuHalfPipe.queryInventoryInfoByLink,
          rqType: 'post',
          data() {
            let list = (data.temuxStoreLinkDetailVOList || []).map(k => k.linkDetailId);
            return list
          },
        },
      }
      let typeData = fun[this.platformCode];
      if (!typeData) {
        this.$message.error('传参丢失，请联系管理员!');
        return false;
      }
      let temp = {};
      let rqType = typeData.rqType || 'get';
      if (rqType == 'post') {
        temp = typeData.data();
      } else {
        temp = { params: typeData.params() };
      }

      this.loading = true;
      this.$http[rqType](typeData.api, temp).then((res) => {
        let warehouseList = {};
        let fixOrderList = this.fixOrderList;
        let list = [];
        if (['real'].includes(this.platformCode)) {
          list = [res.data || {}];
        } else {
          list = res.data || [];
        }
        list.forEach(k => {
          if (['otto', 'ebay', 'real', 'temuHalfPipe'].includes(this.platformCode)) {
            k.availQuantity = k.inventoryQuantity;
          }
          let wmsInventoryByWarehouseDTOList = k.wmsInventoryByWarehouseDTOList || [];
          wmsInventoryByWarehouseDTOList.forEach(wk => {
            let index = 99;
            Object.keys(fixOrderList).forEach(fk => {
              (wk.warehouseName.indexOf(fk) >= 0) && (index = fixOrderList[fk]);
            })
            warehouseList[wk.warehouseName] = { warehouseName: wk.warehouseName, sort: index };
            k['inventoryQuantity' + wk.warehouseName] = wk.inventoryQuantity || 0;
            k['onWayInventory' + wk.warehouseName] = wk.onWayInventory || 0;
          })
          // 全部子链接中如包含WFS Eligible:2、Walmart fulfilled:1，则默认第一列为WFS库存，如不包含，则不展示WFS库存
          if ([1, 2, '1', '2'].includes(k.fulfillmentType)) {
            let wfs = 'WFS';
            k['inventoryQuantity' + wfs] = k.wfsAvailQuantity || 0;
            k['onWayInventory' + wfs] = k.wfsInboundQuantity || 0;
            warehouseList[wfs] = { warehouseName: wfs, sort: 0 };
          }
        })
        let arrList = Object.keys(warehouseList).map(k => { return warehouseList[k] });
        let sortList = arrList.sort((a, b) => {
          return a.sort - b.sort;
        });
        this.tableData = list;
        this.tableData.forEach(item => {
          if (item.erpSku.includes('\n')) {
            item.erpSkuArr = item.erpSku.split('\n')
          }
        })
        this.warehouseList = sortList;
        this.$nextTick(() => {
          this.$refs.tables.doLayout();
        })
      }).finally(() => {
        this.searchStatus = true;
        this.loading = false;
      })
    },
    // 高亮点进来的某一行
    rowClass({ row, rowIndex }) {
      let obj = { otto: 'linkDetailId', walmart: 'id', ebay: 'linkDetailId', temuHalfPipe: 'linkDetailId', };
      let key = obj[this.platformCode];
      if (key && (row[key] == this.data[key])) return 'rowHighLine';
    },
  }
}
</script>
<style lang="scss">
.inventoryInformationPage {
  .rowHighLine {
    background-color: rgb(192 196 204);
  }

  .el-table {
    display: flex;
    flex-direction: column;

    .el-table__body-wrapper {
      flex: 1 1 0%;
    }



  }
}
</style>