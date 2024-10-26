import api from '@/api';
import common from '@/assets/scripts/common';
import request from '@/assets/scripts/request';

let state = {
  transportGroupList: {},//运输组列表
  stationList: {},//站点列表
  defaultStationList: [
    {
      name: '德国站',
      id: 'de',
    },
    {
      name: '捷克站',
      id: 'cz',
    }
  ],
}

const mutations = {
  // 设置店铺列表
  SET_TRANSPORTGROUPLIST(state, data) {
    state.transportGroupList[data.commonStoreId] = data.datas;
  },
  SET_STATIONLIST(state, data) {
    state.stationList[data.commonStoreId] = data.lists;
  },
}

const actions = {
  // 根据店铺获取运输组
  getTransportGroupList({ state, commit }, data) {
    return new Promise((resolve, reject) => {
      let { commonStoreId } = data;
      if (!commonStoreId) resolve([]);
      let list = state.transportGroupList[commonStoreId];
      if (!common.isEmpty(list) && list.length) return resolve(list);
      request.get(`${api.storeManagement.real.getShippingGroupInfo}`, { params: { commonStoreId } })
        .then(res => {
          if (res.status != 200) return reject(res.msg);
          let lists = res.data || [];
          let temp = {};
          lists.forEach(k => {
            if (!temp[k.site]) temp[k.site] = [];
            temp[k.site].push(k);
          })
          commit(`SET_TRANSPORTGROUPLIST`, { commonStoreId, datas: temp });
          resolve(temp);
        }).catch(err => {
          reject(err);
        })
    });
  },
  // 根据店铺获取站点
  getRealStationList({ state, commit }, data) {
    return new Promise((resolve, reject) => {
      let { commonStoreId } = data;
      if (!commonStoreId) resolve([]);
      let list = state.stationList[commonStoreId];
      if (!common.isEmpty(list) && list.length) return resolve(list);
      commit(`SET_STATIONLIST`, { commonStoreId, lists: state.defaultStationList });
      resolve(state.defaultStationList)
    });
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
