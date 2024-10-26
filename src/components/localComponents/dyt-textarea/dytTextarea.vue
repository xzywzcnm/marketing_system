<template>
  <div class="dytTextareaPage" :class="'areaPage' + classTime">
    <el-popover placement="bottom" :width="popoverWidth" trigger="click" popper-class="inputPopover" @show="popoverShow">
      <el-input v-model="textareaVal" type="textarea" :autosize="{ minRows: 4 }" :class="'area' + classTime"
        :placeholder="placeholder + ',多个用回车或逗号分开'" class="inputTextarea" @blur="popverHide" />
      <div slot="reference">
        <div class="inputBorder">
          <div v-if="optionsList.length" class="selfInput" :class="{ mulInput: collapseTags }">
            <div class="tags">
              <div class="inlinTags">
                <!-- tag标签 -->
                <div class="allTags">
                  <div v-for="(item, index) in optionsList" :key="index + 'optionsList'" class="dyt-tag">
                    <div v-if="collapseTags && index === 0 || !collapseTags" class="elTagDiv">
                      <div class="tagItem">
                        {{ item }}
                      </div>
                      <span class="el-icon-error errorIcons" @click.stop="tagClose(index)" />
                    </div>
                  </div>
                </div>
                <!-- 显示个数 -->
                <div v-if="collapseTags && optionsList.length > 1" class="tips">
                  + {{ optionsList.length - 1 }}
                </div>
              </div>
            </div>
            <!-- 删除图标 -->
            <div class="iconDiv">
              <span class="el-icon-circle-close closeIcons" @click.stop="delAllOptions" />
            </div>
          </div>
          <div v-else class="placeholderStyle">
            {{ placeholder }}
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: "DytTextarea",
  model: {
    prop: 'value',//数组
    event: 'valueChange',
  },
  props: {
    value: {
      type: Array,
      default: () => {
        return [];
      }
    },
    collapseTags: {//是否合并为一段文字
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: '请输入',
    },
  },
  data() {
    return {
      classTime: (new Date()).getTime(),//类名
      inputs: '',//输入框显示内容
      textareaVal: '',//文本框显示内容
      popoverWidth: 200,//popover弹框宽度默认200
      optionsList: [],
      showClose: false,
    }
  },
  watch: {
    value: {
      handler(list) {
        if (!Array.isArray(list)) return;
        this.optionsList = list;
        this.textareaVal = list.join('\n');
      },
      deep: true,
      immediate: true,
    },
    optionsList: {
      handler(list) {
        if (JSON.stringify(list) === JSON.stringify(this.value)) return;
        this.$emit('valueChange', list);
      },
      deep: true,
    },
  },
  methods: {
    textAreaFocus() {
      let dom = document.querySelector('.area' + this.classTime);
      let areaDom = dom.querySelector('.el-textarea__inner');
      this.$nextTick(() => {
        areaDom.focus();
      })
    },
    // 显示时触发
    popoverShow() {
      this.setPopoverWidth();
      this.textAreaFocus();
    },
    // 隐藏时触发
    popverHide() {
      let list = Array.from(new Set(this.strChangeArr(this.textareaVal)));//处理成数组并去重
      this.optionsList = list;
      this.textareaVal = list.join('\n');
      this.emitFun('blur', list);
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
    //设置popver的宽度
    setPopoverWidth() {
      let dom = document.querySelector('.areaPage' + this.classTime);
      if (dom) this.popoverWidth = dom.clientWidth;
    },
    // 关闭tag
    tagClose(index) {
      this.optionsList.splice(index, 1);
      this.textareaVal = this.optionsList.join('\n');
      this.textAreaFocus();
    },
    delAllOptions() {
      this.optionsList = [];
      this.textareaVal = '';
      this.textAreaFocus();
      this.emitFun('clear', []);
    },
    emitFun(type, value) {
      if (type in this.$listeners) this.$emit(type, value);
    },
  },
}
</script>
<style lang="scss">
.inputPopover {
  .inputTextarea .el-textarea__inner {
    padding: 5px 10px;
    resize: none;
  }
}

.dytTextareaPage {
  line-height: 22px;

  .inputBorder {
    min-height: 32px;
    width: 100%;
    padding: 0px 4px;
    border-radius: 4px;
    background-color: #FFF;
    background-image: none;
    border: 1px solid #E4E7ED;
    box-sizing: border-box;

    .mulInput {
      height: 30px;
      overflow: hidden;
    }
  }

  .selfInput {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    &:hover {
      .iconDiv .closeIcons {
        display: inline-block;
      }
    }

    .tags {
      flex: 1;
      overflow: hidden;

      .inlinTags {
        display: flex;
        align-items: center;
        max-width: 100%;

        .allTags {
          max-width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          flex-wrap: wrap;

          .dyt-tag {
            height: 24px;
            max-width: 100%;
            margin: 3px 0;

            .errorIcons {
              position: absolute;
              right: 4px;
              top: 50%;
              transform: translateY(-50%);
              cursor: pointer;
            }

            .tagItem {
              width: 100%;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
            }

            &:not(:last-child) {
              .elTagDiv {
                margin-right: 4px;
              }
            }
          }

          .elTagDiv {
            max-width: 100%;
            background-color: #f4f4f5;
            border-color: #e9e9eb;
            color: #909399;
            display: inline-block;
            padding: 0 20px 0 6px;
            font-size: 12px;
            border: 1px solid #d9ecff;
            border-radius: 2px;
            box-sizing: border-box;
            white-space: nowrap;
            position: relative;
            height: 24px;
          }
        }
      }
    }

    .tips {
      height: 24px;
      line-height: 22px;
      font-size: 12px;
      display: inline-block;
      background-color: #f4f4f5;
      color: #909399;
      padding: 0 8px;
      border: 1px solid #e9e9eb;
      border-radius: 4px;
      white-space: nowrap;
    }

    .iconDiv {
      width: 18px;

      .closeIcons {
        display: none;
        cursor: pointer;
      }
    }

    .iconDiv,
    .tips {
      color: #C0C4CC;
      margin-left: 4px;
    }
  }

  .placeholderStyle {
    color: #C0C4CC;
    font-size: 12px;
    line-height: 30px;
    padding-left: 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>