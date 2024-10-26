<template>
  <div
    :ref="`tag-${pageId}`"
    class="dyt-input-tag-demo"
  >
    <el-popover
      :placement="popoverPlacement"
      :width="popoverWidth"
      :hide-after="100"
      trigger="click"
      :popper-class="`${limit > 0 ? ' ' : 'hidden-popper-content '}tag-popper-content${!selectConfig.disabled ? '' : ' is-disabled-tag'}`"
      @after-enter="afterEnter"
      @after-leave="afterLeave"
      @show="popoverShow"
      @hide="popoverHide"
      @before-enter="showBefore"
    >
      <template slot="reference">
        <div
          class="dyt-input-tag-content"
          :class="{
            'dyt-tag-content-limit': limit > 0,
            'tag-content-focus': isFocus,
            'is-disabled-tag': selectConfig.disabled
          }"
          @click="focus"
        >
          <template v-if="limit > 0">
            <div
              v-if="vModel.length > 0"
              class="tag-limit"
            >
              <span
                v-for="(tag, index) in vModel.slice(0, limit)"
                :key="`tag-${index}`"
                class="el-tag el-tag--info"
                @click="clickTag(tag)"
              >
                <span
                  class="el-tag-text"
                  :title="defaultProp.label ? tag[defaultProp.label] : tag"
                >
                  {{ defaultProp.label ? tag[defaultProp.label] : tag }}
                </span>
                <i
                  v-if="selectConfig.closable"
                  title="移除"
                  class="el-tag__close el-icon-close"
                  @click.stop="closeTag(tag)"
                />
              </span>
            </div>
            <span
              v-else
              class="input-new-tag tag-text-view"
            >
              {{ placeholder }} 
            </span>
            <div
              v-if="vModel.length - limit > 0 && limit > 0"
              class="more-tag"
            >
              <el-tooltip
                effect="light"
                placement="bottom"
                popper-class="popper-limit-tips"
                :disabled="disabledTip || isShow"
              >
                <span>+ {{ vModel.length - limit }}</span>
                <template slot="content">
                  <div class="popper-tips-content">
                    <span
                      v-for="(tip, tIndex) in vModel"
                      :key="`tip-${tIndex}`"
                      class="limit-tips-item"
                    >
                      {{ defaultProp.label ? tip[defaultProp.label] || '' : tip }}
                    </span>
                  </div>
                </template>
              </el-tooltip>
            </div>
            <div
              v-if="vModel.length && selectConfig.closable"
              class="clearable-all"
            >
              <i
                class="el-tag__close el-icon-close"
                title="清空"
                @click.stop="clearableHand"
              />
            </div>
          </template>
          <template v-else>
            <div class="default-tag-constent">
              <span
                v-for="(tag, index) in vModel"
                :key="`tag-${index}`"
                class="el-tag el-tag--info"
                @click="clickTag(tag)"
              >
                <span
                  class="el-tag-text"
                  :title="(defaultProp.label || defaultProp.value) ? tag[defaultProp.label || defaultProp.value] : tag"
                >{{ (defaultProp.label || defaultProp.value) ? tag[defaultProp.label || defaultProp.value] : tag }}</span>
                <i
                  v-if="selectConfig.closable"
                  class="el-tag__close el-icon-close"
                  title="移除"
                  @click.stop="closeTag(tag)"
                />
              </span>
              <el-input
                v-if="!(limit > 0) && selectConfig.addTag"
                :ref="`saveTagInput-${pageId}`"
                v-model="inputValue"
                :autosize="true"
                resize="none"
                :type="type"
                class="input-new-tag input-writing-tag"
                :class="{
                  'input-empty-tag': vModel.length === 0
                }"
                :placeholder="vModel.length <= 0 ? placeholder : ''"
                :style="`width:${ vModel.length > 0 && !inputValue.includes('\n') ? inputWidth: '100%;'}`"
                @keyup.native.enter="addTagHand"
                @keyup="tagkeyup"
                @blur="blur"
              />
            </div>
            <div
              v-if="vModel.length && selectConfig.closable"
              class="clearable-all"
            >
              <i
                class="el-tag__close el-icon-close"
                title="清空"
                @click.stop="clearableHand"
              />
            </div>
          </template>
          <el-input
            v-model="valueValidation"
            class="tag-form-item-tool"
            type="text"
          />
        </div>
      </template>
      <div
        v-if="limit > 0"
        :ref="`popover-${pageId}`"
      >
        <el-input
          v-if="selectConfig.addTag || ['textarea'].includes(type)"
          :ref="`popoverTagInput-${pageId}`"
          v-model="inputValue"
          :class="{
            'input-empty-tag': vModel.length === 0
          }"
          :type="type"
          :placeholder="placeholder"
          :disabled="selectConfig.disabled"
          :autosize="{minRows: 2, maxRows: (preview ? 4 : 15)}"
          resize="none"
          @keyup.native.enter="addTagHand"
          @keyup="tagkeyup"
          @blur="blur"
        />
        <div
          v-if="(preview && type === 'textarea') || type !== 'textarea'"
          style="max-height: 300px; margin-top: 10px; overflow-y: auto;overflow-x: hidden;"
        >
          <template v-if="vModel.length > 0">
            <span
              v-for="(tag, index) in vModel"
              :key="`tag-${index}`"
              class="el-tag el-tag--info"
              @click="clickTag(tag)"
            >
              <span
                class="el-tag-text"
                :title="(defaultProp.label || defaultProp.value) ? tag[defaultProp.label || defaultProp.value] : tag"
              >
                {{ (defaultProp.label || defaultProp.value) ? tag[defaultProp.label || defaultProp.value] : tag }}
              </span>
              <i
                v-if="selectConfig.closable"
                title="移除"
                class="el-tag__close el-icon-close"
                @click.stop="closeTag(tag)"
              />
            </span>
          </template>
          <span v-else>暂无数据!</span>
        </div>
      </div>
    </el-popover>
  </div>
