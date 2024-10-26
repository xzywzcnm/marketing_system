<template>
  <div class="setTableColumnsPage">
    <el-popover placement="bottom" width="500" trigger="click"
      :popper-class="'setTableColumnsPopper ' + option.popperClass" @hide="popoverHide" @show="popoverShow">
      <div class="popverContent">
        <div class="titles">
          <span class="selfMade">自定义列显示</span>
          <el-button v-if="list.length" type="text" @click="resumeList">
            恢复默认
          </el-button>
        </div>
        <div class="content">
          <div v-if="list.length">
            <el-checkbox-group v-model="checkList">
              <el-checkbox v-for="(item, index) in list" :key="index" :label="item.value">
                <div class="checkboxWidth">
                  {{ item.label }}
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <div v-else class="emptys">
            暂无数据
          </div>
        </div>
      </div>
      <span slot="reference" class="el-icon-s-tools settingIcon mr10" />
    </el-popover>
  </div>
</template>

<script>
export default {
  name: "SetTableColumns",
  model: {
    prop: 'value',
    event: 'columnChange',
  },
  props: {
    value: {
      type: Array,
      default: () => {
        return [];
      }
    },
    list: {
      type: Array,
      default: () => {
        return [];
      }
    },
    option: {
      type: Object,
      default: () => {
        return {};
      }
    },
  },
  data() {
    return {
      checkList: [],
    }
  },
  watch: {
    checkList: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.$emit("columnChange", val || []);
        this.$emit("change", val || []);
      },
      deep: true,
    },
    value: {
      handler(val) {
        if (!Array.isArray(val)) return;
        if (JSON.stringify(this.checkList) === JSON.stringify(val)) return;
        this.checkList = val;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 恢复默认勾选全部
    resumeList() {
      this.checkList = this.list.map(k => {
        return k.value;
      })
    },
    // 面板展示触发
    popoverShow() {
      this.$emit('show');
    },
    // 面板隐藏时触发
    popoverHide() {
      this.$emit('hide');
    },
  }
}
</script>
<style lang="scss">
.setTableColumnsPage {
  .settingIcon {
    font-size: 18px;
    cursor: pointer;
  }
}

.setTableColumnsPopper {
  .popverContent {
    .titles {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #dcdfe6;
    }

    .selfMade {
      margin-right: 10px;
      line-height: 32px;
    }

    .content {
      padding-top: 10px;
      margin-bottom: -4px;

      .el-checkbox {
        margin-bottom: 4px;
        display: inline-flex;

        .el-checkbox__input {
          margin-top: 4px;
        }
      }

      .checkboxWidth {
        width: 100px;
        white-space: normal;
        word-break: break-all;
      }

      .emptys {
        text-align: center;
        padding: 10px 0;
      }
    }
  }
}
</style>