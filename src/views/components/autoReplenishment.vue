<template>
  <div class="dialog-content product-manage--edit">
    <el-dialog title="设置自动补货" :visible.sync="dialogVisible" width="770px" :close-on-click-modal="false">
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="110px">
        <el-form-item label="操作类型:" class="mt20" prop="operationType">
          <el-radio-group v-model="ruleForm.operationType">
            <el-radio :label="1">
              启用
            </el-radio>
            <el-radio :label="0">
              关闭
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="筛选链接状态:" prop="erpGoodsStatusList">
          <el-checkbox-group v-model="ruleForm.erpGoodsStatusList">
            <el-checkbox v-for="(item, index) in statusList" :key="index" :label="item.value">
              <span>{{ item.label }}</span>
              <el-tooltip v-if="item.value == 6" content="无状态SKU为链接产品详情页面中ERP商品状态为空的链接SKU，大部分为映射SKU或低价盲盒产品"
                placement="top-start" effect="light">
                <span class="lapa icon-tishi" />
              </el-tooltip>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="ruleForm.operationType == 1" label="补货保持量:" prop="autoReplenishment">
          <el-input v-model.number="ruleForm.autoReplenishment" style="width: 300px;" type="number" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSalesStatus } from '@/utils/staticDataOrigin';
export default {
  name: "ComponentsAutoReplenishment",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default() {
        return [];
      }
    },
    platformCode: {
      type: String,
      default: ""
    },
    autoReplenishmenttype: {
      type: [String, Number, Object],
      default: null
    },
    searchOptions: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        operationType: 1,
        erpGoodsStatusList: [1, 2, 4, 6],
        autoReplenishment: ""
      },
      rules: {
        autoReplenishment: [
          { required: true, message: "请输入补货保持量", trigger: "blur" },
          {
            pattern: /^\+?[1-9][0-9]{0,4}$/,
            message: "请输入5位非零正整数",
            trigger: "blur"
          }
        ],
        erpGoodsStatusList: [
          { required: true, message: "请选择筛选链接状态", trigger: "change" }
        ]
      },
      statusList: getSalesStatus()
    };
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit("update:modelVisible", val);
      this.tableData = [];
    }
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].resetFields();
      });
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate(valid => {
        if (!valid) return;
        let [_self, list, plenishType] = [this, this.list, this.autoReplenishmenttype];
        let {
          operationType,
          autoReplenishment,
          erpGoodsStatusList
        } = this.ruleForm;
        //区分平台区分api
        let plantformData = {
          ebay: {
            api() {
              let str = "";
              if (plenishType == 2) {
                str += _self.api.ebay.updateSyncInfoForAllLink;
                str += `?autoReplenishment=${operationType == 1 ? autoReplenishment : 0}&operationType=${operationType}&erpGoodsStatusList=${erpGoodsStatusList}`;
              } else {
                str += _self.api.ebay.updateAutoReplenishmentForLink;
              }
              return str;
            },
            // 获取数据
            async data() {
              let data = null;
              if (plenishType == 1) data = plantformData.ebay.mulData();
              if (plenishType == 2) data = await plantformData.ebay.allData();
              return data;
            },
            // 批量
            mulData() {
              return list.map(k => {
                return {
                  linkId: k.linkId,
                  autoReplenishment: operationType == 1 ? autoReplenishment : 0,
                  operationType: operationType, //操作类型，0：关闭，1：启用
                  erpGoodsStatusList: erpGoodsStatusList
                };
              });
            },
            // 全部
            async allData() {
              // let queryStr = '';//拼接传参
              let temp = _self.$common.copy(_self.searchOptions);
              let arr = ["pageNum", "pageSize", "sortField", "sortType"];
              arr.forEach((k, i) => {
                // let symbol = i === 0 ? '?' : '&';
                // queryStr += `${symbol}${k}=${temp[k]}`;
                delete temp[k];
              });
              // 将空字符串置空
              Object.keys(temp).forEach(params => {
                if (temp[params] === "") temp[params] = null;
              });
              temp.updateGoodsStatusList = _self.ruleForm.erpGoodsStatusList;
              // 查询总条数
              // let result = await plantformData.ebay.searchTotal(queryStr, temp);
              let result = await plantformData.ebay.searchTotal(temp);
              if (!result) return false;
              return temp;
            },
            // 查询总条数
            searchTotal(temp) {
              return new Promise((resolve, reject) => {
                let listApi = _self.api.ebay.countAutoReplenishmentForLink;
                _self.loading = true;
                _self.$http.post(listApi, temp).then(res => {
                  if (res.status != 200) return resolve(false);
                  let data = res.data || {};
                  _self.$confirm(
                    `<p>
                      <span>此次修改链接数量：</span>
                      <span style="color:red;"> ${data.linkCount || 0} </span>条
                    </p>
                    <p>
                      <span>子链接数量：</span>
                      <span style="color:red;"> ${data.linkDetailCount || 0} </span>条
                    </p>`,
                    `确认是否批量${_self.ruleForm.operationType == 1 ? '开启' : '关闭'}自动补货`,
                    {
                      confirmButtonText: '确定',
                      cancelButtonText: '取消',
                      type: 'warning',
                      dangerouslyUseHTMLString: true
                    })
                    .then(() => {
                      resolve(true);
                    }).catch(() => {
                      resolve(false);
                    });
                }).catch(() => {
                  resolve(false);
                }).finally(() => {
                  _self.loading = false;
                })
              })
            }
          },
          walmart: {
            api: "",
            data: {}
          }
        };
        let typeData = plantformData[this.platformCode];
        typeData.data().then(handleTemp => {
          let handleApi = typeData.api();
          if (!handleTemp) return false;
          this.loading = true;
          this.$http.post(handleApi, handleTemp).then(res => {
            this.$message.success("操作成功~");
            this.dialogVisible = false;
            this.$emit("search", true);
          }).finally(() => {
            this.loading = false;
          });
        })
      });
    }
  }
};
</script>
<style lang="scss" scoped>

</style>
