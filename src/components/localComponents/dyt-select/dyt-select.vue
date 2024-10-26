<template>
  <el-select v-model="selectModal" v-bind="selectConfig" class="dytSelect" v-on="selectListeners" @change="selectChange">
    <el-option v-if="showAll" label="全部" value="*" />
    <slot />
  </el-select>
</template>

<script>
export default {
  name: "DytSelect",
  model: {
    props: 'value',
    event: 'valueChange',
  },
  props: {
    showAll: {//是否默认全选
      type: Boolean,
      default: false,
    },
    value: {
      type: [String, Array, Number],
      default: null,
    },
  },
  data() {
    return {
      selectModal: null,
      defaultConfig: {
        placeholder: "请选择",
        clearable: true,
        filterable: true,
        multiple: false,
        collapseTags: true,
      },
    }
  },
  computed: {
    // 初始配置加上动态传入配置
    selectConfig() {
      let config = Object.assign({}, this.defaultConfig, this.$attrs);
      delete config.value;
      if (config.disabled || config.readonly) {
        config.placeholder = "";
      }
      return config;
    },
    // 初始配置加上动态传入配置
    selectListeners() {
      let config = this.$common.copy(this.$listeners);
      delete config.change;
      return config;
    },
    // 对默认全部显示处理
    selectData() {
      let val = this.value;
      const multiple = this.selectConfig.multiple;
      if (typeof multiple == 'boolean' && multiple) {
        return this.$common.isEmpty(val) ? (typeof this.showAll === 'boolean' && this.showAll ? ['*'] : val) : val;
      }
      return this.$common.isEmpty(val) ? (typeof this.showAll === 'boolean' && this.showAll ? '*' : val) : val;
    },
  },
  watch: {
    selectModal: {
      deep: true,
      handler(val, oval) {
        this.defaultValHand(val, oval);
      }
    },
    selectData: {
      immediate: true,
      deep: true,
      handler(val) {
        this.selectModal = val;
      }
    },
  },
  methods: {
    // 返回数据
    defaultValHand(val, oval) {
      let value = null;
      if (Array.isArray(val)) {
        if (JSON.stringify(val) === JSON.stringify(oval)) return;
        value = val.includes('*') ? val.filter(i => i !== '*') : val;
      } else {
        if (val === oval) return;
        value = val === '*' ? '' : val;
      }
      if (Array.isArray(val) && val.slice(-1)[0] === '*' && val.length > 1) value = [];
      this.$emit('valueChange', value);
    },
    selectChange(e) {
      this.$nextTick(() => {
        this.$emit('change', e);
      })
    }
  }
}
</script>
<style lang="less">
.dytSelect {
  .el-input {
    height: 32px;
    line-height: 30px;

    .el-input__inner {
      height: 100% !important;
    }
  }
}
</style>