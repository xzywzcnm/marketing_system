const getters = {
  // 侧边栏
  sidebar: state => state.app.sidebar, //是否显示侧边栏
  showSke: state => state.app.showSke, //是否显示骨架屏
  // 用户
  userInfo: state => state.user.userInfo, //用户信息
  tokenInfo: state => state.user.tokenInfo, //用户信息
  // 权限
  // permission_routes: state => state.permission.routes, //可跳转路由
  noAccess (state) {
    return state.permission.noAccess
  },
  nonExist (state) {
    return state.permission.nonExist
  },
  // 菜单树
  menuTree (state) {
    return state.permission.menuTree
  },
  // 认证中心权限集合
  permissionsIds (state) {
    return state.permission.permissionsIds
  },
  // 返回等待中的请求
  getPendingList (state) {
    return state.app.pendingList;
  },
}
export default getters
