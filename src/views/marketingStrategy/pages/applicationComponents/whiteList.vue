<template>
  <div class="dialog-content bind-store">
    <el-dialog title="Item白名单" :visible.sync="dialogVisible" width="1000px" :close-on-click-modal="false">
      <div>
        <div class="transfer-main">
          <div class="transfer-left">
            <div class="transfer-left__main">
              <div class="leftmain-title">
                <span>白名单列表</span>
                <el-button v-if="isEdit" type="danger" size="mini" :disabled="!leftTemp.checkedList.length"
                  :loading="leftTemp.delLoading" @click="dels">
                  删除
                </el-button>
              </div>
              <div class="main-content leftmain-content">
                <div class="item-title">
                  <div v-if="isEdit" class="item-title__check">
                    <el-checkbox v-model="leftTemp.checkAll" :indeterminate="leftTemp.isIndeterminate"
                      @change="handleCheckAllChange">
                      全选
                    </el-checkbox>
                  </div>
                  <div class="item-title__input">
                    <dyt-textarea v-model="leftTemp.searchOptions.itemIdList" placeholder="输入ItemID查询，多个逗号隔开"
                      @valEmit="valEmit" />
                  </div>
                </div>
                <div v-loading="leftTemp.loading" class="item-content">
                  <ul class="item-lists">
                    <div v-if="!leftTemp.list.length" class="item-lists_empty">
                      暂无数据
                    </div>
                    <template v-if="isEdit">
                      <el-checkbox-group v-model="leftTemp.checkedList" @change="handlecheckedListChange">
                        <!-- 接口whiteId又又又更改为itemId（墙都不服就服这个后端，天天改也是服了） -->
                        <li v-for="item in leftTemp.list" :key="item.id" class="item-lists-temp">
                          <el-checkbox :label="item.id">
                            <span>{{ item.itemId }}</span>
                          </el-checkbox>
                        </li>
                      </el-checkbox-group>
                    </template>
                    <template v-else>
                      <li v-for="item in leftTemp.list" :key="item.id" class="item-lists-temp">
                        <span>{{ item.itemId }}</span>
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
                <span>新增白名单</span>
                <el-button v-if="isEdit" type="primary" size="mini" :loading="rightTemp.loading" @click="confirmWhite">
                  新增
                </el-button>
              </div>
              <div class="main-content rightmain-content">
                <el-form ref="basicInfo" :model="rightTemp.basicInfo" :rules="rightTemp.rules" :inline="true"
                  label-width="0" class="basicInfo">
                  <el-form-item prop="itemIdList">
                    <el-input v-model="rightTemp.basicInfo.itemIdList" type="textarea" placeholder="请输入Item ID" />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </div>
        <div class="mt6">
          Item ID 数量：{{ leftTemp.list.length }}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <span style="font-size:12px;">提示：<span style="color:#DE2910;">Item白名单中的Item ID将不会参与策略执行。</span></span>
        <div>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </span>
    </el-dialog>
  </div>
</template>
<script>
const leftTemp = {
  searchOptions: {
    itemIdList: [],
    strategyId: '',
  },
  checkAll: false,//全部选中
  checkedList: [],//选中列表
  list: [],//存放白名单列表
  isIndeterminate: false,//是否半选
  oldVal: '',//解决死循环
  loading: false,
  delLoading: false,
}
export default {
  name: "ApplicationComponentsWhiteList",
  components: {},
  props: {
    modelVisible: {
      type: Boolean,
      default() { return false }
    },
    strategyId: {
      type: String,
      default() { return '' }
    },
    isEdit: {
      type: Boolean,
      default() { return false }
    },
  },
  data() {
    return {
      // 左侧
      leftTemp: {},
      // 右侧
      rightTemp: {
        basicInfo: {
          itemIdList: '',
        },
        rules: {
          itemIdList: [{ required: true, message: '请输入', trigger: 'blur' }]
        },
        loading: false,
      },
      dialogVisible: false,
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (!val) { this.$emit('update:modelVisible', val) }
    },
  },
  created() {
    this.resetData(1);
  },
  methods: {
    // 窗口打开
    open() {
      this.dialogVisible = true;
      this.resetData(1);
      this.$nextTick(() => {
        this.$refs["basicInfo"].resetFields();
        this.leftTemp.searchOptions.strategyId = this.strategyId;
        this.getWhiteList();
      })
    },
    // 重置
    resetData(type) {
      if (type === 1) {
        this.leftTemp = this.$common.copy(leftTemp);
        return;
      }
      this.leftTemp.checkAll = false;
      this.leftTemp.isIndeterminate = false;
      this.leftTemp.list = [];
      this.leftTemp.checkedList = [];
    },
    // 获取白名单列表
    getWhiteList() {
      this.leftTemp.loading = true;
      this.$http.post(this.api.marketingStrategy.queryAllwhite, this.leftTemp.searchOptions).then((res) => {
        this.resetData(2);
        this.leftTemp.list = res.data || [];
      }).finally(() => {
        this.leftTemp.loading = false;
      })
    },
    // 左全选
    handleCheckAllChange(val) {
      if (val) {
        this.leftTemp.checkedList = this.leftTemp.list.map(k => { return k.id });
      } else {
        this.leftTemp.checkedList = [];
      }
      this.leftTemp.isIndeterminate = false;
    },
    // 左单选
    handlecheckedListChange(value) {
      let checkedCount = value.length;
      let listCount = this.leftTemp.list.length;
      this.leftTemp.checkAll = checkedCount === listCount;
      this.leftTemp.isIndeterminate = checkedCount > 0 && checkedCount < listCount;
    },
    // 删除
    dels() {
      this.$confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let temp = this.leftTemp.checkedList || [];
        this.leftTemp.delLoading = true;
        this.$http.post(this.api.marketingStrategy.removeItemIdwhite, temp).then((res) => {
          this.$message.success('操作成功~');
          this.getWhiteList();
          this.resetData(2);
        }).finally(() => {
          this.leftTemp.delLoading = false;
        })
      }).catch(() => { });
    },
    // 多行
    valEmit(val) {
      if (this.leftTemp.oldVal === val) return;
      this.getWhiteList();
      this.leftTemp.oldVal = val;
    },
    // 多个用逗号或回车分开
    strChangeArr(val) {
      return val
        .trim()
        .replace(/\n/g, ",")
        .replace(/，/g, ",") // 中文逗号
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    },
    // 确认增加
    confirmWhite() {
      this.$refs["basicInfo"].validate((valid) => {
        if (!valid) return;
        let itemIdList = this.strChangeArr(this.rightTemp.basicInfo.itemIdList)
        let temp = {};
        temp.itemIdList = itemIdList;
        temp.strategyId = this.strategyId;
        // console.log(temp);
        // return;
        this.rightTemp.loading = true;
        this.$http.post(this.api.marketingStrategy.savewhite, temp).then((res) => {
          this.$message.success('操作成功~');
          this.$refs["basicInfo"].resetFields();
          this.getWhiteList();
        }).finally(() => {
          this.rightTemp.loading = false;
        })
      })
    },
  },
}
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

      .main-content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .leftmain-content {
        border: 1px solid #dcdee2;
      }

      .rightmain-content {

        .basicInfo,
        .el-form-item,
        .el-form-item__content {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .leftmain-textarea {
          height: 100%;
        }

        .el-textarea,
        .el-textarea__inner {
          height: 100%;
          border-radius: 0;
          resize: none;
        }
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
