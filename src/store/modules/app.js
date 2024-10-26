let isFirst = false;
const state = {
  sidebar: {
    opened: true,
  },
  // 首次打开时显示骨架屏
  showSke: true,
  // 请求缓存
  pendingList: new Map(),
}

const mutations = {
  // 设置侧边栏的展开/收起
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
  },
  // 更改骨架屏显示状态 只在初始化加载一次 避免空白页
  SET_SHOWSKE(state, boolean) {
    if (isFirst === true) {
      return;
    }
    state.showSke = boolean;
    if (boolean === false) {
      isFirst = true;
    }
  },
  // 添加请求到登录列表里
  pushPending (state, data) {
    state.pendingList.set(data.requestKey, data.cancel);
  },
  // 移除等待中的请求
  deletePending (state, data) {
    state.pendingList.delete(data);
  },
  // 取消所有等待中的请求
  cancelAllPending (state, data = '该请求被主动取消') {
    for(let [key, value] of state.pendingList) {
      // 取消
      value(`${data}: ${key}`);
      // 移除
      state.pendingList.delete(key);
    }
  }
}

const actions = {
  toggleSideBar({
    commit
  }) {
    commit('TOGGLE_SIDEBAR')
  },
  // 骨架屏
  setShowkens({
    commit
  }, boolen) {
    commit('SET_SHOWSKE', boolen)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
