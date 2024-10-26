<template>
  <div class="dialog-content">
    <el-dialog
      title="备注"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
      class="remarksPage"
    >
      <el-form
        :model="ruleForm"
        ref="ruleForm"
        label-width="0"
        hide-required-asterisk
      >
        <el-form-item
          prop="content"
          :rules="{
            required: !(data.linkNotes && data.linkNotes.length),
            message: '请输入',
            trigger: 'blur',
          }"
        >
          <div class="displayFlex">
            <el-input
              v-model="ruleForm.content"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
            ></el-input>
            <el-button
              type="primary"
              @click="submitForm('ruleForm')"
              class="ml10"
              :loading="subLoading"
            >
              提交
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <el-table
        ref="table"
        :data="tableData"
        border
        v-loading="loading"
        max-height="600"
      >
        <el-table-column
          label="备注内容"
          prop="content"
          align="center"
        ></el-table-column>
        <el-table-column
          label="备注时间"
          prop="gmtCreate"
          width="140"
          align="center"
        ></el-table-column>
        <el-table-column
          label="备注人"
          prop="createName"
          width="160"
          align="center"
        ></el-table-column>
      </el-table>
      <div class="pageBox mt10" style="text-align: right">
        <el-pagination
          :current-page="searchParmas.pageNum"
          :page-sizes="Globalsize"
          :page-size="searchParmas.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "remarks",
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      loading: false,
      subLoading: false,
      dialogVisible: false,
      total: 0,
      tableData: [],
      ruleForm: {
        id: "",
        content: "",
      },
      // rules: {
      //   content: [
      //     { required: true, message: '请输入', trigger: 'blur' },
      //   ],
      // }
    };
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    dialogVisible(val) {
      if (val) return;
      this.$emit("update:modelVisible", val);
    },
  },
  computed: {
    searchParmas() {
      let { id } = this.data;
      return {
        linkDetailId: id,
        pageNum: 1,
        pageSize: 50,
      };
    },
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.ruleForm.content = this.data.linkNotes || "";
        this.ruleForm.id = this.data.notesId || "";
        this.$refs["ruleForm"].clearValidate();
      });
      this.getList();
    },
    getList() {
      this.loading = true;
      this.$http
        .get(this.api.walmart.getNotes, { params: this.searchParmas })
        .then(({ data }) => {
          this.tableData = data.list || [];
          this.total = data.total || 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 页码切换事件
    handleSizeChange(val) {
      this.searchParmas.pageNum = 1;
      this.searchParmas.pageSize = val;
      this.getList();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      this.searchParmas.pageNum = val;
      this.getList();
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return false;
        let [data, ruleForm] = [this.data, this.ruleForm];
        if (data.linkNotes === ruleForm.content) {
          this.$message.warning("内容没有变更~");
          return false;
        }
        let temp = Object.assign({ linkDetailId: data.id }, ruleForm);
        this.subLoading = true;
        this.$http
          .post(this.api.walmart.saveNotes, this.$common.removeEmpty(temp))
          .then((res) => {
            this.$message.success("操作成功~");
            this.dialogVisible = false;
            this.$emit("search");
          })
          .finally(() => {
            this.subLoading = false;
          });
      });
    },
  },
};
</script>
<style lang="scss">
// .remarksPage {}
</style>