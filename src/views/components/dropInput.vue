<!-- 输入框带下拉选项 -->
<template>
  <div class="dropdown-parent">
    <el-input v-model="inputs" v-on="$listeners" v-bind="$attrs" :class="{ focusActive: showIcon }" ref="dropdownInput"
      @focus="inputFocus" @blur="inputBlur" />

    <div v-if="showIcon" class="dropdown-main" @mousedown="mouseChange" @mouseup="mouseChange">
      <el-dropdown trigger="click" @visible-change="dropdownChange" @command="dropdownCommand">
        <span class="el-dropdown-link">
          <span class="lapa icon-santiaoxian blueIcon" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item, i) in list" :key="i + 'dropdownlist'" :command="item.command">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: "ComponentsDropInput",
  props: {
    index: {
      type: Number,
      default: 0,
    },
    value: {
      type: [String, Number],
      default: '',
    },
    list: {
      type: Array,
      default() { return [] },
    }
  },
  data() {
    return {
      inputs: '',
      showIcon: false,
      showDown: false,
    }
  },
  watch: {
    inputs(val) {
      this.$emit('input', val);
    },
    value: {
      handler(nval, oval) {
        this.inputs = nval;
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    // 输入框聚焦
    inputFocus() {
      this.showIcon = true;
      this.showDown = false;
    },
    // 输入框失焦
    inputBlur() {
      if (this.showDown) return;
      this.showIcon = false;
    },
    // 鼠标摁住放开
    mouseChange() {
      this.showDown = true;
    },
    // 下拉面板活动
    dropdownChange(e) {
      if (!e) this.$refs['dropdownInput'].focus();
    },
    dropdownCommand(e) {
      this.$emit('dropdownCommand', { index: this.index, command: e });
    },
  }
}
</script>
<style lang="scss">
.dropdown-parent {
  position: relative;

  .dropdown-main {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0px;
    width: 32px;

    .el-dropdown {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .el-dropdown-link {
      cursor: pointer;
    }
  }

  .focusActive {
    .el-input__inner {
      padding-right: 32px;
    }
  }
}
</style>
