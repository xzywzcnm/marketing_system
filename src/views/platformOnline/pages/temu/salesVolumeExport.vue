<template>
  <div class="dialog-content">
    <el-dialog :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="synchronizeInventory-dialog">
      <div slot="title">
        <span>导出</span>
      </div>
      <el-form ref="exportForm" :model="exportForm" label-width="100px">
        <el-form-item label="导出区间:" class="mt20" prop="type">
            <dyt-timePicker v-model="exportForm.exportTime" :disabled-date="expireTimeOPtion" @change="exportTimeChange" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" :disabled="exportForm.exportTime.length === 0" @click="confirmHandle()">导出</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "TemusalesVolumeExport",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      exportForm: {
        exportTime:[]
      },
      startExportTime: '',
      endExportTime: '',
      expireTimeOPtion: {
        disabledDate(time) {
          let times = Date.now() - 24 * 60 * 60 * 1000;
          return time.getTime() > times; 
        }
      },

    }
  },
  watch: {
    modelVisible(val) {
      val && this.open();
    },
    dialogVisible(val) {
      !val && this.$emit('update:modelVisible', val);
    },
  },
  methods: {
    open() {
      this.dialogVisible = this.modelVisible;
      // 每次打开重置日期选择器上次的数据
      this.exportForm.exportTime = ''
    },
    confirmHandle() {
      this.$emit('getExportTime', this.exportForm);
      this.dialogVisible = false;
    },
    exportTimeChange(e) {
      this.timeChange(e, "startExportTime", "endExportTime");
    },
    // 时间切换
    timeChange(e, start, end) {
      if (Array.isArray(e)) {
        [this.exportForm[start], this.exportForm[end]] = e;
        this.exportForm[start] += " 00:00:00";
        this.exportForm[end] += " 23:59:59";
      } else {
        this.exportForm[start] = this.exportForm[end] = "";
      }
    },
  }
}
</script>
<style lang="scss">
.synchronizeInventory-dialog .el-dialog__body {
  min-height: 0 !important;
}
</style>
