import Vue from 'vue';
import Router from 'vue-router';
import routerPage from '@/router/routerPage';
import Layout from '@/layout';
import store from '@/store';

Vue.use(Router);
const router = new Router({
  mode: 'hash',
  base: '/',
  scrollBehavior: () => ({
    y: 0
  }),
  routes: [
    {
      path: '*',
      component: Layout
    },
    {
      path: '/',
      component: Layout,
      // 更改重定向(因为路由为动态配置)
      beforeEnter: (to, from, next) => {
        let defaultRedirect = null;
        const menuTree = store.getters['menuTree'];
        let hiddenPageList = store.state.permission.hiddenPageList || [];//需要隐藏的页面
        if (Array.isArray(menuTree)) {
          menuTree.forEach(mitem => {
            if (!(!defaultRedirect && mitem.childList && mitem.childList.length)) return;
            mitem.childList.forEach(mk => {
              if (defaultRedirect || hiddenPageList.includes(mk.url)) return;//过滤
              defaultRedirect = mk.url;
            })
          })
        }
        next(defaultRedirect || '/404');
      },
    },
    ...routerPage
  ]
})
export default router
