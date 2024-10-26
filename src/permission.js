import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
// import { getToken } from '@/assets/scripts/token'
import getPageTitle from '@/assets/scripts/get-page-title'
// import record from '@/utils/certificationCenter'
import connectAuth from '@/utils/connectAuth';
import bus from '@/utils/bus';
// import config from '@/utils/config';
import routerPage from '@/router/routerPage';
import common from '@/assets/scripts/common';

// const { token_name } = config;

NProgress.configure({
  showSpinner: false
}) // NProgress配置

let tool = {
  // 获取菜单所有 path
  getTreePath: (arr, treePath = []) => {
    arr.forEach(item => {
      !common.isEmpty(item.url) && treePath.push(item.url);
      if (!common.isEmpty(item.childList)) {
        tool.getTreePath(item.childList, treePath)
      }
    })
    return treePath;
  },
  // 获取所有路由地址
  getRoutersPath: (arr, newRoute = []) => {
    arr.forEach(item => {
      newRoute.push(item.path);
      !common.isEmpty(item.children) && tool.getRoutersPath(item.children, newRoute)
    })
    return newRoute;
  },
  // 判断是否有权访问
  routeNext(menuTree, routePath, to, next) {
    const treePath = tool.getTreePath(menuTree);
    if (!routePath.includes(to.path)) {
      store.commit('permission/nonExist', true);
    } else if (!treePath.includes(to.path) || !treePath[0]) {
      store.commit('permission/noAccess', true);
    }
    next();
  },
  // 设置页面标题
  setPageTitle(menuTree, to) {
    let path = to.path;
    let data = null;
    let fun = (list) => {
      list.forEach(k => {
        if (!data && k.url === path) data = k;
        !data && fun(k.childList || []);
      })
    }
    fun(menuTree);
    let title = data ? data.name : '';
    document.title = getPageTitle(title);
  },
}

router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()
  // 移除所有等待请求的方法
  store.commit('app/cancelAllPending', '页面跳转，取消正在请求或还未请求的接口');
  store.commit('permission/noAccess', false);
  store.commit('permission/nonExist', false);
  // // 设置页面标题
  // document.title = getPageTitle(to.meta.title);
  // 开始骨架屏
  store.dispatch('app/setShowkens', true);
  if (tool.oldPath === to.path) return;
  //  不验证登录
  if (to.meta && typeof to.meta.requireAuth === 'boolean' && !to.meta.requireAuth) {
    return next();
  }
  // const routePath = tool.getRoutersPath(router.options.routes || []);
  const routePath = tool.getRoutersPath(routerPage);
  bus.authReadyComplete().then(() => {
    // 路由加载状态
    const permissionsIds = store.getters['permissionsIds'];
    const menuTree = store.getters['menuTree'];
    // 需要加载的信息
    const awaitList = [
      { dataOrigin: connectAuth.getToken(), key: 'token' },
      { dataOrigin: connectAuth.getUserInfo(), key: 'userInfo' }
    ];
    if (common.isEmpty(permissionsIds)) {
      awaitList.push({ dataOrigin: connectAuth.getPermissions(), key: 'permissionsIds' });
    }
    // 获取的信息
    connectAuth.customGetInfo(awaitList).then(info => {
      // 获取不到登录信息，跳转登录
      if (common.isEmpty(info.token)) {
        NProgress.done();
        connectAuth.goToLogin();
        return;
      }
      // 验证 token 是否有效
      connectAuth.validationToken().then(validation => {
        if (!validation) {
          NProgress.done();
          connectAuth.goToLogin();
          return;
        }
        // 当菜单为空时，获取菜单
        if (common.isEmpty(menuTree) || menuTree.length === 0) {
          connectAuth.getSysMenu().then((res) => {
            tool.setPageTitle(res.menuTree, to);
            tool.routeNext(res.menuTree, routePath, to, next);
          })
          return;
        }
        tool.setPageTitle(menuTree, to);
        tool.routeNext(menuTree, routePath, to, next);
      })
    })
  })
})

router.afterEach((to) => {
  // 完成进度条
  NProgress.done();
  // 关闭骨架屏
  store.dispatch('app/setShowkens', false);
})
