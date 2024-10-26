/* 
* 平台信息列表
*/

import api from '@/api';
import request from '@/assets/scripts/request';

let state = {
  templateList: [], // 模板列表
  allWarehouseList: [],//全部仓库列表
  userWarehouseList: [],//用户权限仓库列表
  categoryList: [],//分类列表
}

const platform = {
  ebay: {},
  walmart: {},
  temu: {},
};
const typeList = { storeList: [], stationList: [] };
Object.keys(platform).forEach(platK => {
  Object.keys(typeList).forEach(typeK => {
    state[platK + typeK] = typeList[typeK];
  })
})
const mutations = {
  // 设置店铺列表
  SET_STORELIST(state, data) {
    state[data.platformCode + 'storeList'] = data.lists;
  },
  // 设置站点列表
  SET_STATIONLIST(state, data) {
    state[data.platformCode + 'stationList'] = data.lists;
  },
  // 设置模板列表
  SET_TEMPLATELIST(state, data) {
    state.templateList = data;
  },
  // 设置全部仓库列表
  SET_ALLWAREHOUSELIST(state, data) {
    state.allWarehouseList = data;
  },
  // 设置用户权限仓库列表
  SET_USERWAREHOUSELIST(state, data) {
    state.userWarehouseList = data;
  },
  // 设置分类列表
  SET_CATEGORYLIST(state, data) {
    state.categoryList = data;
  },
}

const actions = {
  // 获取店铺列表
  getstoreList({ state, commit }, { platformCode }) {
    return new Promise((resolve, reject) => {
      let list = state[platformCode + 'storeList'];
      if (list && list.length) return resolve(list);
      request.get(api[platformCode].queryStore).then(res => {
        if (res.status != 200) return reject(res.msg);
        let lists = res.data || [];
        commit(`SET_STORELIST`, { platformCode, lists });
        resolve(lists)
      }).catch(err => {
        reject(err);
      })
    });
  },
  // 获取站点列表
  getstationList({ state, commit }, { platformCode }) {
    return new Promise((resolve, reject) => {
      let list = state[platformCode + 'stationList'];
      if (list && list.length) return resolve(list);
      request.post(`${api.common.querySiteCode}?platformCode=${platformCode}`).then(res => {
        if (res.status != 200) return reject(res.msg);
        let lists = res.data || [];
        commit(`SET_STATIONLIST`, { platformCode, lists });
        resolve(lists)
      }).catch(err => {
        reject(err);
      })
    });
  },
  // 获取模板列表
  gettemplateList({ state, commit }) {
    return new Promise((resolve, reject) => {
      let list = state.templateList;
      if (list && list.length) return resolve(list);
      request.get(`${api.salePrice.select}`).then(res => {
        if (res.status != 200) return reject(res.msg);
        let lists = res.data || [];
        commit(`SET_TEMPLATELIST`, lists);
        resolve(lists)
      }).catch(err => {
        reject(err);
      })
    });
  },
  // 获取全部仓库列表 
  getAllWarehouseList({ state, commit }) {
    return new Promise((resolve, reject) => {
      let list = state.allWarehouseList;
      if (list && list.length) return resolve(list);
      request.get(`${api.common.queryAllWarehouse}`).then(res => {
        if (res.status != 200) return reject(res.msg);
        let lists = res.data || [];
        commit(`SET_ALLWAREHOUSELIST`, lists);
        resolve(lists)
      }).catch(err => {
        reject(err);
      })
    });
  },
  // 获取用户权限仓库列表
  getUserWarehouseList({ state, commit }) {
    return new Promise((resolve, reject) => {
      let list = state.userWarehouseList;
      if (list && list.length) return resolve(list);
      request.get(`${api.common.queryByErpUserId}`).then(res => {
        if (res.status != 200) return reject(res.msg);
        let lists = res.data || [];
        commit(`SET_USERWAREHOUSELIST`, lists);
        resolve(lists)
      }).catch(err => {
        reject(err);
      })
    });
  },
  // 获取分类列表
  getCategoryList({ state, commit }) {
    return new Promise((resolve, reject) => {
      let list = state.categoryList;
      if (list && list.length) return resolve(list);
      request.get(`${api.common.treeList}`).then(res => {
        if (res.status != 200) return reject(res.msg);
        let lists = res.data || [];
        let fun = (itemList) => {
          if (itemList.children.length > 0) {
            itemList.children.forEach((item) => {
              fun(item);
            });
            return;
          }
          delete itemList.children;
          return;
        };
        lists.forEach((itemList) => {
          fun(itemList);
        });
        commit(`SET_CATEGORYLIST`, lists);
        resolve(lists)
      }).catch(err => {
        reject(err);
      })
    });
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
