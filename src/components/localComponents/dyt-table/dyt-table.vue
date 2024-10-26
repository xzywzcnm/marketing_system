<template>
  <div class="dytTablePage page-main">
    <!-- 操作栏 -->
    <div class="operator-sort">
      <slot name="operatorLeft" />
      <div class="sort-main">
        <!-- 自定义列表 -->
        <div v-if="columnInfo.controlHead">
          <setTableColumns v-model="checkInfo.tableCheckList" :list="checkInfo.checkAllList"
            :option="columnInfo.option || {}" @change="columnChange" @hide="columnHide" @show="columnShow" />
        </div>

        <!-- 选择排序按钮 -->
        <dyt-sortBySelect class="sortButton-global" :sort-button-list="sortButtonList" :need-default-sort="false"
          @sortInfo="getSortInfoAndFetch(arguments)" />
      </div>
    </div>
    <div class="mainContent">
      <div class="tableWrap table-maxheight" :class="'tableParent' + tableID">
        <el-table :ref="'table' + tableID" v-loading="loading" :data="tableData" :class="searchClass"
          v-bind="elTableProps" v-on="$listeners" :key="randomString">
          <dytTableHead v-for="(col, index) in tableColumnList" :key="index" :column-config="col">
            <!-- 不带参数插槽 -->
            <template v-for="slot in slots" :slot="slot">
              <slot :name="slot" />
            </template>
            <!-- 带参数插槽 -->
            <template v-for="scopeSlots in scopedSlots" :slot="scopeSlots" slot-scope="scope">
              <slot :name="scopeSlots" v-bind="scope">
                {{ scope.row[col.prop] }}
              </slot>
            </template>
            <!-- 默认插槽 注意：当还存在子级时，默认插槽需要透传，不要写到此次-->
            <template v-if="!col.children || col.children === 0" slot-scope="scope">
              <slot v-bind="scope">
                {{ scope.row[col.prop] }}
              </slot>
            </template>
          </dytTableHead>
        </el-table>
      </div>

      <div class="pageBox">
        <el-pagination :current-page="searchParmas.pageNum" layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="Globalsize" :page-size="searchParmas.pageSize" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>
