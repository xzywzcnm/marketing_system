<template>
  <div class="dytSelectLabelPage">
    <el-popover placement="bottom" v-model="visible" width="300" popper-class="popperLabels" @show="focusInputs">
      <div class="dyt-scrollbar__wrap scrollbar">
        <ul class="dyt-select-dropdown__list" v-if="drownList.length">
          <li class="dyt_select-dropdown__item" v-for="(item, index) in drownList" :key="index"
            @click="listClick(item, index)">
            <div v-html="item.labelHtml"></div>
          </li>
        </ul>
        <div v-else class="emptyMessage">无匹配数据</div>
      </div>
      <div slot="reference" class="div-inputs">
        <div class="copy-inputs">
          <div class="copy-inputs_content">
            <div class="tag-lists">
              <el-tag v-for="(tag, index) in tags" :key="index" closable @close="tagDelete(tag, index)">
                <span>{{ tag[labelParams] }}</span>
              </el-tag>
            </div>
            <el-input v-model.trim="filterValue" class="label-inputs" :ref="inputRef" />
          </div>
          <span class=" icon-btn" :class="visible ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></span>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: "DytSelectLabel",
  model: {
    props: 'value',
    event: 'change',
  },
  props: {
    list: {
      type: Array,
      default: () => { return [] },
    },
    value: {
      type: Array,
      default: () => { return [] },
      require: true,
    },
    labelParams: {//标签名
      type: String | Number,
      default: null,
      require: true,
    },
    valueParams: {//标签值
      type: String | Number,
      default: null,
      require: true,
    },
    labelType: {//标签类型 比如'add' 匹配不到标签可以新增
      type: String,
      default: ''
    },
    showAll: {//是否展示全部
      type: Number | String,
      default: ''
    },
  },
  data() {
    return {
      visible: false,
      filterValue: '',
      tags: [],
      inputRef: 'label-inputs' + new Date().getTime() + parseInt(Math.random() * 10000),
    }
  },
  computed: {
    drownList() {
      let list = this.$common.copy(this.list);
      let [label, value, filterValue] = [this.labelParams, this.valueParams, this.filterValue.trim()];
      let tagList = this.tags.map(k => k[value]);
      let showAll = this.showAll;

      // 展示全部
      if (showAll || showAll === 0) {
        let str = '全部标签';
        list.unshift({ [label]: str, [value]: showAll, })
      }

      let filterList = list.filter(k => !tagList.includes(k[value])).map(k => {
        k.labelHtml = k[value] === showAll ? `<span style="color:#F56C6C;">${k[label]}</span>` : k[label];
        return k;
      });

      if (filterValue) {
        filterList = filterList.filter(k => k[label].indexOf(filterValue) >= 0).map(k => {
          k.labelHtml = k[label].replace(filterValue, `<b style="color:#67C23A;">${filterValue}</b>`)
          return k;
        });

        if (this.labelType == 'add') {
          let congruentList = filterList.filter(k => k[label] === filterValue);//存在全等，不需要新增标签
          if (!congruentList.length) {
            filterList.push({ [label]: filterValue, [value]: null, labelHtml: filterValue + '(新标签)' })
          }
        }
      }
      // console.log(filterList);
      return filterList;
    },
  },
  watch: {
    visible(val) {
      if (!val) this.clearFilterValue();
    },
    tags: {
      deep: true,
      handler(val) {
        let tagList = this.$common.copy(val || []);
        let arr = tagList.map(k => {
          delete k.labelHtml;
          return k;
        })
        this.$emit('change', arr);
        this.$emit('emitLabel', arr);
      }
    },
    value: {
      deep: true,
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.tags = this.$common.copy(val);
      }
    },
  },
  methods: {
    tagDelete(tag, index) {
      this.tags.splice(index, 1);
      this.visible = false;
    },
    listClick(item) {
      let tagList = this.$common.copy(this.tags);
      let list = tagList;
      let [showAll, value] = [this.showAll, this.valueParams];
      // 存在全部标签，其余标签则要清除，同理，相反
      if (!this.$common.isEmpty(showAll)) {
        if (item[value] === showAll) {
          list = [item];
        } else {
          let exsitAll = tagList.filter(k => k[value] === showAll);
          if (exsitAll.length) {
            list = [item];
          } else {
            list.push(item);
          }
        }
      } else {
        list.push(item);
      }
      this.tags = list;
      this.visible = false;
    },
    clearFilterValue() {
      this.filterValue = '';
    },
    focusInputs() {
      this.$refs[this.inputRef].focus();
    }
  }
}
</script>
<style lang="less">
.dytSelectLabelPage {

  .el-popover__reference-wrapper,
  .popperLabels {
    display: inline-block;
    width: 300px;
  }

  .div-inputs {
    width: 300px;
    cursor: pointer;

    .copy-inputs {
      border: 1px solid #DCDFE6;
      border-radius: 4px;
      padding: 4px 30px 4px 6px;
      position: relative;
    }

    .icon-btn {
      position: absolute;
      top: 50%;
      right: 15px;
      transform: translateX(50%) translateY(-50%);
    }
  }

  .copy-inputs_content {
    display: flex;
    flex-wrap: wrap;
    margin: -2px;

    .label-inputs {
      flex-grow: 1;
      width: 0.0961538%;
      margin-left: 4px;
      min-width: 10px;

      .el-input__inner {
        padding: 0;
        border: none;
      }

      &,
      .el-input__inner {
        height: 26px;
        line-height: 26px;
      }
    }

    .tag-lists {
      display: contents;

      .el-tag {
        padding: 0 5px;
        margin: 2px;
      }
    }
  }
}

.popperLabels {
  padding: 0;

  .emptyMessage {
    text-align: center;
    padding: 20px 10px;
    color: #999;
  }

  .dyt-scrollbar__wrap {
    background-color: #fff;
    max-height: 400px;
    overflow: auto;
  }

  .dyt-select-dropdown__list {
    padding: 4px 0;
  }

  .dyt_select-dropdown__item {

    &:hover {
      background-color: #f5f7fa;
    }

    font-size: 14px;
    padding: 0 20px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #606266;
    height: 34px;
    line-height: 34px;
    box-sizing: border-box;
    cursor: pointer;
  }
}
</style>