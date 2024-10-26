<template>
  <div class="dytMulSearchPage">
    <div class="contents">
      <el-input v-show="comBtnType == 1" v-model="inputModel" v-bind="bindConfig" class="singleInput" @blur="inputBlur"
        @focus="inputFocus"></el-input>
      <dyt-textarea v-show="comBtnType == 2" v-model="textareaModel" v-bind="bindConfig" />
    </div>
    <el-button class="btn" @click="inputChange">
      {{ comBtnType == 1 ? '模糊' : '精确' }}
    </el-button>
  </div>
</template>
<script>

export default {
  name: 'DytMulSearch',
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
    btnType: { //默认类型
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      inputModel: '',
      textareaModel: [],
      comBtnType: 1,
      compareInputModel: '',
    }
  },
  computed: {
    bindConfig() {
      let config = {
        placeholder: '请输入',
        clearable: true,
      };
      return Object.assign({}, config, this.$attrs);
    },
  },
  watch: {
    btnType: {
      immediate: true,
      handler(val) {
        this.comBtnType = val;
      }
    },
    textareaModel: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.$emit('change', val);
      },
      deep: true,
    },
    value: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        let arr = val || [];
        if (!arr.length) {
          this.inputModel = '';
          this.textareaModel = [];
        } else {
          let compareArr = [];
          let comBtnType = this.comBtnType;
          const vagueType = comBtnType == 1;// 模糊
          const accurateType = comBtnType == 2;// 精确
          if (vagueType) compareArr = this.inputModel ? [this.inputModel] : [];
          if (accurateType) compareArr = this.textareaModel;
          if (JSON.stringify(arr) === JSON.stringify(compareArr)) return;
          if (vagueType) this.inputModel = arr[0] || '';
          if (accurateType) this.textareaModel = arr;
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 切换输入方式
    inputChange() {
      let comBtnType = this.comBtnType == 1 ? 2 : 1;
      let value = '';
      // 模糊
      if (comBtnType == 1) value = this.textareaModel[0] || '';
      // 精确
      if (comBtnType == 2) value = this.inputModel || '';
      this.inputModel = value;
      this.textareaModel = value ? [value] : [];
      this.comBtnType = comBtnType;
    },
    // 聚焦记录原值
    inputFocus() {
      this.compareInputModel = this.inputModel;
    },
    // 失去焦点回透父组件
    inputBlur() {
      let inputModel = this.inputModel;
      if (inputModel === this.compareInputModel) return;
      let arr = inputModel ? [inputModel] : [];
      this.$emit('change', arr);
    }
  }
};
</script>
<style lang="less">
.dytMulSearchPage {
  display: flex;
  align-items: center;

  .contents {
    flex: 1;
    overflow: hidden;
    line-height: 30px;

    .singleInput {
      font-size: 12px;
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
