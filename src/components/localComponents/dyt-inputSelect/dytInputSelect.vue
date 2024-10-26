<template>
  <div class="dytInputSelectPage">
    <div class="contents">
      <dyt-select v-show="comBtnType == 1" v-model="selectModal" placeholder="请选择" v-bind="selectConfig"
        @change="selectChange">
        <slot>
          <el-option v-for="(item, index) in list" :key="index" :label="item[params.sLabel]"
            :value="item[params.value]" />
        </slot>
      </dyt-select>
      <dyt-textarea v-show="comBtnType == 2" v-model="inputModal" v-bind="inputConfig" @blur="textareaBlur" />
    </div>
    <el-button class="btn" @click="inputChange">
      {{ comBtnType == 1 ? '选择' : '输入' }}
    </el-button>
  </div>
</template>
<script>

export default {
  name: 'DytInputSelect',
  components: {},
  model: {
    prop: 'value',
    event: 'change',//子组件要更新父组件值需要注册的方法
  },
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    list: {//列表
      type: Array,
      default() {
        return [];
      },
    },
    params: {//列表字段
      type: Object,
      default() {
        return {
          label: 'label',
          value: 'value',
        };
      },
    },
    resetAll: {//是否重置
      type: Boolean,
      default: false,
    },
    btnType: { //默认类型
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      selectModal: [],
      inputModal: [],
      comBtnType: 1,//1下拉框 2输入框
    }
  },
  computed: {
    // 下拉框
    selectConfig() {
      let selectArr = ['multiple', 'show-all'];
      return this.commonConfig(selectArr);
    },
    // 输入框
    inputConfig() {
      let selectArr = ['placeholder'];
      return this.commonConfig(selectArr);
    },
  },
  watch: {
    btnType: {
      immediate: true,
      handler(val) {
        this.comBtnType = val;
      }
    },
    selectModal: {
      handler(val) {
        if (JSON.stringify(this.value) === JSON.stringify(val || [])) return;
        this.$emit('change', val);
      },
      deep: true,
    },
    inputModal: {
      handler(val) {
        this.inputBlur(val);
      },
      deep: true,
    },
    value: {
      handler(val) {
        let arr = val || [];
        let selectModal = this.selectModal;
        if (JSON.stringify(arr) === JSON.stringify(selectModal)) return;
        this.selectModal = arr;
        this.selectChange(arr);
      },
      deep: true,
      immediate: true,
    },
    resetAll: {//是否重置
      handler(val) {
        val && (this.inputModal = this.selectModal = []);
      },
      deep: true,
    }
  },
  methods: {
    commonConfig(arr) {
      let [config, attrs] = [{}, this.$attrs];
      arr.forEach(k => {
        if (k in attrs) config[k] = attrs[k];
      })
      return config;
    },
    // 切换输入方式
    inputChange() {
      this.comBtnType = this.comBtnType == 1 ? 2 : 1;
    },
    selectChange(e) {
      let [params, list] = [this.params, this.list];
      let inputModal = this.inputModal;
      let selectModal = this.selectModal;
      let selfLabel = [];//筛选出不在列表中，自添加的数
      inputModal.forEach(label => {
        let isItem = list.filter(item => {
          return item[params.label] === label;
        })
        if (!isItem.length) selfLabel.push(label);
      })
      let isList = list.filter(k => {
        return selectModal.includes(k[params.value]);
      }).map(k => { return k[params.label] });
      let allList = [...selfLabel, ...isList];
      this.inputModal = allList;
    },
    inputBlur(inputModal) {
      let [params, list] = [this.params, this.list];
      let arr = list.filter(k => {
        return inputModal.includes(k[params.label]);
      }).map(k => { return k[params.value] });
      this.selectModal = arr;
    },
    // 重置条件
    resetModel() {
      this.inputModal = this.selectModal = [];
    },
    textareaBlur(e) {
      this.$emit('blur', e);
    }
  }
};
</script>
<style lang="less">
.dytInputSelectPage {
  display: flex;
  align-items: center;

  .contents {
    flex: 1;
    overflow: hidden;
    line-height: 30px;
  }

  .el-select {
    width: 100% !important;

    .el-tag {
      max-width: 116px !important; //宽度被选择和输入占了，所以要缩小
    }
  }

  .el-input__inner,
  .inputBorder {
    border-radius: 4px 0 0 4px !important;
  }

  .btn {
    border-left: none;
    border-radius: 0 4px 4px 0;
    padding: 9px;

    &,
    &:hover,
    &:active {
      background: transparent;
      border-color: #DCDFE6;
    }
  }
}
</style>
