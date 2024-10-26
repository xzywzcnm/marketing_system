<template>
  <div class="dialog-content">
    <el-dialog title="人工匹配商品" :visible.sync="dialogVisible" :close-on-click-modal="false" width="1200px"
      class="matchProductPage">
      <div class="content displayFlex">
        <el-card shadow="never" class="mb10">
          <div class="displayFlex alignItemCenter spaceBetween">
            <div class="displayFlex">
              <span>已选择：</span>
              <div class="flexOne skuList">
                <span v-for="(item, index) in chooseItem" :key="index">
                  {{ item.erpSku || item.sku }}
                </span>
              </div>
            </div>
            <div>
              <el-button type="primary" @click="confirmHandle" :loading="saveLoading">保存</el-button>
              <el-button @click="dialogVisible = false">返回</el-button>
            </div>
          </div>
        </el-card>

        <el-form :inline="true" :model="searchOptions" label-width="80px" class="formb0" ref="searchForm">
          <el-form-item label="搜索字符:" prop="searchValue">
            <el-input v-model="searchOptions.searchValue" clearable placeholder="SPU、SKU、商品名称"></el-input>
          </el-form-item>
          <el-form-item label="" label-width="0" prop="fuzzySearch">
            <el-button type="primary" @click="search">查询</el-button>
            <el-checkbox v-model="searchOptions.fuzzySearch" :true-label="1" :false-label="0"
              class="ml10">模糊搜索</el-checkbox>
          </el-form-item>
        </el-form>

        <el-tabs v-model="activeName" @tab-click="handleClick" class="mb20 tabsChange">
          <el-tab-pane label="普通商品" name="firstInfo"></el-tab-pane>
          <el-tab-pane label="映射商品" name="secondInfo"></el-tab-pane>
        </el-tabs>

        <div class="flexOne">
          <!-- 普通商品 -->
          <div class="displayFlex primaryGood" v-show="activeName == 'firstInfo'">
            <div class="menuList scrollBar">
              <div class="menuList_con">
                <el-menu :collapse-transition="true" :default-openeds="openedslist" @select="handleSelect" ref="elMenu">
                  <categorySidebar :menu-list.sync="categoryTree" />
                </el-menu>
              </div>
            </div>
            <div class="flexOne page-main">
              <div class="mainContent">
                <div class="tableWrap table-maxheight">
                  <el-table :data="firstInfo.tableData" border height="100%" :class="searchClass"
                    v-loading="firstInfo.loading" highlight-current-row ref="firstTable">
                    <el-table-column fixed="left" label="操作" width="100" align="center">
                      <template slot-scope="scope">
                        <el-button @click="chooseSku(scope.row)" type="text" size="small">选择</el-button>
                      </template>
                    </el-table-column>
                    <el-table-column prop="erpSpu" label="SPU" align="center" width="120">
                    </el-table-column>
                    <el-table-column prop="goodsImageMap" label="商品图片" width="90" align="center">
                      <template slot-scope="{ row }">
                        <preview-image :url="row.pictureUrlQuikly" :file-list="[row.pictureUrl]" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="erpSku" label="SKU" width="120" align="center">
                    </el-table-column>
                    <el-table-column prop="productGoodsSpecifications" label="SKU属性" width="120" align="center">
                    </el-table-column>
                    <el-table-column prop="cnName" label="商品中文名称" min-width="120" align="center">
                    </el-table-column>
                    <el-table-column prop="weight" label="重量(g)" width="90" align="center">
                    </el-table-column>
                  </el-table>
                </div>
                <div class="pageBox">
                  <el-pagination :current-page="firstInfo.pageOptions.pageNum" :page-sizes="Globalsize"
                    :page-size="firstInfo.pageOptions.pageSize" layout="total, sizes, prev, pager, next, jumper"
                    :total="firstInfo.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                </div>
              </div>
            </div>
          </div>
          <!-- 映射商品 -->
          <div class="page-main" v-show="activeName == 'secondInfo'">
            <div class="mainContent">
              <div class="tableWrap table-maxheight">
                <el-table :data="secondInfo.tableData" border height="100%" :class="searchClass"
                  v-loading="secondInfo.loading" highlight-current-row ref="secondTable">
                  <el-table-column fixed="left" label="操作" width="120" align="center">
                    <template slot-scope="scope">
                      <el-button @click="chooseSku(scope.row)" type="text" size="small">选择</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column prop="sku" label="映射商品编码" align="center">
                  </el-table-column>
                  <el-table-column prop="name" label="映射商品名称" align="center" min-width="120">
                  </el-table-column>
                  <el-table-column prop="erpSkuWithQuantity" label="映射商品" align="center">
                  </el-table-column>
                </el-table>
              </div>
              <div class="pageBox">
                <el-pagination :current-page="secondInfo.pageOptions.pageNum" :page-sizes="Globalsize"
                  :page-size="secondInfo.pageOptions.pageSize" layout="total, sizes, prev, pager, next, jumper"
                  :total="secondInfo.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const info = {
  pageOptions: {
    pageNum: 1,
    pageSize: 10,
  },
  tableData: [],
  total: 0,
  loading: false,
  searchStatus: false, //是否请求过
};
import FetchFun from "@/utils/listPage";
import previewImage from "@/components/previewImage";
import categorySidebar from "@/views/components/categorySidebar";
export default {
  name: "matchProduct",
  components: { previewImage, categorySidebar },
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
      activeName: "firstInfo",
      dialogVisible: false, //组件弹框
      searchOptions: {
        searchValue: "",
        fuzzySearch: 0,
      },
      firstInfo: this.$common.copy(info),
      secondInfo: this.$common.copy(info),
      chooseItem: [], //选中的Sku
      // 分类树
      categoryTree: [
        {
          name: "全部分类",
          productCategoryId: "all",
          children: {},
        },
      ],
      openedslist: [],
      saveLoading: false,
      productCategoryId: null,
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
    searchClass() {
      const name = this.activeName;
      if (this[name].loading) return "";
      if (this[name].searchStatus) {
        return !this[name].tableData.length && "nolength";
      } else {
        return "nosearch";
      }
    },
  },
  methods: {
    reset() {
      this.chooseItem = [];
      this.firstInfo = this.$common.copy(info);
      this.secondInfo = this.$common.copy(info);
      this.productCategoryId = "";
      this.openedslist = [];
      this.activeName = "firstInfo";
    },
    open() {
      this.reset();
      this.dialogVisible = true;
      // this.search();
      this.getCategoryList();
      this.$nextTick(() => {
        this.$refs.searchForm.resetFields();
        this.$refs.elMenu.activeIndex = null;
      });
    },
    getCategoryList() {
      this.$store.dispatch("platformList/getCategoryList").then((list) => {
        this.categoryTree[0].children = list;
        // let fun = (itemList) => {
        //   let [childList, parentList] = [[], []];
        //   (itemList || []).forEach((k) => {
        //     childList.push(...fun(k.children));
        //     k.productCategoryId && parentList.push(k.productCategoryId);
        //   });
        //   return [...parentList, ...childList];
        // };
        // this.openedslist = fun(this.categoryTree);
        this.openedslist = ["all"];
      });
    },
    // 页码切换事件
    handleSizeChange(val) {
      this[this.activeName].pageOptions.pageNum = 1;
      this[this.activeName].pageOptions.pageSize = val;
      this.getList();
    },
    // 页数切换事件
    handleCurrentChange(val) {
      this[this.activeName].pageOptions.pageNum = val;
      this.getList();
    },
    search() {
      this[this.activeName].pageOptions.pageNum = 1;
      this.getList();
    },
    getList() {
      const activeName = this.activeName;
      let temp = Object.assign(
        {},
        this.searchOptions,
        this[activeName].pageOptions
      );
      let api = null;
      if (activeName === "firstInfo") {
        api = "productGoodsQuery";
        let id = this.productCategoryId;
        id && (temp.productCategoryIdList = [id]);
      } else {
        api = "skuMappingQuery";
      }
      temp = this.$common.removeEmpty(temp);

      let reqParams = FetchFun.returnSearchOptions(temp, "post");
      let mapi = this.api.common[api] + reqParams.params;
      this[activeName].loading = true;
      this.$http
        .post(mapi, reqParams.data)
        .then(({ data }) => {
          this[activeName].tableData = data.list || [];
          this[activeName].total = data.total || 0;
          if (activeName === "firstInfo") {
            this[activeName].tableData = this[activeName].tableData.map((k) => {
              k.pictureUrlQuikly = this.$common.handleSmallPicture(
                k.pictureUrl
              );
              return k;
            });
            this.$refs.firstTable.doLayout();
          } else {
            // 对 Table 进行重新布局。当 Table 或其祖先元素由隐藏切换为显示时，可能需要调用此方法
            this.$refs.secondTable.doLayout();
          }
        })
        .finally(() => {
          this[activeName].searchStatus = true;
          this[activeName].loading = false;
        });
    },
    // 确认修改
    confirmHandle() {
      if (!this.chooseItem.length) {
        this.$message.error("请选择sku！");
        return;
      }
      let temp = {};
      let flag = this.activeName === "firstInfo";
      let item = this.chooseItem[0];
      // 类型type: 0：普通商品，1：映射商品
      if (flag) {
        temp.type = 0;
        temp.sku = item.erpSku;
        temp.spu = item.erpSpu;
      } else {
        temp.type = 1;
        temp.sku = item.sku;
      }
      temp.linkDetailId = this.data.linkDetailId;
      this.saveLoading = true;
      this.$http
        .post(this.api.otto.updateProductLinkRel, temp)
        .then(({ data }) => {
          this.$message.success("操作成功!");
          this.dialogVisible = false;
          this.$nextTick(() => {
            this.$emit("search");
          });
        })
        .finally(() => {
          this.saveLoading = false;
        });
    },
    handleClick() {
      // this.getList();
    },
    chooseSku(row) {
      this.chooseItem = [row];
    },
    handleSelect(row) {
      this.productCategoryId = row;
      this.getList();
    },
  },
};
</script>
<style lang="scss">
.matchProductPage {
  .el-dialog__body {
    height: 80vh;
  }

  .tabsChange.el-tabs {
    margin: 0 0 10px 0 !important;
    flex: none !important;

    .el-tabs__nav-scroll {
      display: flex;
      justify-content: flex-end;
    }
  }

  .flexOne {
    flex: 1;
    overflow: hidden;
  }

  .skuList {
    span:not(:last-child) {
      margin-right: 8px;
    }
  }

  .content {
    height: 100%;
    flex-direction: column;
  }

  .menuList {
    width: 300px;
    margin-right: 10px;
    border: 1px solid #ebeef5;
    overflow: auto;

    .el-menu {
      border-right: 0;
    }

    .menuList_con {
      margin: 0 -10px;
    }

    .el-menu-item,
    .el-submenu__title {
      height: 34px;
      line-height: 34px;
    }
  }

  .scrollBar {
    &::-webkit-scrollbar {
      width: 10px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #e4e7ed;
    }
  }

  .primaryGood {
    height: 100%;
  }
}
</style>