<script>
import FetchFun from "@/utils/listPage";
import dytTableHead from "./dyt-tableHead";
import setTableColumns from "./setTableColumns";
export default {
  name: "DytTable",
  components: { setTableColumns, dytTableHead },
  props: {
    tableProps: {
      type: Object,
      default: () => {
        return {};
      },
    },
    tableHead: {
      //表格列
      type: Array,
      default() {
        return [];
      },
    },
    tableSearch: {
      //查询数据
      type: Object,
      default() {
        return {
          // requestApi: '',//请求api
          // requestType: '',//请求类型
          // searchParmas: {},//请求参数
          // handleData: false,//处理数据
        };
      },
    },
    sortButtonList: {
      //排序
      type: Array,
      default() {
        return [];
      },
    },
    columnInfo: {
      //查询数据
      type: Object,
      default() {
        return {
          // controlHead: true,//是否动态控制表格头
          // platformCode: '',//平台
          // moduleCode: '',//模块名称（区分平台主子模块，表头动态接口需要）
        };
      },
    },
    tab: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      tableID: new Date().getTime() + (Math.random() * 100000).toFixed(0),
      defaultConfig: {
        height: "100%",
        border: true,
      },
      loading: false,
      tableData: [], //表格列表
      total: 0,
      searchStatus: false, //是否请求过
      searchParmas: {},
      checkInfo: {
        tableCheckList: [],
        checkAllList: [],
        defaultCheckList: [],
        ignoreCompare: false,
      },
      tableColumnList: [],
      userId: null,
      randomString: new Date().getTime().toString() + (Math.random() * 10000000),
    };
  },
  computed: {
    elTableProps() {
      return { ...this.defaultConfig, ...this.tableProps, ...this.$attrs };
    },
    // 插槽扁平化
    slotList() {
      let fun = (list) => {
        let arr = [];
        list.forEach((k) => {
          k.slot && arr.push(k);
          if (k.children && k.children.length) arr.push(fun(k.children));
        });
        return arr;
      };
      let list = fun(this.tableColumnList).flat(Infinity);
      return list;
    },
    searchClass() {
      if (this.loading) return "";
      if (this.searchStatus) {
        return !this.tableData.length && "nolength";
      } else {
        return "nosearch";
      }
    },
    slots() {
      return Object.keys(this.$slots);
    },
    scopedSlots() {
      return Object.keys(this.$scopedSlots);
    },
  },
  watch: {
    tableColumnList: {
      handler(val, oval) {
        let dom = this.$refs["table" + this.tableID];
        if (!dom || JSON.stringify(val) === JSON.stringify(oval)) return;
        this.$nextTick(() => {
          dom.doLayout();
          this.setEmptyTextTop();
        });
      },
      deep: true,
    },
    tableSearch: {
      handler(val) {
        if (JSON.stringify(val) === "{}") return new Error("组件传参格式错误!");
        this.searchParmas = this.$common.copy(val.searchParmas || {});
      },
      deep: true,
      immediate: true,
    },
    tableHead: {
      handler(val) {
        let list = val || [];
        this.getCheckList(list);
      },
      deep: true,
      immediate: true,
    },
    columnInfo: {
      handler(val) {
        if (val.controlHead) return this.getCloumnList();
        this.$nextTick(() => {
          let list = this.checkInfo.checkAllList.map((k) => k.value);
          this.checkInfo.tableCheckList = list; // 表格选中列
          this.columnChange(list);
        });
      },
      deep: true,
      immediate: true,
    },
    tab: {
      handler() {
        this.$nextTick(() => {
          this.setEmptyTextTop();
        });
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    window.addEventListener("resize", this.setEmptyTextTop);
    this.$once("hook:beforeDestory", this.setEmptyTextTop);
    if (this.tab) return;
    this.$nextTick(() => {
      this.setEmptyTextTop();
    });
  },
  methods: {
    // 获取选中的表头列表
    getCloumnList() {
      let { moduleCode, platformCode } = this.columnInfo;
      if (!(moduleCode && platformCode)) return;
      try {
        this.userId = this.$store.state.user.userInfo.userId;
      } catch (err) {
        throw new Error(err);
      }
      if (this.$common.isEmpty(this.api[platformCode].queryContentDisplay)) {
        console.error(
          `组件 dyt-table 属性 column-info 中设置了 controlHead 为 true，无法获取到对应的 platformCode API， 请检查 column-info 和 API 文件中的 API 设置`
        );
        return;
      }
      this.$http
        .get(this.api[platformCode].queryContentDisplay, {
          params: { moduleCode, userId: this.userId },
        })
        .then(({ data }) => {
          let fixAllList = this.checkInfo.checkAllList.map((k) => k.value);
          let [ignoreCompare, tableCheckList] = [false, []];
          // 默认勾选全部
          if (!data.length) {
            tableCheckList = fixAllList;
            ignoreCompare = true;
            // 初始时忽略比较
          } else {
            let trendsAllList = data.map((k) => k.columnCode);
            // 新增表头默认勾选上
            let addColumnList = [];
            fixAllList.forEach((k) => {
              !trendsAllList.includes(k) && addColumnList.push(k);
            });
            let checkList = data
              .filter((k) => k.status === 0)
              .map((k) => k.columnCode);
            tableCheckList = [...checkList, ...addColumnList];
            ignoreCompare = !!addColumnList.length;
          }
          this.checkInfo.tableCheckList = tableCheckList; // 表格选中列
          this.checkInfo.ignoreCompare = ignoreCompare; // 初始或者新增表头时忽略比较
          this.columnChange(tableCheckList);
        });
    },
    // 设置表格背景位置
    setEmptyTextTop() {
      let dom = document.querySelector(".tableParent" + this.tableID);
      if (!dom) return;
      let headDom = dom.querySelector(".el-table__header-wrapper");
      let emptyDom = dom.querySelector(".el-table__empty-text");
      if (!(emptyDom && headDom)) return;
      emptyDom.style.top = headDom.offsetHeight + "px";
    },
    // 所有表头列
    getCheckList(list) {
      let data = this.$common.copy(list);
      this.checkInfo.checkAllList = data
        .filter((k) => k.label && !k.checkHide)
        .map((k) => {
          return { label: k.label, value: k.label };
        });
    },
    search() {
      this.searchParmas.pageNum = 1;
      this.getList();
    },
    // 获取列表
    getList() {
      let tableSearch = this.tableSearch;
      // if (FetchFun.validateForm(searchParmas)) return false;
      let reqParams = FetchFun.returnSearchOptions(
        this.searchParmas,
        tableSearch.requestType
      );
      let mapi = tableSearch.requestApi + reqParams.params;
      this.loading = true;
      this.$http[tableSearch.requestType](mapi, reqParams.data)
        .then(({ data }) => {
          let list = data.list || [];
          this.total = data.total || 0;
          !tableSearch.handleData && (this.tableData = list);
          this.$emit("getAllData", {
            list,
            total: this.total,
            returnData: (reList) => {
              this.tableData = reList;
            },
          });
        })
        .finally(() => {
          this.searchStatus = true;
          this.loading = false;
        });
    },
    // 多选操作
    // handleSelectionChange(arr) {
    //   this.$emit('selection-change', arr);
    // },
    // 页码切换事件
    handleSizeChange(val) {
      // if (FetchFun.validateForm(this.searchParmas)) return false;
      this.searchParmas.pageNum = 1;
      this.searchParmas.pageSize = val;
      this.getList();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      // if (FetchFun.validateForm(this.searchParmas)) return false;
      this.searchParmas.pageNum = val;
      this.getList();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.$emit("getSortInfoAndFetch", Info);
      let tableSearch = this.tableSearch;
      this.searchParmas.sortType = Info[0] || tableSearch.sortType;
      this.searchParmas.sortField = Info[1] || tableSearch.sortField;
      this.search();
    },
    // 表头变化
    columnChange(e) {
      this.tableColumnList = [];
      let list = this.tableHead.filter((k) => {
        k.key = (k.key || k.porp || k.slot || k.type) + this.randomString;
        return k.checkHide || e.includes(k.label);
      });
      this.$nextTick(() => {
        this.tableColumnList = list;
      });
    },
    // 面板展示保存上一次的值
    columnShow() {
      this.checkInfo.defaultCheckList = this.$common.copy(
        this.checkInfo.tableCheckList
      );
    },
    // 面板隐藏保存修改值
    columnHide() {
      let { defaultCheckList, tableCheckList, ignoreCompare, checkAllList } =
        this.$common.copy(this.checkInfo);
      let dList = defaultCheckList.sort((a, b) => {
        return a.localeCompare(b);
      });
      let tList = tableCheckList.sort((a, b) => {
        return a.localeCompare(b);
      });
      this.$nextTick(() => {
        this.$refs["table" + this.tableID].doLayout();
      });
      // 比较是否有变化
      if (!ignoreCompare && JSON.stringify(dList) === JSON.stringify(tList))
        return;

      let { moduleCode, platformCode } = this.columnInfo;
      let list = [];
      let userId = this.userId;
      let fixAllList = checkAllList.map((k) => k.value);
      fixAllList.forEach((k) => {
        list.push({
          userId: userId,
          moduleCode: moduleCode,
          columnCode: k,
          status: tableCheckList.includes(k) ? 0 : 1,
        });
      });
      let mapi = `${this.api[platformCode].updateContentDisplay}?moduleCode=${moduleCode}&userId=${userId}`;
      this.$http({
        method: "post",
        url: mapi,
        data: list,
        ignoreMessage: true, //忽略报错
      }).then(() => {
        this.checkInfo.ignoreCompare = false;
      });
    },
  },
};
</script>
<style lang="scss">
.dytTablePage {
  .sort-main {
    display: flex;
    align-items: center;
  }

  .el-table {
    display: flex;
    flex-direction: column;

    .el-table__body-wrapper {
      flex: 1 1 0%;
    }
  }
}
</style>