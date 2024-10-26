<template>
  <div class="dialog-content labelManagePage">
    <el-dialog title="标签管理" :visible.sync="dialogVisible" width="650px" :close-on-click-modal="false" class="labelManage">

      <div class="content">
        <el-form ref="labelManageForm" label-width="120px" :model="formData">
          <el-form-item label="新增标签:" prop="addList">
            <dyt-selectLabel v-model="formData.addList" :list="labelList" labelParams="name" valueParams="id"
              @emitLabel="labelChange" labelType="add"></dyt-selectLabel>
          </el-form-item>
          <el-form-item label="删除标签:" prop="delList">
            <dyt-selectLabel v-model="formData.delList" :list="labelList" labelParams="name" valueParams="id"
              @emitLabel="labelChange" :showAll="0"></dyt-selectLabel>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer flexJustEnd">
        <!-- <el-form ref="totalForm" label-width="0" :model="confirmData" :rules="confirmRules" :inline="true"
          class="totalForm">
          <div class="cofirmTotal" v-if="data.priceVerify">
            请在此处确认执行链接数量
            <el-form-item prop="total">
              <el-input style="width: 70px;margin:0 4px;" v-model="confirmData.total" onpaste="return false" />
            </el-form-item>条；
          </div>
          <el-form-item class="mr20">
            可执行修改的链接数量<span style="color:#FC2D1A;margin:0 8px;">{{ data.len || 0 }}</span>条
          </el-form-item>
        </el-form> -->
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ottoModifyPrice",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    labelList: {
      type: Array,
      default() {
        return []
      }
    },
  },
  data() {
    return {
      dialogVisible: false,//组件弹框
      loading: false,
      formData: {
        addList: [],
        delList: [],
      },
      // rules: {
      //   addList: [{ validator: this.checkList, trigger: "blur", name: 'addList' }],
      //   delList: [{ validator: this.checkList, trigger: "blur", name: 'delList' }],
      // },
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
        this.$refs['labelManageForm'].resetFields();
      })
    },
    // // 校验
    // checkList(rule, value, callback) {
    //   let { addList, delList } = this.formData;
    //   if (!(addList.length || delList.length)) {
    //     callback(new Error('新增和删除必填一个!'));
    //     return;
    //   }
    //   callback();
    // },
    // 确认修改
    confirmHandle() {
      this.$refs['labelManageForm'].validate(async (valid) => {
        if (!valid) return;
        let { addList, delList } = this.formData;
        if (!(addList.length || delList.length)) {
          this.$message.warning('新增和删除必填一个!');
          return;
        }
        let temp = Object.assign({}, this.data);
        temp.deleteLabelIdList = delList.filter(k => k.id || k.id === 0).map(k => k.id);
        temp.updateLabelIdList = addList.filter(k => k.id || k.id === 0).map(k => k.id);
        temp.insertLabelNameList = addList.filter(k => !(k.id || k.id === 0)).map(k => k.name);
        // console.log(temp)
        this.loading = true;
        this.$http.post(this.api.otto.updateLinkDetailLabels, temp).then((res) => {
          this.$message.success("操作成功~");
          this.dialogVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      });
    },
    labelChange() {
      this.$refs['labelManageForm'].clearValidate();
    },
  }
}
</script>
