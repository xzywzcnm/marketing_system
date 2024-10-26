<template>
  <div class="layout">
    <el-container class="layout__container">
      <!-- 头部 -->
      <div class="headers">
        <headers />
      </div>

      <!-- 侧边栏 -->
      <div class="sidebars">
        <div class="sidebars-container scrollbar">
          <sidebar class="sidebars--over" />
        </div>
      </div>

      <!-- 内容 -->
      <div class="section">
        <div class="section__container">
          <div class="section__main--over">
            <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
            <noAccessView v-if="noAccess" />
            <nonExistView v-else-if="nonExist" />
            <app-main v-else />
          </div>
        </div>
      </div>
    </el-container>
  </div>
</template>

<script>
import { Headers, Sidebar, AppMain, Breadcrumb } from "./components";
import noAccessView from './components/403.vue'
import nonExistView from './components/404.vue'

export default {
  name: "LayouIndex",
  components: { Headers, Sidebar, AppMain, Breadcrumb, noAccessView, nonExistView },
  data() {
    return {};
  },
  computed: {
    loadingPage() {
      return this.$store.getters['routerModel/routerLoading'];
    },
    noAccess() {
      return this.$store.getters['noAccess'];
    },
    nonExist() {
      return this.$store.getters['nonExist'];
    }
  }
};
</script>

<style scoped lang="scss">
$headersHeight: 50px; //头部高度
$sidebarWidth: 240px; //侧边栏宽度
$fontSize: 14px; //总体字体大小

.layout {
  font-size: $fontSize;
  height: 100vh;

  // background: #f1f3f8;
  .layout__container,
  .section,
  .sidebars-container,
  .sidebars--over,
  .section__main--over {
    height: 100%;
    position: relative;
  }

  // 头部
  .headers {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: $headersHeight;
    z-index: 999;
  }

  // 侧边栏
  .sidebars {
    position: fixed;
    top: $headersHeight;
    left: 0;
    bottom: 0;
    width: $sidebarWidth;
    box-shadow: 1px 1px 5px 1px #ccc;
    z-index: 100;

    .sidebars-container {
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  // 内容
  .section {
    width: 100%;
    padding-top: $headersHeight;
    padding-left: $sidebarWidth;
  }

  .section__container {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .section__main--over {
    // min-width: 1100px;
    display: flex;
    flex-direction: column;
  }
}
</style>