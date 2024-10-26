<template>
  <div class="dialog-content bind-store">
    <el-dialog title="绑定店铺" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false">
      <div>
        <div class="transfer-main">
          <div class="transfer-left">
            <div class="transfer-left__main">
              <div class="leftmain-title">
                <span>已绑定店铺列表</span>
                <el-button v-if="isEdit" type="danger" size="mini" :disabled="!leftTemp.checkedList.length"
                  @click="dels">
                  删除
                </el-button>
              </div>
              <div class="leftmain-content">
                <div class="item-title">
                  <div v-if="isEdit" class="item-title__check">
                    <el-checkbox v-model="leftTemp.checkAll" :indeterminate="leftTemp.isIndeterminate"
                      @change="handleCheckAllChange('leftTemp')">
                      全选
                    </el-checkbox>
                  </div>
                  <div class="item-title__input">
                    <dyt-textarea v-model="leftTemp.searchOptions.commonStoreAccountList" placeholder="输入店铺代号或店铺名查询"
                      @valEmit="leftvalEmit" />
                  </div>
                </div>
                <div class="item-content">
                  <ul class="item-lists">
                    <div v-if="!leftTemp.list.length" class="item-lists_empty">
                      暂无数据
                    </div>
                    <template v-if="isEdit">
                      <el-checkbox-group v-model="leftTemp.checkedList" @change="handlecheckedListChange('leftTemp')">
                        <li v-for="item in leftTemp.list" :key="'left' + item.commonStoreId" class="item-lists-temp">
                          <el-checkbox :label="item.commonStoreId">
                            <span>{{ item.accountCode + '[' + item.account + ']' }}</span>
                          </el-checkbox>
                        </li>
                      </el-checkbox-group>
                    </template>
                    <template v-else>
                      <li v-for="item in leftTemp.list" :key="'left' + item.commonStoreId" class="item-lists-temp">
                        <span>{{ item.accountCode + '[' + item.account + ']' }}</span>
                      </li>
                    </template>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="transfer-right">
            <div class="transfer-right__main">
              <div class="leftmain-title">
                <span>店铺列表</span>
                <el-button v-if="isEdit" type="primary" size="mini" :disabled="!rightTemp.checkedList.length"
                  :loading="rightTemp.loading" @click="confirmStore">
                  新增
                </el-button>
              </div>
              <div class="leftmain-content">
                <div class="item-title">
                  <div v-if="isEdit" class="item-title__check">
                    <el-checkbox v-model="rightTemp.checkAll" :indeterminate="rightTemp.isIndeterminate"
                      @change="handleCheckAllChange('rightTemp')">
                      全选
                    </el-checkbox>
                  </div>
                  <div class="item-title__input">
                    <dyt-textarea v-model="rightTemp.searchOptions.commonStoreAccountList" placeholder="输入店铺代号或店铺名查询"
                      @valEmit="rightvalEmit" />
                  </div>
                </div>
                <div class="item-content">
                  <ul class="item-lists">
                    <div v-if="!rightTemp.list.length" class="item-lists_empty">
                      暂无数据
                    </div>
                    <template v-if="isEdit">
                      <el-checkbox-group v-model="rightTemp.checkedList" @change="handlecheckedListChange('rightTemp')">
                        <li v-for="item in rightTemp.list" :key="'right' + item.commonStoreId" class="item-lists-temp">
                          <el-checkbox :label="item.commonStoreId" :disabled="repeatList.includes(item.commonStoreId)">
                            <span>{{ item.accountCode + '[' + item.account + ']' }}</span>
                          </el-checkbox>
                        </li>
                      </el-checkbox-group>
                    </template>
                    <template v-else>
                      <li v-for="item in rightTemp.list" :key="'right' + item.commonStoreId" class="item-lists-temp">
                        <span>{{ item.accountCode + '[' + item.account + ']' }}</span>
                      </li>
                    </template>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt6">
          绑定店铺数：{{ leftTemp.list.length }}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <span style="font-size:12px;">提示：<span style="color:#DE2910;">策略执行时，会根据绑定的店铺进行执行。</span></span>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
