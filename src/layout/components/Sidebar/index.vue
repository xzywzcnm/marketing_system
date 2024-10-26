<template>
  <div class="sidebar-container">
    <el-menu :default-active="activeMenu" :default-openeds="openedslist" :collapse="isCollapse" :unique-opened="false"
      :collapse-transition="true" mode="vertical">
      <!-- 菜单 -->
      <sidebar-item :menu-list.sync="newMenuTreeData" />
    </el-menu>
  </div>
</template>

<script>
import SidebarItem from "./SidebarItem";
export default {
  components: { SidebarItem },
  data() {
    return {
      isCollapse: false,
      // hiddenList: ['/strategy-application', '/online-detail', '/product-detail'],//不需要显示在侧边栏的路由
    }
  },
  computed: {
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // 如果设置路径，侧边栏将突出显示您设置的路径
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    menuTree() {
      let menuTree = this.$store.getters['menuTree'] || [];
      this.setHiddenRouter(menuTree);
      return menuTree;
    },
    // 默认展开全部侧边栏
    openedslist() {
      return this.newMenuTreeData.map((k) => {
        return k.path || k.id;
      });
    },
    newMenuTreeData() {
      return this.menuTreeHand(this.$common.copy(this.menuTree));
    },
  },
  watch: {},
  created() { },
  methods: {
    menuTreeHand(arr, newArr = []) {
      arr.forEach(item => {
        typeof item.url !== 'undefined' && (item.path = item.url);
        if (item.childList) {
          item.children = item.childList;
          this.menuTreeHand(item.children, newArr);
        }
      })
      return arr;
    },
    // 处理不显示在侧边栏的路由
    setHiddenRouter(list) {
      let hiddenPageList = this.$store.state.permission.hiddenPageList || [];
      list.forEach(k => {
        hiddenPageList.includes(k.url) ? k.hidden = true : '';
        k.childList && k.childList.length ? this.setHiddenRouter(k.childList) : '';
      })
    }
  }
};
</script>
<style lang="scss">
.sidebar-container {

  &,
  .el-menu {
    background: #183360;
  }

  .el-menu {
    border-right: none;
  }

  .el-menu-item {
    height: 40px;
    line-height: 40px;
    color: #fff;
    font-size: 14px;

    &:hover,
    &:focus {
      background: #162746;
    }

    padding: 0 20px 0 42px;
  }

  .el-submenu__title {
    height: 50px;
    line-height: 50px;
    color: #fff;
    font-size: 16px;

    &:hover {
      background: #162746;
    }

    &>i {
      color: #fff;
    }
  }

  .el-menu-item.is-active {
    background: #0c1526;
  }
}
</style>
