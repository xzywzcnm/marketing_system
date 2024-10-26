<template>
  <div>
    <el-date-picker
      v-bind="selectConfig"
      :class="{ wid300: isShowAll === true }"
      v-on="$listeners"
    />
  </div>
</template>

<script>
export default {
  name: "DytTimePicker",
  props: {
    // 时间插件可选范围
    disabledDate: {
      type: Object,
      default() {
        return {};
      },
    },
    otherShortcuts: {
      type: Array,
      default() {
        return [];
      },
    },
    // 让时分秒显示完整
    isShowAll: {
      type: Boolean,
      default: false,
    },
    hidePicker: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      shortcuts: [
        {
          text: "最近一周",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit("pick", [start, end]);
          },
        },
        {
          text: "最近一个月",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit("pick", [start, end]);
          },
        },
        {
          text: "最近三个月",
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit("pick", [start, end]);
          },
        },
      ],
      defaultConfig: {
        type: "daterange",
        "range-separator": "-",
        "start-placeholder": "开始日期",
        "end-placeholder": "结束日期",
        "value-format": "yyyy-MM-dd",
      },
    };
  },
  computed: {
    selectConfig() {
      let config = Object.assign({}, this.defaultConfig, this.$attrs);
      if (config.disabled || config.readonly) {
        config.placeholder = "";
      }
      if (!this.hidePicker) {
        let shortcuts = this.otherShortcuts.length
          ? this.otherShortcuts
          : this.shortcuts; // 快捷选择
        config.pickerOptions = { shortcuts: shortcuts, ...this.disabledDate };
      } else {
        config.pickerOptions = this.disabledDate;
      }
      return config;
    },
  },
};
</script>

<style>
.wid300 {
  width: 300px !important;
}
</style>