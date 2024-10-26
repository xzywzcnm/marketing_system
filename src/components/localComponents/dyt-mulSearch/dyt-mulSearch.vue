<template>
  <div class="dytMulSearchPage">
    <div class="contents">
      <el-input v-show="comBtnType == 1" v-model="inputModel" v-bind="bindConfig" class="singleInput"
        :placeholder="bindConfig.vaguePlaceholder || bindConfig.placeholder"></el-input>
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
  props: {
    preciseValue: {//精准查询
      type: Array,
      default() {
        return [];
      },
    },
    vagueValue: {//模糊查询
      type: String,
      default: ''
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
    inputModel: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.$emit('update:vagueValue', val);
      },
      deep: true,
    },
    textareaModel: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.$emit('update:preciseValue', val);
      },
      deep: true,
    },
    preciseValue: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.textareaModel = val;
      },
      deep: true,
    },
    vagueValue: {
      handler(val, oval) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        this.inputModel = val;
      },
      deep: true,
    },
  },
  methods: {
    // 切换输入方式
    inputChange() {
      this.inputModel = '';
      this.textareaModel = [];
      this.comBtnType = this.comBtnType == 1 ? 2 : 1;
    },
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
