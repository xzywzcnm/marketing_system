<template>
  <div class="dytInputEditPage">
    <transition name="fade-transform">
      <div class="initDom" v-if="!inputShow" key="key1">
        <span :class="{ 'underline primaryColor': isValueClick }" @click="valueClick">{{ values }}</span>
        <span class="el-icon-edit iconEdits icon-success" @click="edit(true)" v-if="disabled"></span>
      </div>
      <div class="initDom" v-else key="key2">
        <el-input ref="inputs" class="inputs" v-model="inputVal" :disabled="loading" />
        <span class="el-icon-circle-check iconEdits icon-success" @click="edit(false, 'submit')"></span>
        <span class="el-icon-circle-close iconEdits icon-error" @click="edit(false)"></span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "dytInputEdit",
  props: {
    values: {
      type: [String, Number],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isShow: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      inputVal: "",
      inputShow: false,
      loading: false,
    };
  },
  computed: {
    isValueClick() {
      return !!('textClick' in this.$listeners);
    }
  },
  watch: {
    isShow: {
      handler(val) {
        this.inputShow = val;
      },
      deep: true,
    },
  },
  methods: {
    edit(val, type) {
      if (this.loading) {
        this.$message.warning("请等候!");
        return;
      }
      if (type == "submit") {
        this.loading = true;
        this.$emit("emitValue", {
          propData: this.$common.copy(this.data),
          data: { values: this.inputVal },
          fun: (data) => {
            if (data.valid) {
              this.inputShow = val;
            }
            this.loading = false;
          },
        });
      } else {
        this.inputVal = this.values;
        this.inputShow = val;
        this.$nextTick(() => {
          val && this.$refs["inputs"].focus();
        });
      }
    },
    valueClick() {
      if (!this.isValueClick) return;
      this.$emit('textClick', this.data);
    }
  },
};
</script>
<style lang="less">
.dytInputEditPage {
  height: 34px;
  line-height: 32px;
  overflow: hidden;

  .initDom {
    display: flex;
    align-items: center;
    justify-content: center;

    .inputs {
      flex: 1;
      overflow: hidden;
      margin-left: 4px;

      .el-input__inner {
        width: 100%;
        text-align: center;
      }
    }

    .iconEdits {
      font-size: 16px;
      margin-left: 4px;
      cursor: pointer;
    }

    .icon-success {
      color: #409eff;
    }

    .icon-error {
      color: #f56c6c;
    }
  }

  .fade-transform-leave-active,
  .fade-transform-enter-active {
    transition: all 0.2s;
  }

  .fade-transform-enter {
    opacity: 0;
    transform: translateX(-100%);
  }

  .fade-transform-leave-to {
    opacity: 0;
    transform: translateX(0);
  }
}
</style>