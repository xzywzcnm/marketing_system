<template>
  <div class="dialog-content">
    <el-dialog title="设置仓库" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="wareSettingPage">
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
        <el-form-item label="选择仓库:" prop="warehouseIdList">
          <dyt-select v-model="ruleForm.warehouseIdList" multiple class="wareStyle">
            <el-option v-for="item in userWarehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
          </dyt-select>
        </el-form-item>
        <!-- <el-form-item label="此次修改子链接数量:" label-width="170px">
          <span class="tips">{{ total }}</span> 条
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span style="color:red;padding:0 4px;">{{ total }}</span>
          条
        </span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "EbayWareSetting",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    // data: {
    //   type: Object,
    //   default() { return {} }
    // },
    total: {
      type: Number,
      default() { return 0 }
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {
        warehouseIdList: []
      },
      rules: {
        warehouseIdList: [
          { required: true, message: '请选择仓库', trigger: 'change' },
        ],
      },
      userWarehouseList: [],
    }
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit('update:modelVisible', val);
    },
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs['ruleForm'].resetFields();
      })
      // 获取用户权限仓库列表
      this.$store.dispatch("platformList/getUserWarehouseList").then((list) => {
        this.userWarehouseList = list || [];
      });
    },
    confirmHandle() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return;
        this.$emit('wareSettingReturn', this.$common.copy(this.ruleForm));

        // let temp = {
        //   ...this.data,
        //   warehouseIdList: this.ruleForm.warehouseIdList,
        // }
        // console.log(temp);
        // this.loading = true;
        // this.$http.post(this.api.ebay.batchUpdateLinkDetail, temp).then((res) => {
        //   this.$message.success("操作成功~");
        //   this.dialogVisible = false;
        //   this.$emit('search');
        // }).finally(() => {
        //   this.loading = false;
        // })
      })
    }
  }
}
</script>
<style lang="scss">
.wareSettingPage {
  .el-dialog .el-dialog__body {
    min-height: auto;
  }

  .tips {
    color: #de2910;
  }
}
</style>