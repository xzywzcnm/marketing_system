<template>
  <div class="dialog-content">
    <el-dialog title="修改库存" :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false"
      class="modifyInventoryPage">
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="130px">
        <el-form-item label="库存修改方式:" prop="updateInventoryType">
          <el-radio-group v-model="ruleForm.updateInventoryType">
            <el-radio :label="0">自定义数值</el-radio>
            <el-radio :label="1">自定义仓库可用库存</el-radio>
            <el-radio :label="2">已绑定仓库可用库存</el-radio>
          </el-radio-group>
        </el-form-item>
        <div v-if="[0, '0'].includes(ruleForm.updateInventoryType)">
          <el-form-item label="库存值:" prop="newInventoryQuantity">
            <el-input v-model.number="ruleForm.newInventoryQuantity" type="number" />
          </el-form-item>
        </div>
        <div v-if="[1, '1'].includes(ruleForm.updateInventoryType)">
          <el-form-item label="仓库:" prop="updateInventoryWarehouseIdList">
            <dyt-select v-model="ruleForm.updateInventoryWarehouseIdList" multiple class="wareStyle">
              <el-option v-for="item in userWarehouseList" :key="item.id" :label="item.warehouseName" :value="item.id" />
            </dyt-select>
          </el-form-item>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span style="color:red;padding:0 4px;">{{ total || 0 }}</span>
          条
        </span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import regular from '@/utils/regular.js';
const ruleForm = {
  updateInventoryType: 0,
  newInventoryQuantity: '',
  updateInventoryWarehouseIdList: []
}
export default {
  name: "modifyInventory",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    total: {
      type: Number,
      default() { return 0 }
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      ruleForm: {},
      rules: {
        updateInventoryType: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
        newInventoryQuantity: [
          { required: true, message: '请输入', trigger: 'blur' },
          { required: true, pattern: regular.integerZero, message: '请输入大于等于0的整数', trigger: 'blur' },
        ],
        updateInventoryWarehouseIdList: [
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
      this.ruleForm = this.$common.copy(ruleForm);
      this.$nextTick(() => {
        this.$refs['ruleForm'].clearValidate();
      })
      // 获取用户权限仓库列表
      this.$store.dispatch("platformList/getUserWarehouseList").then((list) => {
        this.userWarehouseList = list || [];
      });
    },
    confirmHandle() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return;
        let temp = this.$common.copy(this.ruleForm);
        if ([0, '0', 2, '2'].includes(temp.updateInventoryType)) {
          delete temp.updateInventoryWarehouseIdList;
        }
        if ([1, '1', 2, '2'].includes(temp.updateInventoryType)) {
          delete temp.newInventoryQuantity;
        }
        this.$emit('modifyInventoryReturn', this.$common.copy(temp));
      })
    }
  }
}
</script>
<style lang="scss">
.modifyInventoryPage {
  .el-dialog .el-dialog__body {
    min-height: auto;
  }
}
</style>