/*
 * @Author: Jaycee
 * @Date: 2021-09-28 17:38:42
 * @Last Modified by: Jaycee
 * @Last Modified time: 2022-06-02 10:01:55
 */

// import routerPage from '@/router/routerPage';
const state = {
  // routes: routerPage,
  menuTree: [],
  permissionsIds: [],
  noAccess: false,
  nonExist: false,
  hiddenPageList: ['/strategy-application', '/online-detail', '/product-detail'],//不需要显示在侧边栏的路由
}

const mutations = {
  // 是否有权访问
  noAccess (state, data) {
    state.noAccess = data;
  },
  // 是否存在路由
  nonExist (state, data) {
    state.nonExist = data;
  },
  // 菜单树
  menuTree (state, data) {
    state.menuTree = data;
  },
  // 权限
  permissionsIds (state, data) {
    state.permissionsIds = data;
  }
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
