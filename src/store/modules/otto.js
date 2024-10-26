import api from '@/api';
import common from '@/assets/scripts/common';
import request from '@/assets/scripts/request';

let state = {
  transportGroupList: {},//运输组列表
}

const mutations = {
  // 设置店铺列表
  SET_TRANSPORTGROUPLIST(state, data) {
    state.transportGroupList[data.commonStoreId] = data.datas;
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
      request.get(`${api.storeManagement.otto.getShippingGroupInfo}`, { params: { commonStoreId } })
        .then(res => {
          if (res.status != 200) return reject(res.msg);
          let lists = res.data || [];
          commit(`SET_TRANSPORTGROUPLIST`, { commonStoreId, datas: lists });
          resolve(lists);
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
