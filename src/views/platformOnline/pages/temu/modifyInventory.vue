<template>
  <div class="dialog-content product-manage--edit">
    <el-dialog :title="componenType.title ? componenType.title[type] : '详情'" :visible.sync="dialogVisible"
      width="1200px" :close-on-click-modal="false">
      <div class="mainContent" style="height:600px;">
        <el-form ref="formDynamic" :model="formDynamic" label-width="0" class="tableWrap formb0 formError"
          style="height:100%;">
          <el-table ref="table" v-loading="loading" :data="formDynamic.tableData" height="100%" border
            :span-method="objectSpanMethod" :cell-class-name="tableRowClassName" :class="searchClass">
            <el-table-column label="平台" width="140px">
              <template slot-scope="{}">
                <img :src="platformImg" height="25px" alt="">
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="标题" />
            <el-table-column prop="erpSpu" label="SPU" />
            <el-table-column prop="erpSkc" label="SKC货号" width="110px" />
            <el-table-column label="图片" width="110px">
              <template slot-scope="{row}">
                <preview-image :url="row.pictureUrl" />
              </template>
            </el-table-column>
            <el-table-column prop="specification" label="属性" />
            <el-table-column prop="erpSku" label="SKU货号" />

            <el-table-column v-if="type == 1" key="inventoryQuantity" label="库存" width="140px">
              <template slot="header" slot-scope="{}">
                <span class="flex-align">
                  <span class="mr10">库存</span>
                  <el-checkbox v-model="inventoryChecked"
                    @change="checkSame('inventoryChecked', 'inventoryQuantity')" />
                </span>
              </template>
              <template slot-scope="{row,$index}">
                <el-form-item label="" :prop="'tableData.' + $index + '.inventoryQuantity'"
                  :rules="{ message: '请输入大于或等于0的整数', pattern: /^\d+$/, trigger: 'blur' }">
                  <el-input v-model.number="row.inventoryQuantity" type="number"
                    @input="valChange($index, 'inventoryChecked')" />
                </el-form-item>
              </template>
            </el-table-column>
            <!-- <el-table-column v-if="type > 1" key="price" label="价格" :width="type == 2 ? '140px' : '220px'">
              <template slot="header" slot-scope="{}">
                <span class="flex-align priceStyle">
                  <span class="mr10">价格</span>
                  按固定值调整
                  <el-checkbox v-if="type == 2" v-model="priceChecked" @change="checkSame('priceChecked', 'price')" />
                  按数值调整/按比例调整
                  <template v-if="['3', '4'].includes(type)">
                    <dyt-select v-model="ajustType" placeholder="请选择" size="mini" class="select-style"
                      @change="ajustPrice">
                      <el-option :value="1" label="调增" />
                      <el-option :value="2" label="调减" />
                    </dyt-select>
                    <el-form-item label="" prop="ajustText"
                      :rules="{ message: '必须为数字,且最多允许两位小数', pattern: /^\d*[.]?\d{1,2}$/, trigger: 'blur' }">
                      <el-input v-model.number="formDynamic.ajustText" size="mini" class="input-style" type="number"
                        @input="ajustPrice">
                        <i v-if="type == 4" slot="suffix">%</i>
                      </el-input>
                    </el-form-item>
                  </template>
                </span>
              </template>
              <template slot-scope="{row,$index}">
                <el-form-item label="" :prop="'tableData.' + $index + '.price'"
                  :rules="{ message: '必须为数字,且最多允许两位小数', pattern: /^\d*[.]?\d{1,2}$/, trigger: 'blur' }">
                  <el-input v-model.number="row.price" :disabled="['3', '4'].includes(type)" type="number"
                    @input="valChange($index, 'priceChecked')" />
                </el-form-item>
              </template>
            </el-table-column> -->
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
import Big from 'big.js';
import previewImage from '@/components/previewImage';
export default {
  name: "TemuModifyInventory",
  components: { previewImage },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default() { return [] }
    },
    type: {// 修改库存 1；修改价格；2按固定值调整，3按数值调整，4按比例调整
      type: String,
      default: ''
    },
    searchOption: {
      type: Object,
      default() { return {} }
    },
    platformCode: {
      type: String,
      default: 'temu'
    },
    linkType: {//链接类型
      type: String,
      default: 'main',// main主链接 child子链接
    },
  },
  data() {
    return {
      loading: false,
      platformImg: require('@/assets/images/temu.png'),
      formDynamic: {
        tableData: [],//表格数据
        ajustText: '',//调整数值
      },
      dialogVisible: false,//组件弹框
      btnLoading: false,//按钮遮罩加载
      inventoryChecked: false, //库存选中
      priceChecked: false, //价格选中
      ajustType: '',//调整类型
      componenType: {},// 库存/价格公用该页面，区分对应类型数据
    }
  },
  computed: {
    // 表格背景
    searchClass() {
      if (this.loading) return '';
      return !this.formDynamic.tableData.length && 'nolength';
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit('update:modelVisible', val);
      this.formDynamic.tableData = [];
    },
  },
  methods: {
    open() {
      this.dialogVisible = this.modelVisible;
      this.inventoryChecked = false;
      this.priceChecked = false;
      this.ajustType = '';
      this.formDynamic.ajustText = '';
      this.componenType = {};
      this.typeReturn();

      this.linkType == 'main' ? this.getDetail() : this.getChildDetail();
    },
    // 库存/价格公用该页面，此处做区分
    typeReturn() {
      let _self = this;
      let typeData = {
        inventory: {
          title: { 1: "修改库存" },
          key: 'inventoryQuantity',
          message: '库存不能为空',
          api: {
            'temu': _self.api.temu.updateInventoy,
          }
        },
        price: {
          title: { 2: "修改价格", 3: "按数值调整价格", 4: "按比例调整价格" },
          key: 'price',
          message: '价格不能为空',
          api: {}
        }
      }
      let type = this.type;
      let typeChooice = type == 1 ? 'inventory' : 'price';
      this.componenType = typeData[typeChooice] || {};
    },
    // 主链接获取详情
    getDetail() {
      let arr = this.$common.copy(this.list || []);
      let [_self] = [this];
      //区分平台区分api
      let plantformData = {
        'temu': {
          api: _self.api.temu.listUpdateInventoryInfo,
          data: () => {
            return arr.map(k => { return k.id });
          },
          resultFun(data) {
            _self.temuReturn(data);
          },
        },
      }
      let temp = plantformData[this.platformCode];
      if (!temp) return this.$message.error("平台异常~");
      this.loading = true;
      this.$http.post(temp.api, temp.data()).then(({ data }) => {
        temp.resultFun(data);
      }).finally(() => {
        this.loading = false;
      })
    },
    // 子链接获取详情
    getChildDetail() {
      // let arr = this.$common.copy(this.list || []);
      // // 区分spu
      // let temp = {};
      // arr.forEach(k => {
      //   let obj = this.$common.copy(k);
      //   if (temp[k.platformSpu]) {
      //     temp[k.platformSpu].push(obj);
      //   } else {
      //     temp[k.platformSpu] = [obj];
      //   }
      // })
      // let linkData = Object.keys(temp).map(k => {
      //   let list = temp[k];
      //   let obj = Object.assign({ ebayStoreLinkPriceInventoryDetailVOList: list }, list[0]);
      //   return obj
      // });
      // this.commonReturn(linkData);
    },
    // 返回数据处理
    temuReturn(data) {
      // 以spu为维度一，skc为维度二，sku为维度三
      let temp = {};
      (data || []).forEach(k => {
        let erpSkcId = k.platformSkc || 'all';//如果不存在skcid则默认放到全部
        if (temp[k.erpSpu]) {
          if (temp[k.erpSpu][erpSkcId]) {
            temp[k.erpSpu][erpSkcId].list.push(k);
          } else {
            temp[k.erpSpu][erpSkcId] = { list: [k] };
          }
        } else {
          temp[k.erpSpu] = {};
          temp[k.erpSpu][erpSkcId] = { list: [k] };
        }
      });
      // console.log(temp);
      // 统计每个维度的合并行
      Object.values(temp).forEach(spu => {
        let spuRows = 0;
        Object.values(spu).forEach(skc => {
          spuRows += skc.list.length;
          skc['num'] = skc.list.length;
        })
        spu['num'] = spuRows;
      })
      // 拆开以sku为维度
      let list = [];
      Object.keys(temp).forEach((spu, spuIndex) => {
        Object.keys(temp[spu]).forEach((skc, skcIndex) => {
          if (skc == 'num') return;
          temp[spu][skc].list.forEach((sku, skuIndex) => {
            sku.colspan = 1;
            sku.spurowspan = (skcIndex === 0 && skuIndex === 0) ? temp[spu].num : 0;
            sku.skcRowspan = skuIndex === 0 ? temp[spu][skc].num : 0;

            sku.actulprice = sku.price;
            sku.actulinventoryQuantity = sku.inventoryQuantity;
            list.push(sku);
          })
        })
      })
      // console.log(list);
      this.formDynamic.tableData = list;
    },
    //首页表格的合并
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if ([0, 1, 2].includes(columnIndex)) {
        return {
          rowspan: row.spurowspan,
          colspan: row.colspan,
        }
      } else if ([3, 4].includes(columnIndex)) {
        return {
          rowspan: row.skcRowspan,
          colspan: row.colspan,
        }
      }
    },
    // 确认修改
    confirmHandle() {
      this.$refs['formDynamic'].validate((valid) => {
        if (!valid) return;
        let [componenType, platformCode, type] = [this.componenType, this.platformCode, this.type];
        if (!componenType.api) {
          this.$message.error("参数缺失，请重新打开页面!");
          return;
        }
        //改动过/值为空的列表/记录小于最小价格的行数
        let [hasEditList, emptyList, minPriceKey] = [[], [], null];
        this.formDynamic.tableData.forEach((k, i) => {
          let obj = this.$common.copy(k);
          obj.lineNum = i + 1;//记录行数

          let empthFlag = !(obj[componenType.key] || obj[componenType.key] === 0);
          empthFlag && emptyList.push(obj);
          let hasFlag = obj['actul' + componenType.key] !== obj[componenType.key];
          hasFlag && hasEditList.push(obj);
        })

        if (!hasEditList.length) {
          this.$message.warning('无改动 ~');
          return;
        }

        if (emptyList.length) {
          this.$message.error(componenType.message || '输入值不能为空');
          return;
        }

        // 价格需要验证最小值
        if (type > 1) {
          let minPrice = 3;//最低价格
          hasEditList.forEach(k => {
            if (k[componenType.key] < minPrice && !(minPriceKey || minPriceKey === 0)) {
              minPriceKey = k.lineNum;
            }
          })
          // 存在低于最低价格数据
          if (minPriceKey) {
            this.$message.error(`第${minPriceKey}行的价格不能小于最低价格${minPrice}`);
            return;
          }
        }

        let plantformData = {
          temu() {
            return hasEditList.map(k => {
              let temp = {};
              temp.linkDetailId = k.linkDetailId;
              type > 1 ? temp.newPrice = k.price : temp.newInventoryQuantity = k.inventoryQuantity;
              return temp;
            })
          },
        }
        // console.log(componenType.api[platformCode], plantformData[platformCode]());

        this.btnLoading = true;
        this.$http.post(componenType.api[platformCode], plantformData[platformCode]()).then((res) => {
          this.$confirm('操作成功！数据正在同步，可15分钟后刷新查看~', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: false,
            type: 'success',
            showCancelButton: false,
          }).then(() => { }).catch(() => { });
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.btnLoading = false;
        })
      });
    },
    // 这里加类名加样式
    tableRowClassName({ row, column, rowIndex, columnIndex }) {
      let [str, searchOption] = ['', this.searchOption];
      let plantformData = {
        'temu'() {
          if (searchOption.skuList.includes(row.erpSku) && columnIndex == 6) str = 'span-line';// 标亮搜索sku
        },
      }
      // 执行对应类型方法
      plantformData[this.platformCode] && plantformData[this.platformCode]();
      return str;
    },
    // 同步表格所有 价格/库存
    checkSame(model, type) {
      if (!this[model]) return;//取消状态
      this.formDynamic.tableData.forEach(k => {
        k[type] = this.formDynamic.tableData[0][type];
      })
    },
    // 库存/价格 第一行改动时，清空头部check选中状态
    valChange(index, model) {
      index === 0 && (this[model] = false);
    },
    // 按数值调整/按比例调整 价格
    ajustPrice() {
      let [ajustType, ajustText, type] = [this.ajustType, this.formDynamic.ajustText, this.type];
      // 当任一一个为空的时候，撤回原来的价格
      if (!(ajustType && ajustText)) {
        this.formDynamic.tableData.forEach(k => {
          k.price = k.actulprice;
        })
        return;
      }

      let fun = {
        way: { 1: 'plus', 2: 'minus' },
        // 按数值调整
        '3': (price) => {
          return parseFloat(new Big(price || 0)[fun.way[ajustType]](ajustText || 0));
        },
        // 按比例调整
        '4': (price) => {
          let finalPrice = fun.keepTwoDecimal(new Big(price || 0).times(new Big(ajustText || 0).div(100)));
          return parseFloat(new Big(price || 0)[fun.way[ajustType]](finalPrice));
        },
        keepTwoDecimal(num) {
          var result = parseFloat(num);
          if (isNaN(result)) {
            this.$message.error("传递参数错误，请检查！");
            return false;
          }
          result = Math.round(num * 100) / 100;
          return result;
        }
      }
      this.formDynamic.tableData.forEach(k => {
        k.price = fun[type](k.actulprice);
      })
    }
  }
}
</script>
<style lang="scss">
.product-manage--edit {
  .el-table td.col-sty {
    border-bottom-color: #909399;
  }

  .span-line {
    color: #67c23a;
  }

  .priceStyle {
    .el-select .el-input__inner {
      padding-right: 20px;
    }

    .el-input__inner {
      padding: 0 14px 0 8px;
    }

    .select-style {
      width: 78px;
    }

    .input-style {
      width: 70px;
      margin-left: 8px;
    }
  }
}
</style>
