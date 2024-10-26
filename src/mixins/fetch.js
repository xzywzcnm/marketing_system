/*
 * @Author: Jaycee
 * @Date: 2021-09-29 10:01:10
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-26 14:57:28
 */
import Qs from "qs";
import FetchFun from '@/utils/listPage';
export default {
  data() {
    return {
      // 列表数据加载中
      loading: false,
      // 列表数据总条数
      total: 0,
      // 列表数据
      tableData: [],
      // 列表数据勾选项
      multipleSelection: [],
      // 缓存搜索参数
      // cacheOptions: {},
      // 列表api
      mapi: "",
      // api请求方式
      apiType: "get",
      isShow: false, //高级搜索标记
      // timeFormat: {}, //需要处理的时间格式
      colSpan: 6, //查询表单控制宽度
      // 是否展开高级搜索
      isExpand: false,
      searchStatus: 1, //1 请输入查询条件；3 查询为空
      pageLoading: false, //页面加载框
      searchOptions: {}, //表单查询条件
      hideFormdata: [], //这里是解决非表单展示条件查询，让非空条件查询过滤这个条件
      resetOption: {}, //重置条件是有些情况是非空或非数组的，可以放到这里
      arraySearch: {}, //有些表单查询条件需要额外转换，可以放到这里
      resetArray: {}, //重置额外表单条件是有些情况是非空或非数组的，可以放到这里
      isneedValidateForm: true
    };
  },
  computed: {
    searchClass() {
      let str = "";
      let searchStatus = this.searchStatus;
      let loading = this.loading;
      !loading && searchStatus == 1 ? (str = "nosearch") : "";
      !loading && searchStatus == 3 ? (str = "nolength") : "";
      return str;
    }
  },
  created() { },
  methods: {
    // 加载列表数据
    fetch(mapi, type) {
      // 清空
      this.multipleSelection = [];

      // 这里是常规表格列表，每次搜索搜索之后都清空之前勾选的数据
      if (this.$refs.table) {
        this.$refs.table.clearSelection();
      }

      // 列表加载传入api接口
      if (mapi) {
        this.mapi = mapi;
      }

      // 列表加载传入请求方式
      if (type) {
        this.apiType = type;
      }

      if (!(this.mapi && this.apiType)) {
        return Promise.reject(new Error("api和apiType必传"));
      }

      // 打开loading
      this.loading = true;

      // 获取请求参数
      let reqParams = this.$common.removeEmpty(this.searchOptions);

      // 将空字符串置空
      Object.keys(reqParams).forEach(params => {
        if (reqParams[params] === "") reqParams[params] = null;
      });

      // 根据不同请求方式发起请求
      if (this.apiType === "post") {
        return this.requestPost(this.mapi, reqParams);
      }

      return this.requestGet(this.mapi, reqParams);
    },
    // get请求
    requestGet(mapi, reqParams) {
      return (
        this.$http
          // .get(mapi + "?" + Qs.stringify(reqParams))
          .get(mapi, { params: reqParams })
          .then(res => {
            this.returnDate(res);
          })
          .finally(() => {
            this.loading = false;
          })
      );
    },
    // post请求
    requestPost(mapi, paramsData) {
      let params = {};
      let data = {};
      Object.keys(paramsData).forEach(key => {
        var array = ["pageNum", "pageSize", "sortField", "sortType"];
        if (!~array.indexOf(key)) {
          data[key] = paramsData[key];
        } else {
          params[key] = paramsData[key];
        }
      });
      return this.$http
        .post(mapi + "?" + Qs.stringify(params), data)
        .then(res => {
          this.returnDate(res);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 返回数据
    returnDate(res) {
      if (res.status === 200 && res.data) {
        this.tableData = res.data.list || [];
        this.total = res.data.total;
        this.searchStatus = !this.tableData.length ? 3 : 1;
        // 对 Table 进行重新布局
        this.$nextTick(() => {
          // 这里是常规表格列表，每次都重新布局
          if (this.$refs.table) {
            this.$refs.table.doLayout();
            this.$refs.table.bodyWrapper.scrollTop = 0;
          }
        });
      }
    },
    // // 检验搜索条件是否加上(通过比较值的改动来判断是不是输入条件)
    // validateForm() {
    //   let [normalObj, nowsearchObj] = [{}, {}]; //normalObj 表单查询初始条件  nowsearchObj 表单查询条件
    //   Object.keys(this.searchOptions).forEach(key => {
    //     var array = ["pageNum", "pageSize", "sortField", "sortType"];
    //     if (!~array.indexOf(key)) {
    //       let search = this.searchOptions[key];
    //       nowsearchObj[key] = search;
    //       let resetOption = this.resetOption; //重置条件配置(有些默认值非空字符串非空数组)
    //       let nullArr = ["", null, undefined, -99, "-99"]; //筛空字符串或全部
    //       if (resetOption && key in resetOption) {
    //         if (
    //           this.hideFormdata.includes(key) ||
    //           nullArr.includes(resetOption[key])
    //         ) {
    //           normalObj[key] = resetOption[key];
    //           return;
    //         }
    //       }
    //       if (Array.isArray(search)) {
    //         normalObj[key] = [];
    //         return;
    //       }
    //       normalObj[key] = "";
    //     }
    //   });
    //   return JSON.stringify(normalObj) === JSON.stringify(nowsearchObj);
    // },
    // 搜索
    search(shieldMessage) {
      // if (FetchFun.validateForm(_self.searchOptions)) return false;
      if (this.isneedValidateForm && FetchFun.validateForm(this.searchOptions, undefined, undefined, true)) {
        !shieldMessage && this.$message.warning("请输入条件查询~");
        return;
      }
      this.searchOptions.pageNum = 1;
      this.fetch();
    },
    // 多选操作
    handleSelectionChange(arr) {
      this.multipleSelection = this.$common.copy(arr);
    },
    // 字段排序事件
    sortMethod(value) {
      if (value.order) {
        this.searchOptions.sortField = value.prop;
        this.searchOptions.sortType =
          value.order == "ascending" ? "ASC" : "DESC";
      } else {
        this.searchOptions.sortField = "";
        this.searchOptions.sortType = "";
      }
      this.fetch();
    },
    // 组件回传监听
    watchOperation() {
      this.fetch();
    },
    // 页码切换事件
    handleSizeChange(val) {
      if (FetchFun.validateForm(this.searchOptions)) return;
      this.searchOptions.pageNum = 1;
      this.searchOptions.pageSize = val;
      this.fetch();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      if (FetchFun.validateForm(this.searchOptions)) return;
      // if (this.validateForm()) return;
      this.searchOptions.pageNum = val;
      this.fetch();
    },
    // 重置
    reset() {
      // 这里是表单查询
      Object.keys(this.searchOptions).forEach(key => {
        var array = ["pageNum", "pageSize", "sortField", "sortType"];
        if (!~array.indexOf(key)) {
          let search = this.searchOptions[key];
          let resetOption = this.resetOption; //重置条件配置
          if (resetOption && key in resetOption) {
            this.searchOptions[key] = resetOption[key];
            return;
          }
          if (Array.isArray(search)) {
            this.searchOptions[key] = [];
            return;
          }
          this.searchOptions[key] = "";
        }
      });
      // 这里是表单中不能直接传给后端的中间表单字段,比如看多个查询的例子
      Object.keys(this.arraySearch).forEach(key => {
        let search = this.arraySearch[key];
        let resetArray = this.resetArray; //重置条件配置
        if (resetArray && key in resetArray) {
          this.arraySearch[key] = resetArray[key];
          return;
        }
        if (Array.isArray(search)) {
          this.arraySearch[key] = [];
          return;
        }
        this.arraySearch[key] = "";
      });
    },
    // 展开或收起
    expand(val) {
      this.isExpand = val.isExpand;
    },
    // 搜索栏按钮处理
    filterBtn(type) {
      type == "submit" && this.search(); // 搜索
      type == "refresh" && this.reset(); // 重置
    },
    // 宽度或高度改变时,返回占位宽高
    widthChange(val) { }
  }
};
