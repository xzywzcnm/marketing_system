import axios from 'axios';
import {
  Message
} from 'element-ui';
import common from '@/assets/scripts/common';
import {
  getToken
} from './token';
import requestHand from './requestHand.js'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import qs from "qs";
import connectAuth from '@/utils/connectAuth';
import bus from '@/utils/bus';
import store from '@/store';
import md5 from 'blueimp-md5';

const resultExceedTime = 1000 * 0.5; // 单位: 毫秒
const checkResTime = 10; // 单位: 毫秒
const removeRqueryKey = 1000 * 60 * 2; // 超时移除
let awaitTime = {};
let resultList = {};

const isFormData = (data) => {
  if (common.isEmpty(data)) return false;
  return Object.prototype.toString.call(data) === '[object FormData]';
}
const getrequestKey = (config) => {
  let newParams = {};
  let newData = {};
  if (config) {
    if (common.isString(config.params) && !isFormData(config.params)) {
      try {
        newParams = JSON.parse(config.params || '{}');
      } catch (e) {
        newParams = { keyParams: config.params }
      }
    } else if (!common.isEmpty(config.params)) {
      newParams = JSON.parse(JSON.stringify(config.params));
    }
    if (common.isString(config.data) && !isFormData(config.data)) {
      try {
        newData = JSON.parse(config.data || '{}');
      } catch (e) {
        newData = { keyData: config.data }
      }
    } else if (!common.isEmpty(config.data)) {
      newData = JSON.parse(JSON.stringify(config.data));
    }
  }
  if (isFormData(newParams)) {
    let obj = {};
    newParams.forEach((item, key) => {
      obj[key] = common.isFile(item) ? {
        lastModified: item.lastModified,
        name: item.name,
        size: item.size,
        type: item.type,
      } : item;
    })
    newParams = obj;
  }
  if (isFormData(newData)) {
    let obj = {};
    newData.forEach((item, key) => {
      obj[key] = common.isFile(item) ? {
        lastModified: item.lastModified,
        name: item.name,
        size: item.size,
        type: item.type,
      } : item;
    })
    newData = obj;
  }
  // 排序, 将参数一样顺序不一样的情况处理成一样
  const params = qs.stringify(newParams, {
    sort: (a, b) => {
      return a.localeCompare(b);
    }
  });
  const dataParams = qs.stringify(newData, {
    sort: (a, b) => {
      return a.localeCompare(b);
    }
  });
  const responseType = config ? config.responseType || '' : '';
  const key = [(config ? config.method || '' : ''), responseType, (config ? config.url || '' : ''), params, dataParams].join('&');
  return `${md5(key)}${config ? `-${config.url}` || '' : ''}`;
}

// 移除请求
const removePending = (requestKey, isRemove) => {
  const pendingList = store.getters['getPendingList'];
  // 如果在 pending 中存在当前请求标识，取消当前请求，并且移除
  if (pendingList.has(requestKey)) {
    if (!isRemove) {
      store.commit('app/deletePending', requestKey);
      delete resultList[requestKey];
      delete awaitTime[requestKey];
    } else {
      setTimeout(() => {
        store.commit('app/deletePending', requestKey);
        delete resultList[requestKey];
        delete awaitTime[requestKey];
      }, 20);
    }
  }
}

// 添加请求
const addPending = (config) => {
  const requestKey = getrequestKey(config);
  const pendingList = store.getters['getPendingList'];
  if (pendingList.has(requestKey)) {
    const thisTime = new Date().getTime();
    if (resultList[requestKey]) {
      const isReject = resultList[requestKey].status === 'reject' || resultList[requestKey].remove;
      const requestCacheTime = (resultList[requestKey].resultTime || 0) + (config.cacheTime || resultExceedTime);
      // 过期或异常的移除缓存
      if (thisTime - requestCacheTime > 0 || isReject) {
        removePending(requestKey, false);
        // 移除之后再次添加进来
        config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
          store.commit('app/pushPending', { requestKey: requestKey, cancel: cancel });
        })
        return;
      }
    }
    // 如果 pending 中存在当前请求则取消后面的请求
    config.cancelToken = new axios.CancelToken(cancel => {
      return cancel(requestKey);
    });
    return;
  }
  // 移除 pendingList 中不存在对应的结果值
  resultList[requestKey] && delete resultList[requestKey];
  // 如果 pending 中不存在当前请求，则添加进去
  config.cancelToken = config.cancelToken || new axios.CancelToken(cancel => {
    store.commit('app/pushPending', { requestKey: requestKey, cancel: cancel });
  })
}

// 文件流的成功和报错处理
let blobError = (response) => {
  return new Promise((resolve, reject) => {
    const resData = response.data;
    if (resData.type === 'application/json') {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        const jsonData = JSON.parse(fileReader.result);
        resolve(jsonData);
      }
      fileReader.readAsText(resData);
    } else {
      let filename = '文件.xlsx';
      let dis = response.headers['content-disposition'];
      if (dis && dis.split(';')[1].split('=')[1]) {
        filename = decodeURIComponent(dis.split(';')[1].split('=')[1]);
      }
      resolve({
        data: { resData, filename },
        msg: "成功",
        status: 200,
      });
    }
  })
}
// 请求配置处理
const requestConfig = (config) => {
  let headersConfig = {};
  // let curr_url = window.location.protocol + '//' + window.location.host;
  // config.headers.OriginUrl = curr_url;
  const token = getToken();
  if (!common.isEmpty(token)) {
    headersConfig.Authorization = token;
  }
  config.headers = {
    ...headersConfig,
    ...config.headers
  };
  config.baseURL = requestHand.baseHand(config.url);
  config.timeout = typeof config.timeout === 'number' && config.timeout > 1000 ? config.timeout : 1000 * 120;
  // 缓存请求值
  if (!common.isBoolean(config.isCache) || config.isCache) {
    addPending(config);
  }
  return config;
}
// axios 默认配置
const instance = axios.create({
  headers: {
    withCredentials: true,
    'Accept-Language': 'zh-CN'
    // 'Access-Control-Allow-Origin': '*',
    // 'Access-Control-Allow-Credentials': true
  }
});

