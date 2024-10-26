<template>
  <div class="dialog-content">
    <el-dialog :title="showModal.title" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="batchOperationPage dialogAutoHeight">
      <el-form ref="ruleForm" :model="showModal.formData" :rules="showModal.rules" label-width="100px" class="pl10 pr10">
        <!-- 修改库存 -->
        <div v-if="data.type === 'inventory'">
          <el-form-item label="库存修改为:" prop="newInventoryQuantity">
            <el-input v-model="showModal.formData.newInventoryQuantity" />
          </el-form-item>
        </div>
        <!-- 自动补货 -->
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
        <!-- 防超卖 -->
        <template v-if="data.type === 'preventOversale'">
          <el-form-item label="设置防超卖:" prop="syncInventoryStatus">
            <el-radio-group v-model="showModal.formData.syncInventoryStatus">
              <el-radio :label="1">
                启用
              </el-radio>
              <el-radio :label="0">
                关闭
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="showModal.formData.syncInventoryStatus == 1" label="超卖警戒值:"
            prop="syncInventoryWarningValue">
            <el-input v-model.number="showModal.formData.syncInventoryWarningValue" type="number" />
          </el-form-item>
        </template>
        <!-- 取消受限 -->
        <template v-if="data.type === 'cancelLimit'">
          <div class="pt15">
            系统判断为受限链接将取消受限
          </div>
        </template>
        <!-- 忽略初始化 -->
        <template v-if="data.type === 'ignorelimit'">
          <el-form-item label="操作类型:" prop="ignoreInitialization">
            <el-radio-group v-model="showModal.formData.ignoreInitialization">
              <el-radio :label="1">
                启用
              </el-radio>
              <el-radio :label="0">
                关闭
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <div v-if="showModal.formData.ignoreInitialization == 1" class="pl20">
            开启忽略初始化后，将清空链接所设置的自动补货、防超卖功能，并且不会再次自动开启自动补货、防超卖功能
          </div>
        </template>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span class="errorTips">{{ data.len || 0 }}</span>
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
          data: {},//提交的数据
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
            newInventoryQuantity: '',
          },
          rules: {
            newInventoryQuantity: [
              { required: true, message: '请输入', trigger: 'blur' },
              { pattern: regular.checkIsPositive, message: '请输入大于或等于0的整数', trigger: 'blur' },
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
              { pattern: regular.checkIsPositive, message: '请输入大于或等于0的整数', trigger: 'blur' },
            ],
          },
        },
        preventOversale: {
          title: '设置防超卖',
          formData: {
            syncInventoryStatus: 1,
            syncInventoryWarningValue: '',
          },
          rules: {
            syncInventoryStatus: [
              { required: true, message: '请选择', trigger: 'change' },
            ],
            syncInventoryWarningValue: [
              { required: true, message: '请输入', trigger: 'blur' },
              { pattern: regular.checkIsPositive, message: '请输入大于或等于0的整数', trigger: 'blur' },
            ],
          },
        },
        cancelLimit: {
          title: '取消受限操作',
          formData: {
            constrainStatus: 0
          },
        },
        ignorelimit: {
          title: '设置忽略初始化',
          formData: {
            ignoreInitialization: 1,
          },
          rules: {
            ignoreInitialization: [
              { required: true, message: '请选择', trigger: 'change' },
            ],
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
        let propsData = this.data;
        let data = this.$common.copy(this.showModal.formData);
        let fun = {
          replenish() {
            data.autoReplenishment = data.replenishType == 1 ? data.autoReplenishment : 0;
            delete data.replenishType;
          },
          preventOversale() {
            data.syncInventoryStatus === 0 && delete data.syncInventoryWarningValue;
          },
        }
        fun[propsData.type] && fun[propsData.type]();
        let temp = Object.assign({}, data, propsData.data);
        // console.log(temp)

        this.loading = true;
        this.$http.post(this.api.ebay.batchUpdateLinkDetail, temp).then((res) => {
          this.$message.success("操作成功~");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      })
    },
  }
}
</script>