</template>
<script>

/**
 * 方法 close 配置之后，点击关闭之后需自己处理， 参数返回 当前 tag
 * 方法 click， 参数返回 当前 tag
 * 方法 addTheTag  参数返回 当前输入值
 * disabled 是否禁用，数据类型 Boolean，默认值 false，若设置为 true 则禁用编辑
 * readonly 是否只读，数据类型 Boolean，默认值 false， 若设置为 true 则不能编辑
 * closable 是否显示关闭按钮, 数据类型 Boolean，默认值 true, 只读或禁用时失效
 * addTag 是否可自定义新增, 数据类型 Boolean，默认值 true, 只读或禁用时失效
 * limit 最多显示 tag 个数，数据类型 Number，默认值 0，设置大于 0 数字才生效，设置后内容不换行
 */

export default {
  name: 'DytInputTag',
  model: {
    prop: 'modelValue',//数组
    event: 'valueChange'
  },
  props: {
    // 绑定值， 使用 v-model 或 modelValue 绑定
    modelValue: { type: [Array, String], default: () => {return []}},
    // 占位符提示
    placeholder: { type: String, default: '请输入后按回车或使用逗号分隔'},
    // 最多显示格式， 0 为不限制
    limit: { type: Number, default: 0 },
    // 禁用
    disabled: { type: Boolean, default: false },
    // 只读
    readonly: { type: Boolean, default: false },
    // 是否可以添加 tag
    addTag: { type: Boolean, default: true },
    // 对输入值进行分割字符集合
    split: { type: [Array, String], default: () => {return [',', '，', '\n']} },
    // change 事件是否返回字符串
    string: { type: Boolean, default: false },
    // 返回字符串时的分隔符号（string 为 true 时生效）
    separStr: { type: String, default: ',' },
    // 值为对象时，string 必须为 false，键值替换
    defaultProp: { type: Object, default: () => {return {}} },
    // 输入框的类型, 可选值：textarea、text
    type: { type: String, default: 'text'},
    // 当 type 为 textarea 并且 limit 大于 0 生效， 下拉是否展示 tag 默认 false
    preview: { type: Boolean, default: false },
    // 是否禁用 tip
    disabledTip: { type: Boolean, default: false }
  },
  data () {
    return {
      pageId: Math.random().toString(36).substring(2),
      valueValidation: '',
      inputValue: '',
      popoverPlacement: 'bottom',
      vModel: [],
      inputWidth: '100%;',
      isFocus: false,
      isShow: false,
      popoverWidth: 200,
      defaultConfig: {
        disabled: false,
        type: 'info',
        closable: true,
        size: 'small'
      }
    }
  },
  computed: {
    selectConfig () {
      let config = { ...this.defaultConfig, ...this.$attrs, addTag: this.addTag };
      if (this.disabled || this.readonly) {
        config.closable = false;
        config.addTag = false;
        config.disabled = true;
      }
      return config;
    }
  },
  watch: {
    modelValue: {
      deep: true,
      immediate: true,
      handler (val) {
        if (typeof val === 'string') {
          if (val === this.vModel.join(this.separStr)) return;
          this.inputValue = val;
        } else {
          if (JSON.stringify(val) === JSON.stringify(this.vModel)) return;
          let textVal = '';
          const separated = typeof this.split === 'string' ? this.split : this.split.includes('\n') ? '\n' : this.split[0];
          const propSplit = typeof this.split === 'string' ? [this.split] : this.split;

          (val || []).forEach((item, index) => {
            if (typeof item === 'string') {
              propSplit.forEach((str) => {
                item.includes(str) && (item = item.replace(new RegExp(`${str}`,'g'), ''));
              })
              textVal = index > 0 ? `${textVal}${item}${separated}` : `${item}${separated}`;
            } else if (this.defaultProp.label && !this.$common.isEmpty(item[this.defaultProp.label])) {
              let newI = item[this.defaultProp.label];
              propSplit.forEach((str) => {
                newI.includes(str) && (newI = newI.replace(new RegExp(`${str}`,'g'), ''));
              });
              textVal = index > 0 ? `${textVal}${newI}${separated}` : `${newI}${separated}`;
            } else if (this.$common.isEmpty(this.defaultProp.label) && this.defaultProp.value && !this.$common.isEmpty(item[this.defaultProp.value])) {
              let newI = item[this.defaultProp.value];
              propSplit.forEach((str) => {
                newI.includes(str) && (newI = newI.replace(new RegExp(`${str}`,'g'), ''));
              });
              textVal = index > 0 ? `${textVal}${newI}${separated}` : `${newI}${separated}`;
            }
          });
          this.inputValue = textVal;
        }
        this.$nextTick(() => {
          if (!this.selectConfig.addTag) {
            this.vModel = val;
          } else {
            this.addTagHand();
          }
          this.$nextTick(() => {
            this.inputWidth = this.$common.isEmpty(this.vModel) ? '100%;' : '50px;';
          })
        })
      }
    },
    vModel: {
      deep: true,
      handler (val) {
        if (this.$common.isEmpty(val)) {
          this.inputValue = `${this.inputValue}inputValue`;
          this.$nextTick(() => {
            this.inputValue = '';
          })
        }
        const isString = typeof this.modelValue === 'string';
        if (this.defaultProp.value || this.defaultProp.label) {
          let backVal = '';
          if (this.string) {
            val.forEach((item, index) => {
              if (!this.$common.isEmpty(item[this.defaultProp.value])) {
                backVal += index === 0 ? `${item[this.defaultProp.value]}` : `${this.separStr}${item[this.defaultProp.value]}`;
              } else if (!this.$common.isEmpty(item[this.defaultProp.label])) {
                backVal += index === 0 ? `${item[this.defaultProp.label]}` : `${this.separStr}${item[this.defaultProp.label]}`;
              }
            });
          }
          this.$emit('valueChange', isString ? (this.type === 'textarea' ? this.inputValue : backVal) : val);
          this.$emit('change', this.string ? backVal : val);
        } else {
          this.$emit('valueChange', isString ? val.join(this.separStr) : val);
          this.$emit('change', this.string ? val.join(this.separStr) : val);
        }
        // 由于使用了 elInput 作为输入框输入，表单验证时在输入都都会触发验证，如不多次触发验，改组件后续需要将 elInput 更改为 input
        this.$nextTick(() => {
          this.valueValidation = `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
        })
      }
    },
    inputValue: {
      deep: true,
      handler (val) {
        this.$nextTick(() => {
          this.inputWidth = this.initInputWidth(val);
          this.popoverAdjust();
        })
      }
    }
  },
  mounted () {
    this.handPopoverWidth();
  },
  methods: {
    handPopoverWidth () {
      // 弹出宽度设置
      this.$refs[`tag-${this.pageId}`] && (this.popoverWidth = this.$refs[`tag-${this.pageId}`].offsetWidth);
    },
    initInputWidth (val) {
      if (this.limit > 0) return '';
      const cn = val.replace(/[^\u4e00-\u9fa5]/gi,"");
      const valLength = val.length;
      return`${val ? (cn.length * 14.2 + (valLength - cn.length) * 7 + 37) + 'px;' : '50px;'}`;
    },
    clickTag (tag) {
      this.$emit('click', tag);
    },
    // 清空
    clearableHand () {
      if (!this.selectConfig.closable) return;
      this.$nextTick(() => {
        this.$emit('clearableHand');
        this.vModel = [];
      });
    },
    // 移除单个 tag
    closeTag (tag) {
      if (!this.selectConfig.closable) return;
      if (this.$attrs.onClose) {
        this.$emit('close', tag);
      } else {
        if (this.defaultProp.value) {
          this.vModel = this.vModel.filter(item => {
            return item[this.defaultProp.value] !== tag[this.defaultProp.value];
          })
        } else {
          this.vModel.splice(this.vModel.indexOf(tag), 1);
        }
      }
      // 如果是多行文本，不清空输入值的情况
      if(!this.preview && this.type === 'textarea' && this.limit > 0) {
        let index = this.inputValue.indexOf(tag);
        const newSplit = typeof this.split === 'string' ? [this.split] : this.split;
        if (index > -1) {
          let newTag = newSplit.filter(sp => {
            return this.inputValue.includes(`${this.inputValue.substring(index, tag.length)}${sp}`);
          });
          if (newTag[0]) {
            newTag = `${this.inputValue.substring(index, tag.length)}${newTag[0]}`;
            this.inputValue = `${this.inputValue.substring(0, index)}${this.inputValue.substring(index + newTag.length)}`;
          } else {
            this.inputValue = `${this.inputValue.substring(0, index)}${this.inputValue.substring(index + tag.length)}`;
          }
        }
      }
      this.$nextTick(() => {
        this.limit > 0 && this.$refs[`popoverTagInput-${this.pageId}`] && this.$refs[`popoverTagInput-${this.pageId}`].focus();
      })
    },
    // 键盘事件
    tagkeyup (e) {
      this.$emit('keyup', e);
    },
    // 字符串分割
    strSplitHand (str, splitStr) {
      if (this.$common.isEmpty(str)) return [];
      if (typeof str !== 'string') return str;
      if (typeof splitStr === 'string') return str.split(splitStr);
      if (this.$common.isArray(splitStr)) {
        if (splitStr.length === 0) return [str];
        return str.split(new RegExp(`${splitStr.join('|')}+`)).filter(item => !this.$common.isEmpty(item, true));
      }
      return [str];
    },
    // 处理多行文本内容
    changeInputVal (matchingSplit) {
      let tagList = matchingSplit;
      let newVal = '';
      let getValList = [];
      const textValue = this.inputValue;
      const listL = tagList.length - 1;
      const separated = typeof this.split === 'string' ? this.split : this.split.includes('\n') ? '\n' : this.split[0];
      if (listL < 1) return this.$common.isEmpty(tagList[0]) ?  '' : `${tagList[0]}${separated}`;
      tagList.forEach((item, index) => {
        if (typeof this.split === 'string') {
          if (!getValList.includes(item)) {
            if (index === listL) {
              getValList.push(item);
              newVal = `${newVal}${item}${this.split}`;
            } else if (textValue.includes(`${this.split}${item}${this.split}`) || (index === 0 && textValue.includes(`${item}${this.split}`))) {
              getValList.push(item);
              newVal = `${newVal}${item}${this.split}`;
            }
          }
        } else if (this.$common.isArray(this.split)) {
          const split = this.split;
          if (split.length === 0) return textValue;
          split.forEach((sp1) => {
            split.forEach((sp2) => {
              if (!getValList.includes(item)) {
                if (index === listL) {
                  getValList.push(item);
                  newVal = `${newVal}${item}${separated}`;
                } else if (textValue.includes(`${sp1}${item}${sp2}`) || (index === 0 && textValue.includes(`${item}${sp2}`))) {
                  getValList.push(item);
                  newVal = `${newVal}${item}${sp2}`;
                }
              }
            })
          })
        }
      });
      return newVal;
    },
    // 添加
    addTagHand (e) {
      if (e && e.key === 'Enter'){
        this.$emit('keyupEnter', e);
        if (this.type === 'textarea') return;
      }
      if (this.$common.isEmpty(this.inputValue)) {
        if(!this.preview && this.type === 'textarea' && this.limit > 0) {
          this.vModel = [];
        }
        return;
      }
      const newAddItems = this.strSplitHand(this.inputValue, this.split).filter(item => !this.$common.isEmpty(item, true));
      let addItems = [];
      let matchingSplit = [];
      newAddItems.forEach((item) => {
        if (!addItems.includes(item.trim())) {
          addItems.push(item.trim());
          matchingSplit.push(item);
        }
      });
      if (this.$attrs.onAddTheTag) {
        this.$emit('addTheTag', addItems);
        this.inputValue = '';
      } else {
        let newTags = [];
        if (this.defaultProp.value || this.defaultProp.label) {
          const keys = this.vModel.map(tag => {
            return tag[this.defaultProp.value || this.defaultProp.label];
          });
          addItems.forEach((item) => {
            if (!keys.includes(item) || this.type === 'textarea') {
              let newTag = {};
              this.defaultProp.value && (newTag[this.defaultProp.value] = item);
              this.defaultProp.label && (newTag[this.defaultProp.label] = item);
              !this.$common.isEmpty(newTag) && newTags.push(newTag);
            }
          })
        }
        if(!this.preview && this.type === 'textarea' && this.limit > 0) {
          this.vModel = this.defaultProp.value ? newTags : this.$common.copy(addItems);
          setTimeout(() => {
            this.inputValue = this.changeInputVal(matchingSplit);
          }, 300);
        } else {
          this.vModel = this.defaultProp.value ? [...this.vModel, ...newTags] : this.$common.arrRemoveRepeat([...this.vModel, ...addItems]);
          this.inputValue = '';
        }
      }
    },
    // 失去焦点
    blur () {
      this.$refs[`saveTagInput-${this.pageId}`] && this.$refs[`saveTagInput-${this.pageId}`].blur();
      this.isFocus = false;
      setTimeout(() => {
        this.addTagHand();
      }, 200);
    },
    // 获取焦点
    focus () {
      if (this.limit <= 0) {
        this.$refs[`saveTagInput-${this.pageId}`] && this.$refs[`saveTagInput-${this.pageId}`].focus();
        this.isFocus = (!this.disabled && !this.readonly && this.selectConfig.addTag);
      }
    },
    // 弹窗位置调整
    popoverAdjust () {
      this.$nextTick(() => {
        const content = this.$refs[`popover-${this.pageId}`];
        if (!content) return;
        const ele = this.$refs[`tag-${this.pageId}`];
        const parentNode = content.parentNode;
        const scrollTop = this.$common.getElementScrollTop(ele);
        const viewH = window.innerHeight;
        const coordinates = this.$common.getElementOffset(ele);
        this.popoverPlacement = `${(coordinates.y + parentNode.offsetHeight + ele.offsetHeight + 30 > (scrollTop + viewH)) ? 'top' : 'bottom'}`;
      })
    },
    // 弹窗前
    showBefore () {
      this.popoverAdjust();
    },
    // 显示时触发
    popoverShow () {
      this.isFocus = !this.selectConfig.disabled;
      this.isShow = true;
      this.$emit('show');
      const inputValue = this.inputValue;
      this.inputValue = '';
      this.$nextTick(() => {
        this.inputValue = inputValue;
      })
    },
    // 显示动画播放完毕后触发
    afterEnter () {
      this.$refs[`popoverTagInput-${this.pageId}`] && this.$refs[`popoverTagInput-${this.pageId}`].focus();
      this.$emit('showAfter');
    },
    // 隐藏时触发
    popoverHide () {
      this.$emit('hide');
      this.isShow = false;
    },
    // 隐藏动画播放完毕后触发
    afterLeave () {
      // 获取焦点触发
      this.$nextTick(() => {
        this.$emit('hideAfter');
      })
    }
  }
}

</script>

<style lang="less">
@inputHeight: 24px;
@dyt-font-size: 14px;
.dyt-input-tag-demo{
  width: 100%;
}
.dyt-input-tag-content{
  display: flex;
  padding: 3px 3px 0px 3px;
  min-width: 200px;
  width: 100%;
  min-height: 32px;
  line-height: 1em;
  -webkit-appearance: none;
  border: 1px solid #DCDFE6;
  box-sizing: border-box;
  color: #606266;
  font-size: inherit;
  background-color: #FFF;
  background-image: none;
  border-radius: 4px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  &.is-disabled-tag{
    cursor: no-drop;
    background-color: #f5f7fa;
    .el-tag{
      cursor: no-drop;
    }
  }
  .default-tag-constent{
    width: calc(100% - 18px);
  }
  .clearable-all{
    padding-left: 0px;
    width: 18px;
    line-height: @inputHeight;
    text-align: center;
    color: #a8abb2;
    i {
      margin-top: 5px;
      border-radius: 100%;
      cursor: pointer;
      // &:hover{
      //   color: #FFF;
      //   background-color: #909399;
      // }
    }
  }
  &.tag-content-focus{
    border-color: #409EFF;
    outline: 0;
  }
  &.dyt-tag-content-limit{
    display: flex;
    cursor: pointer;
    &.is-disabled-tag{
      cursor: no-drop;
    }
    .tag-limit{
      display: flex;
      flex: 100;
      width: calc(100% - 2px);
      overflow: hidden;
      .el-tag{
        position: relative;
        flex: 100;
        min-width: 60px;
        height: 24px;
        line-height: normal;
        justify-content: left;
        .el-icon-close{
          position: absolute;
          top: 2px;
          right: 2px;
          // transform: scale(.8) translate(0, -60%) !important;
        }
      }
    }
    .more-tag{
      padding: 0 0 0 3px;
      font-size: 14px;
      color: #ddd;
      line-height: 25px;
    }
  }
  .el-tag{
    position: relative;
    max-width: 100%;
    font-size: @dyt-font-size;
    cursor: pointer;
    overflow: hidden;
    .el-tag-text{
      display: inline-block;
      max-width: calc(100% - 15px);
      white-space: nowrap;
      // white-space: pre;
      font-size: @dyt-font-size;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .el-icon-close{
      right: initial;
      top: 2px;
      font-size: @dyt-font-size;
      vertical-align: top;
    }
    &.el-tag--info{
      height: 24px;
      margin-bottom: 3px;
      margin-right: 5px;
      line-height: 24px;
      vertical-align: top;
      .el-tag-text{
        line-height: normal;
      }
    }
  }
  .input-new-tag{
    min-width: 50px;
    max-width: 100%;
    &.tag-text-view{
      padding-left: 12px;
      height: @inputHeight;
      line-height: @inputHeight;
      font-size: 12px;
      // color: #a8abb2;
      color: #c5c5c5;
    }
    &.input-empty-tag{
      .el-input__inner,
      .el-input__wrapper
      .el-textarea__inner{
        padding-left: 12px;
        margin-bottom: 0;
        height: @inputHeight;
        line-height: @inputHeight;
        border: none;
        box-shadow: none;
        overflow: hidden;
      }
    }
    &.el-input__inner,
    &.el-input__wrapper{
      padding: 0 5px;
      height: @inputHeight;
      line-height: @inputHeight;
      border: none;
      box-shadow: none;
    }
  }
  .input-writing-tag{
    .el-input__inner,
    .el-input__wrapper{
      padding: 0;
      height: @inputHeight;
      line-height: @inputHeight;
      border: none;
      box-shadow: none;
    }
    .el-textarea__inner{
      padding: 0 0 3px 12px;
      border: none;
      box-shadow: none;
      outline: none;
    }
  }
  .tag-form-item-tool{
    display: none;
  }
}
.tag-popper-content{
  max-width: 500px;
  padding-bottom: 4px;
  padding: 12px;
  &.hidden-popper-content{
    display: none !important;
  }
  &.is-disabled-tag{
    .el-tag{
      cursor: default;
      .el-tag-text{
        max-width: 100%;
      }
    }
  }
  .el-tag{
    margin-right: 8px;
    margin-bottom: 8px;
    max-width: 100%;
    height: 27px;
    line-height: 27px;
    font-size: @dyt-font-size;
    cursor: pointer;
    overflow: hidden;
    .el-tag-text{
      display: inline-block;
      max-width: calc(100% - 14px);
      white-space: nowrap;
      // white-space: pre;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .el-icon-close{
      right: initial;
      top: 6px;
      vertical-align: top;
    }
  }
  .el-input__validateIcon{
    display: none;
  }
}
 // tip 提示
.popper-limit-tips{
  padding: 0;
  &.is-light{
    border: 1px solid #bfbfbf;
  }
  .popper-tips-content{
    max-width: 500px;
    max-height: 50vh;
    overflow: auto;
  }
  .limit-tips-item{
    display: inline-block;
    margin: 5px;
    padding: 3px 8px;
    font-size: 14px;
    color: #909399;
    background: #f4f4f5;
    border-radius: 5px;
  }
}
</style>
