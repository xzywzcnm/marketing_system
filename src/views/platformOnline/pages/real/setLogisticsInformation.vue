<template>
  <div class="dialog-content">
    <el-dialog title="修改物流信息" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false"
      class="setWarehousePage form-search">
      <el-form ref="ruleForm" :model="formData" :rules="rules" label-width="100px" class="formWidth300">
        <el-form-item label="修改选择:" prop="typeList">
          <el-checkbox-group v-model="formData.typeList">
            <el-checkbox :label="1">处理时间</el-checkbox>
            <el-checkbox :label="2">运输组</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="处理时间:" prop="newHandlingTime" v-if="formData.typeList.includes(1)">
          <el-input v-model="formData.newHandlingTime" placeholder="请输入">
            <span slot="suffix">天</span>
          </el-input>
        </el-form-item>
        <el-form-item label="运输组:" prop="newShippingGroupId" v-if="formData.typeList.includes(2)">
          <dyt-select v-model="formData.newShippingGroupId">
            <el-option v-for="(item, index) in transportGroupList" :key="index" :label="item.name"
              :value="item.shippingGroupId" />
          </dyt-select>
          <div style="color: #F56C6C;" v-if="diffStore">批量修改运输组只允许同时操作同一店铺链接</div>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <span class="mr10">
          此次执行的链接条数
          <span style="color: #F56C6C; padding: 0 4px">{{ len || 0 }}</span>
          条
        </span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirmHandle()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import regular from "@/utils/regular.js";
export default {
  name: "setLogisticsInformation",
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
    len: {
      type: String | Number,
      default() {
        return 0;
      },
    },
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      formData: {
        typeList: [],
        newHandlingTime: '',
        newShippingGroupId: '',
      },
      rules: {
        typeList: [
          { required: true, message: "请选择", trigger: "change" },
        ],
        newHandlingTime: [
          { required: true, message: "请输入", trigger: "blur" },
          { required: true, validator: this.validateInventory, trigger: 'blur' },
        ],
        newShippingGroupId: [
          { required: true, message: "请选择", trigger: "change" },
        ],
      },
      userWarehouseList: [],
      transportGroupList: [],
      diffStore: false,
      site: null,
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
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs["ruleForm"].resetFields();
      });
      this.transportGroupList = [];
      let data = this.data;
      let list = data.list || [];
      if (list.length) {
        this.site = list[0].site;
        let storeList = this.$common.arrayToObjList(list, 'commonStoreId');
        this.diffStore = !(Object.keys(storeList).length == 1);
        if (!this.diffStore) this.getTransportGroupList(list[0].commonStoreId);
      } else {
        this.site = data.realStoreLinkQO.site;
        this.returnStoreIDList(data.realStoreLinkQO).then((commonStoreIdList) => {
          this.diffStore = !(commonStoreIdList.length == 1);
          if (!this.diffStore) this.getTransportGroupList(commonStoreIdList[0]);
        })
      }
    },
    // 根据店铺获取运输组
    getTransportGroupList(commonStoreId) {
      this.$store.dispatch("real/getTransportGroupList", { commonStoreId }).then((list) => {
        this.transportGroupList = list[this.site] || [];
      });
    },
    returnStoreIDList(data) {
      return new Promise(resolve => {
        this.$http.post(this.api.real.countUpdateLinksStoreNum, data).then(({ data }) => {
          resolve(data || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    confirmHandle() {
      this.$refs["ruleForm"].validate((valid) => {
        if (!valid) return;
        let data = this.data;
        let formData = this.formData;
        let temp = {};
        if (formData.typeList.includes(1)) {
          temp.newHandlingTime = formData.newHandlingTime;
        }
        if (formData.typeList.includes(2)) {
          temp.newShippingGroupId = formData.newShippingGroupId;
        }
        let list = data.list || [];
        if (list.length) {
          temp.linkIdList = list.map(k => k.id);
        } else {
          temp.realStoreLinkQO = data.realStoreLinkQO;
        }
        this.loading = true;
        this.$http.post(this.api.real.batchUpdateLinks, temp)
          .then((res) => {
            this.$message.success("操作成功~");
            this.dialogVisible = false;
            this.$emit('search');
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    // 验证库存
    validateInventory(rule, value, callback) {
      if (["", undefined, null].includes(value)) {
        callback(new Error("请输入内容"));
        return;
      }
      if (!regular.integerZero.test(value)) {
        callback(new Error("大于等于0的整数"));
        return;
      }
      callback();
    },

  },
};
</script>