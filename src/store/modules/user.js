/*
 * @Author: Jaycee 
 * @Date: 2021-09-28 17:41:05 
 * @Last Modified by: Jaycee
 * @Last Modified time: 2021-12-15 10:16:14
 */
const state = {
  // 当前用户信息
  userInfo: {},
  // token信息
  tokenInfo: {},
}

const mutations = {
  // 设置用户信息
  SET_USER_INFO (state, obj) {
    state.userInfo = obj
  },
  // 设置用户信息
  SET_TOKEN_INFO (state, obj) {
    state.tokenInfo = obj
  },
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
