<template>
  <div class="breadcrumb">
    <el-breadcrumb v-if="levelList.length" class="app-breadcrumb" separator="/">
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in levelList" :key="index + item.id">
          <!-- <span v-if="item.redirect === 'noRedirect' || index == levelList.length - 1" class="no-redirect">{{
            item.meta.otitle
            || item.meta.title
          }}</span>
          <a v-else class="has-redirect" @click.prevent="handleLink(item)">{{ item.meta.title }}</a> -->
          <span :class="item.childList && item.childList.length ? 'has-redirect' : 'no-redirect'">
            {{ item.name }}
          </span>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </div>
</template>

<script>
// import { mapGetters } from "vuex";
export default {
  data() {
    return {
      levelList: [],
    };
  },
  watch: {
    $route: {//监听路由
      handler(val, oldval) {
        this.getBreadcrumb();
      },
      deep: true
    },
  },
  created() {
    this.getBreadcrumb();
  },
  methods: {
    getBreadcrumb() {
      let menuTree = this.$store.getters['menuTree'] || [];
      let path = this.$route.path;
      if (!path) return;
      let fun = (menu) => {
        let data = null;
        menu.forEach(k => {
          if (k.url === path) {
            data = k;
          } else {
            let result = fun(k.childList || []);
            if (result) data = [k, ...result];
          }
        })
        if (!data) return;
        return Array.isArray(data) ? data : [data];
      }
      let list = fun(menuTree);
      this.levelList = list;
      // let matched = this.$route.matched.filter((item) => {
      //   return item.meta && item.meta.title;
      // })
    },
    // handleLink(item) {
    //   const { url } = item;
    //   if (this.$route.path == url) return;//与当前路由重了
    //   this.$router.push(url);
    // },
  },
};
</script>

<style lang="scss" scoped>
.breadcrumb {
  background: #f3f3f3;
  padding: 0 10px;

  .app-breadcrumb.el-breadcrumb {
    font-size: 14px;
    line-height: 42px;

    .no-redirect {
      color: #483929;
      cursor: text;
    }

    .has-redirect {
      color: #999999;
    }
  }
}

/* 可以设置不同的进入和离开动画 */
.breadcrumb-enter-active {
  transition: opacity 0.4s ease;
}

.breadcrumb-leave-active {
  display: none;
}

.breadcrumb-enter,
.breadcrumb-leave-to {
  opacity: 0;
}
</style>
