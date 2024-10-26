<template>
  <div class="dialog-content bind-spu">
    <el-dialog title="绑定SPU" :visible.sync="dialogVisible" width="800px" :close-on-click-modal="false">
      <div class="content">
        <el-form ref="basicInfo" :model="basicInfo" :rules="rules" :inline="true" label-width="0" class="basicInfo">
          <el-form-item prop="search">
            <el-input v-model="basicInfo.search" type="textarea" placeholder="请输入SPU,多个SPU用逗号或者回车分隔" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <span style="font-size:12px;">提示：<span style="color:#DE2910;">绑定策略后，将于次日凌晨2点执行，周策略于次周1凌晨2点启动</span></span>
        <div>
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="loading" @click="confirmSpu">确 定</el-button>
        </div>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "ApplicationComponentsWhiteList",
  components: {},
  props: {
    modelVisible: {
      type: Boolean,
      default() { return false }
    },
    strategyId: {
      type: String,
      default() { return '' }
    },
  },
  data() {
    return {
      basicInfo: {
        search: '',
      },
      rules: {
        search: [{ required: true, message: '请输入', trigger: 'blur' }]
      },
      dialogVisible: false,
      loading: false,
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (!val) { this.$emit('update:modelVisible', val) }
    },
  },
  created() { },
  methods: {
    // 窗口打开
    open() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        // 重置表单
        this.$refs["basicInfo"].resetFields();
      })
    },
    // 多个用逗号或回车分开
    strChangeArr(val) {
      return val
        .trim()
        .replace(/\n/g, ",")
        .replace(/，/g, ",") // 中文逗号
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    },
    confirmSpu() {
      this.$refs["basicInfo"].validate((valid) => {
        if (!valid) return;
        let temp = {};
        let spuList = this.strChangeArr(this.basicInfo.search);
        temp.erpSpuList = spuList;
        temp.strategyId = this.strategyId;
        // console.log(temp);
        // return;
        this.loading = true;
        this.$http.post(this.api.marketingStrategy.saveproductRelation, temp).then((res) => {
          this.$message.success('操作成功~');
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      })
    }
  },
}
</script>
<style lang="scss">
.bind-spu {
  .content {
    height: 360px;

    .basicInfo,
    .el-form-item,
    .el-form-item__content {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .el-textarea,
    .el-textarea__inner {
      height: 100%;
      resize: none;
    }
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>