// axios 其他自定义配置
instance.interceptors.request.use(config => {
  //配置发送请求的信息
  !config.ignoreMessage && NProgress.start();
  
  return new Promise((resolve, reject) => {
    if (common.isEmpty(config.url)) return reject(new Error('请求地址不能为空'));
    bus.authReadyComplete().then(() => {
      // 需要加载的信息
      const awaitList = [
        { dataOrigin: connectAuth.getToken(), key: 'token' }
      ];
      connectAuth.customGetInfo(awaitList).then((info) => {
        // 当认证中心不存在token时，跳转登录
        if (common.isEmpty(info.token)) {
          connectAuth.goToLogin();
          return;
        }
        resolve(requestConfig(config));
      })
    })
  })
});

// 添加响应拦截器
instance.interceptors.response.use(
  response => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const requestKey = getrequestKey(response.config);
      NProgress.done();

      let isBlob = response.config.responseType === 'blob';//文件流
      let responseData = response.data || {};
      if (isBlob) responseData = await blobError(response);//文件流返回错误
      const code = responseData.status || responseData.code || response.status;
      let newMsg = responseData.msg;

      // 状态码处理
      if (requestHand.hand[code]) {
        requestHand.hand[code](response).then(async (res) => {
          resultList[requestKey] = { resultTime: new Date().getTime(), result: res.data || {} };
          let resultData = res.data || {};
          if (isBlob) resultData = await blobError(res);
          resolve(common.copy(resultData));
        }).catch((err) => {
          const newErr = err.response && err.response.data ? err.response.data : err.data || err;
          resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: newErr };
          reject(common.copy(newErr));
        });
        return;
      }

      // 错误处理
      if (common.isEmpty(newMsg)) {
        if (requestHand.tipsTxt[code]) {
          newMsg = typeof requestHand.tipsTxt[code] === 'function' ? requestHand.tipsTxt[code](response, response.data) : requestHand.tipsTxt[code];
        } else {
          newMsg = requestHand.other.unknown;
        }
      } !response.config.hiddenError && Message({
        message: newMsg,
        duration: '3000',
        showClose: true,
        type: 'error'
      });
      console.error('axios: ', response);
      resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: responseData };
      return reject(common.copy(responseData));
    })
  },
  error => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const requestKey = getrequestKey(error.config);
      NProgress.done();
      if (error.response) {
        let isBlob = error.response.config.responseType === 'blob';//文件流
        let responseData = error.response.data || {};
        if (isBlob) responseData = await blobError(error.response);//文件流返回错误
        const code = responseData.status || responseData.code || error.response.status;
        let newMsg = responseData.msg;
        // 状态码处理
        if (requestHand.hand[code]) {
          requestHand.hand[code](error.response).then(async (res) => {
            resultList[requestKey] = { resultTime: new Date().getTime(), result: res.data || {} };
            let resultData = res.data || {};
            if (isBlob) resultData = await blobError(res);//文件流返回错误
            resolve(common.copy(resultData));
          }).catch((err) => {
            const newErr = err.response && err.response.data ? err.response.data : err.data || err;
            resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: newErr };
            reject(common.copy(newErr));
          });
          return;
        }
        // 忽略报错
        if (error.response.config.ignoreMessage) {
          return reject(common.copy(responseData));
        }
        // 错误处理
        if (common.isEmpty(newMsg)) {
          if (requestHand.tipsTxt[code]) {
            newMsg = typeof requestHand.tipsTxt[code] === 'function' ? requestHand.tipsTxt[code](error.response, error.response.data) : requestHand.tipsTxt[code];
          } else {
            newMsg = requestHand.other.unknown;
          }
        }
        !error.config.hiddenError && Message({
          message: newMsg || '未知错误，请检查网络是否可用或联系管理员!',
          duration: "3000",
          showClose: true,
          type: 'error'
        });
        console.error('axios: ', error.response);
        resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: responseData };
        return reject(common.copy(responseData));
      }
      const pendingList = store.getters['getPendingList'];
      if (error.message && pendingList.has(error.message) && common.isEmpty(error.config)) {
        // 使用定时器获取接口返回值
        const thisRequest = setInterval(() => {
          awaitTime[error.message] = common.isEmpty(awaitTime[error.message]) ? 0 : awaitTime[error.message] + checkResTime;
          if (!pendingList.has(error.message) || awaitTime[error.message] > removeRqueryKey) {
            clearInterval(thisRequest);
            removePending(error.message, false);
            return reject(common.copy({}));
          }
          if (!common.isEmpty(resultList[error.message])) {
            clearInterval(thisRequest);
            const resultObj = resultList[error.message];
            if (!['reject'].includes(resultObj.status)) {
              resolve(common.copy(resultObj.result));
            } else {
              reject(common.copy(resultObj.result));
            }
          }
        }, checkResTime)
        return;
      }
      console.error('axios: ', error);
      resultList[requestKey] = { resultTime: new Date().getTime(), status: 'reject', result: error };
      return reject(common.copy(error));
    })
  }
);
export default instance;