const leftTemp = {
  searchOptions: {
    commonStoreAccountList: [],
    strategyId: ""
  },
  checkAll: false, //全部选中
  checkedList: [], //选中列表
  list: [], //存放白名单列表
  isIndeterminate: false, //是否半选
  oldVal: "", //解决死循环
  loading: false,
  delLoading: false
};
const rightTemp = {
  searchOptions: {
    commonStoreAccountList: []
  },
  checkAll: false, //全部选中
  checkedList: [], //选中列表
  list: [], //存放白名单列表
  isIndeterminate: false, //是否半选
  oldVal: "", //解决死循环
  loading: false
};
export default {
  name: "ApplicationComponentsBindStore",
  components: {},
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      }
    },
    strategyId: {
      type: String,
      default() {
        return "";
      }
    },
    isEdit: {
      type: Boolean,
      default() {
        return false;
      }
    }
  },
  data() {
    return {
      leftTemp: {},
      rightTemp: {},
      dialogVisible: false,
      repeatList: [] //已勾选的店铺id
    };
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit("update:modelVisible", val);
      }
    },
    "leftTemp.list": {
      handler(newVal, oldVal) {
        if (!Array.isArray(newVal)) return;
        this.repeatList = newVal.map(k => {
          return k.commonStoreId;
        });
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.resetData("leftTemp", 1);
    this.resetData("rightTemp", 1);
  },
  methods: {
    // 窗口打开
    open() {
      this.dialogVisible = true;
      this.resetData("leftTemp", 1);
      this.resetData("rightTemp", 1);
      this.$nextTick(() => {
        this.leftTemp.searchOptions.strategyId = this.strategyId;
        this.getStoreList("leftTemp");
        this.getStoreList("rightTemp");
      });
    },
    // 重置
    resetData(type, part, ignoreList) {
      if (!type) return;
      if (part === 1) {
        this[type] = this.$common.copy(
          type === "leftTemp" ? leftTemp : rightTemp
        );
        return;
      }
      this[type].checkAll = false;
      this[type].isIndeterminate = false;
      this[type].checkedList = [];
      !ignoreList ? (this[type].list = []) : "";
    },
    // 获取该策略下的店铺
    getStoreList(type) {
      let api = {
        leftTemp: "queryAllstoreRelation",
        rightTemp: "queryAllpurview"
      };
      this[type].loading = true;
      return this.$http
        .post(this.api.marketingStrategy[api[type]], this[type].searchOptions)
        .then(res => {
          this.resetData(type, 2);
          this[type].list = res.data || [];
        })
        .finally(() => {
          this[type].loading = false;
        });
    },
    // 全选
    handleCheckAllChange(type) {
      if (this[type].checkAll) {
        let list = [];
        if (type === "leftTemp") {
          list = this[type].list;
        } else {
          list = this[type].list.filter(k => {
            return !this.repeatList.includes(k.commonStoreId);
          });
        }
        this[type].checkedList = list.map(k => {
          return k.commonStoreId;
        });
      } else {
        this[type].checkedList = [];
      }
      this[type].isIndeterminate = false;
    },
    // 单选
    handlecheckedListChange(type) {
      let checkedCount = this[type].checkedList.length;
      let listCount = this[type].list.length;
      this[type].checkAll = checkedCount === listCount;
      this[type].isIndeterminate = checkedCount > 0 && checkedCount < listCount;
    },
    // 左侧多行
    leftvalEmit(val) {
      if (this.leftTemp.oldVal === val) return;
      this.getStoreList("leftTemp");
      this.leftTemp.oldVal = val;
    },
    // 右侧多行
    rightvalEmit(val) {
      if (this.rightTemp.oldVal === val) return;
      this.getStoreList("rightTemp");
      this.rightTemp.oldVal = val;
    },
    // 确认增加
    confirmStore() {
      let temp = {};
      temp.commonStoreIdList = this.rightTemp.checkedList;
      temp.strategyId = this.strategyId;
      // console.log(temp);
      // return;
      this.rightTemp.loading = true;
      this.$http
        .post(this.api.marketingStrategy.saveStoreRelation, temp)
        .then(res => {
          this.$message.success("操作成功~");
          this.getStoreList("leftTemp");
          this.resetData("rightTemp", 2, true);
        })
        .finally(() => {
          this.rightTemp.loading = false;
        });
    },
    // 删除
    dels() {
      this.$confirm("是否确认删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let temp = this.leftTemp.checkedList.map(k => {
            return {
              commonStoreId: k,
              strategyId: this.strategyId
            };
          });
          this.leftTemp.delLoading = true;
          this.$http
            .post(this.api.marketingStrategy.removeByParm, temp)
            .then(res => {
              this.$message.success("操作成功~");
              this.getStoreList("leftTemp");
              this.resetData("leftTemp", 2);
            })
            .finally(() => {
              this.leftTemp.delLoading = false;
            });
        })
        .catch(() => { });
    }
  }
};
</script>
<style lang="scss">
.bind-store {
  .transfer-main {
    display: flex;
    justify-content: space-between;
    height: 500px;
    width: 100%;

    .transfer-left,
    .transfer-right {
      flex: 1;
      overflow: hidden;

      .transfer-left__main,
      .transfer-right__main {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      .leftmain-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
      }

      .leftmain-content {
        flex: 1;
        overflow: hidden;
        border: 1px solid #dcdee2;
        display: flex;
        flex-direction: column;
      }

      .item-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        // background: #f5f7fa;
        border-bottom: 1px solid #dcdee2;

        .item-title__input {
          flex: 1;
        }

        .item-title__check {
          margin-right: 10px;
        }
      }

      .item-content {
        flex: 1;
        overflow: hidden;

        .item-lists {
          padding: 6px 0;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;

          .item-lists_empty {
            text-align: center;
            color: #b9bbc0;
            padding-top: 50px;
          }

          .el-checkbox {
            white-space: pre-wrap;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .el-checkbox__label {
            flex: 1;
            word-break: break-all;
          }

          /*滚动条样式*/
          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
            background: rgba(245, 247, 250, 0.1);
          }

          &::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
            border-radius: 0;
            background: rgba(245, 247, 250, 0.1);
          }

          .item-lists-temp {
            padding: 6px 10px;

            &:hover {
              background: rgba(220, 222, 226, 0.3);

              .el-checkbox__label {
                font-weight: 600;
              }
            }
          }
        }
      }
    }

    .transfer-left {
      padding-right: 20px;
    }

    .transfer-right {
      padding-left: 20px;
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
