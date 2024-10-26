import Vue from 'vue'
import App from './App'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/scripts/element.js'
import store from '@/store'
import router from '@/router'
import api from '@/api'
import request from '@/assets/scripts/request'
import '@/assets/style/main.scss'
import '@/assets/scripts/lodash'
import common from '@/assets/scripts/common'
import bus from '@/utils/bus'
import '@/permission'
import '@/assets/iconfont/icon.js'
import '@/components/localComponents/';
import connectAuth from '@/utils/connectAuth';
import config from '@/utils/config';

const { token_name } = config;

Vue.config.productionTip = false
Vue.prototype.$http = request
Vue.prototype.$common = common
Vue.prototype.$bus = bus
Vue.prototype.api = api
Vue.prototype.env = process.env

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  template: '<App/>'
});

// token 监听
const authToken = (token) => {
  const urlParams = common.getUrlParams({ url: window.location.href });
  if (!common.isEmpty(urlParams.pageName) && !common.isEmpty(urlParams.pagePass)) return;
  if (common.isEmpty(token)) {
    connectAuth.goToLogin();
    return;
  }
  const accessCookie = common.getCookie(token_name);
  const userInfo = store.getters['userInfo'];
  // if (common.isEmpty(accessCookie)) {return;}
  const newCookie = `${token.token_type} ${token.access_token}`;
  // 关闭重新登录弹窗
  connectAuth.removeModal();
  // 当 token 不一致时
  if (accessCookie !== newCookie) {
    store.commit('user/SET_TOKEN_INFO', newCookie);
    common.setCookie([
      {key: token_name, value: newCookie}
    ]);
    const awaitList = [
      { dataOrigin: connectAuth.getUserInfo(), key: 'userInfo'},
      // { dataOrigin: connectAuth.getPermissions(), key: 'permissionsIds'},
      // { dataOrigin: connectAuth.getSysMenu(), key: 'menuTree'}
    ];
    connectAuth.customGetInfo(awaitList).then(info => {
      // 当登录人不一致时
      if (!common.isEmpty(info.userInfo) && userInfo.username !== info.userInfo.username) {
        // window.location.replace(window.location.href.split('#/')[0]);
        window.location.reload();
      }
    });
  }
}
// 窗口获得焦点时
const windowFocus = () => {
  connectAuth.enableAutoRefresh();
}
// 窗口失去焦点时
const windowBlur = () => {
  connectAuth.clearRefreshToekn();
}
// 监听 token 
bus.on('auth-token', authToken);
window.addEventListener('focus', windowFocus);
window.addEventListener('blur', windowBlur);
