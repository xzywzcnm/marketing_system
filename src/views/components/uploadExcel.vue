<template>
  <div class="dialog-content">
    <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="600px"
      class="uploadExcelPage">
      <div class="content">
        <el-form label-width="120px" class="formb0">
          <el-form-item label="选择导入文件:">
            <div class="displayFlex">
              <div class="flexOne">
                <el-upload action="#" :http-request="httpRequest" :before-upload="beforeAvatarUpload"
                  :show-file-list="false">
                  <el-button size="small" type="primary">选择文件</el-button>
                </el-upload>
              </div>
              <div class="underline primaryColor donwLoad" @click="downloadTemplate">
                下载模板
              </div>
            </div>
          </el-form-item>
          <el-form-item label="" class="mt10">
            <div class="displayFlex alignItemCenter" v-for="(item, index) in this.fileList" :key="index">
              <span class="el-icon-document mr10"></span>
              {{ item.name }}
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmUpload" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "uploadExcel",
  props: {
    title: {
      type: String,
      default: null,
    },
    accept: {
      type: String,
      default: 'file',
    },
    modelVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false, //组件弹框
      loading: false,
      fileList: [],
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
  methods: {
    open() {
      this.fileList = [];
      this.dialogVisible = true;
    },
    // 自定义上传
    httpRequest(data) {
      this.fileList = [data.file];
    },
    // 确认上传
    confirmUpload() {
      let list = this.fileList;
      if (!list.length) {
        this.$message.error("请先上传文件!");
        return false;
      }
      let formData = new FormData();
      formData.append(this.accept, list[0]);
      this.loading = true;
      this.$emit("handleUpload", {
        data: formData,
        fun: (result) => {
          this.loading = false;
          result.valid && (this.dialogVisible = false);
        },
      });
    },
    // 上传前
    beforeAvatarUpload(file) {
      const format = ["xlsx", "xls", "xml"]; // 接受上传的文件类型
      let name =
        file.name && file.name.substring(file.name.lastIndexOf(".") + 1);
      const testFile = name.toLowerCase(); // 获取后缀
      if (!format.includes(testFile)) {
        this.$message.error(
          file.name + `文件格式不正确, 请选择${format.toString()}格式的文件~`
        );
        return false;
      }
    },
    // 下载模板(type:导入类型，0：otto导入商品关联)
    downloadTemplate() {
      this.$emit('downloadTemplate', (rqApi, rqType, rqData) => {
        this.$http[rqType](rqApi, rqData).then((res) => {
          if (res.status !== 200) return;
          if (!res.data) {
            this.$message.error("文件下载路径为空~");
            return;
          }
          window.open(res.data, "_blank");
        });
      })
    },
  },
};
</script>
<style lang="scss">
.uploadExcelPage {
  .flexOne {
    flex: 1;
    overflow: hidden;
  }

  .donwLoad {
    padding: 0 40px;
  }
}
</style>
