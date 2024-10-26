<template>
  <div class="dialog-content">
    <el-dialog :title="showModal.title" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="batchOperationPage dialogAutoHeight">
      <el-form ref="ruleForm" :model="showModal.formData" :rules="showModal.rules" label-width="100px" class="pl10 pr10">
        <!-- 库存修改 -->
        <div v-if="data.type === 'inventory'">
          <el-form-item label="库存修改为:" prop="inventoryQuantity">
            <el-input v-model="showModal.formData.inventoryQuantity" />
          </el-form-item>
        </div>
        <!-- 补货保持值 -->
        <template v-if="data.type === 'replenish'">
          <el-form-item label="操作类型:" prop="replenishType">
            <el-radio-group v-model="showModal.formData.replenishType">
              <el-radio :label="1">
                启用
              </el-radio>
              <el-radio :label="0">
                关闭
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="showModal.formData.replenishType == 1" label="补货保持值:" prop="autoReplenishment">
            <el-input v-model="showModal.formData.autoReplenishment" />
          </el-form-item>
        </template>
        <!-- 设置防超卖 -->
        <template v-if="data.type === 'preventOversale'">
          <el-form-item label="设置防超卖:" prop="newSyncInventoryStatus">
            <el-radio-group v-model="showModal.formData.newSyncInventoryStatus">
              <el-radio :label="1">
                启用
              </el-radio>
              <el-radio :label="0">
                关闭
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <div v-if="['ebay'].includes(data.platformCode) && showModal.formData.newSyncInventoryStatus == 1">
            <el-form-item label="超卖警戒值:" prop="syncInventoryWarningValue">
              <el-input v-model.number="showModal.formData.syncInventoryWarningValue" type="number" />
            </el-form-item>
          </div>
        </template>
        <!-- 处理时间 -->
        <div v-if="data.type === 'deliveryTime'">
          <el-form-item label="处理时间修改为:" prop="deliveryTime" label-width="130px">
            <el-input v-model="showModal.formData.deliveryTime" />
          </el-form-item>
        </div>
        <!-- 忽略初始化 -->
        <template v-if="data.type === 'ignorelimit'">
          <el-form-item label="操作类型:" prop="newIgnoreInitialization">
            <el-radio-group v-model="showModal.formData.newIgnoreInitialization">
              <el-radio :label="1">
                启用
              </el-radio>
              <el-radio :label="0">
                关闭
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <div v-if="showModal.formData.newIgnoreInitialization == 1" class="pl20">
            开启忽略初始化后，将清空链接所设置的自动补货、防超卖功能，并且不会再次自动开启自动补货、防超卖功能
          </div>
        </template>
        <!-- 取消受限 -->
        <template v-if="data.type === 'cancelLimit'">
          <div class="pt15">
            系统判断为受限链接将取消受限
          </div>
        </template>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span style="color:red;padding:0 4px;">{{ data.len || 0 }}</span>
          条
        </span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import regular from '@/utils/regular';
export default {
  name: "WalmartBatchOperation",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default() {
        return {
          len: 0,//长度
          type: null,//类型
          platformCode: '',//平台类型
        }
      },
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      operate: {
        inventory: {
          title: '修改库存',
          formData: {
            inventoryQuantity: '',
          },
          rules: {
            inventoryQuantity: [
              { required: true, message: '请输入', trigger: 'blur' },
              { pattern: regular.checkIsPositiveInteger, message: '请输入大于或等于0的整数', trigger: 'blur' },
              { pattern: regular.checkIsPositiveInteger, message: '请输入大于或等于0的整数', trigger: 'change' },
            ],
          },
        },
        replenish: {
          title: '设置自动补货',
          formData: {
            replenishType: 1,
            autoReplenishment: '',
          },
          rules: {
            replenishType: [
              { required: true, message: '请选择', trigger: 'change' },
            ],
            autoReplenishment: [
              { required: true, message: '请输入', trigger: 'blur' },
              { pattern: regular.integerZero, message: '请输入大于或等于0的整数', trigger: 'blur' },
              { pattern: regular.integerZero, message: '请输入大于或等于0的整数', trigger: 'change' },
            ],
          },
        },
        preventOversale: {
          title: '设置防超卖',
          formData: {
            newSyncInventoryStatus: 1,
            syncInventoryWarningValue: '',
          },
          rules: {
            newSyncInventoryStatus: [
              { required: true, message: '请选择', trigger: 'change' },
            ],
            syncInventoryWarningValue: [
              { required: true, message: '请输入', trigger: 'blur' },
              { pattern: regular.checkIsPositiveInteger, message: '请输入大于或等于0的整数', trigger: 'blur' },
              { pattern: regular.checkIsPositiveInteger, message: '请输入大于或等于0的整数', trigger: 'change' },
            ],
          },
        },
        deliveryTime: {
          title: '修改处理时间',
          formData: {
            deliveryTime: '',
          },
          rules: {
            deliveryTime: [
              { required: true, message: '请输入', trigger: 'blur' },
              { pattern: regular.integerZero, message: '请输入大于或等于0的整数', trigger: 'blur' },
              { pattern: regular.integerZero, message: '请输入大于或等于0的整数', trigger: 'change' },
            ],
          },
        },
        ignorelimit: {
          title: '设置忽略初始化',
          formData: {
            newIgnoreInitialization: 1,
          },
          rules: {
            newIgnoreInitialization: [
              { required: true, message: '请选择', trigger: 'change' },
            ],
          },
        },
        cancelLimit: {
          title: '取消受限操作',
          formData: {
            constrainStatus: 0
          },
        },
      },
      showModal: {},
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
      this.showModal = this.$common.copy(this.operate[this.data.type] || {
        title: '修改',
        formData: {},
      });
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs['ruleForm'].resetFields();
      })
    },
    confirmHandle() {
      this.$refs['ruleForm'].validate((valid) => {
        if (!valid) return;
        this.$emit('batchOperatReturn', this.$common.copy(this.showModal.formData));
      })
    },
  }
}
</script>