import connectAuth from '@/utils/connectAuth';
import common from '@/assets/scripts/common';
import cookieConfig from '@/utils/cookieConfig';
import axios from 'axios';

export default {
  // 匹配不同模块服务地址
  baseHand: (url) => {
    if (url.includes('/dyt-cloud-upms-admin/')) {
      return process.env.API_UPMS_BASE ?  `${window.location.protocol}//${process.env.API_UPMS_BASE}` : '/';
    }
    return process.env.API_BASE ? `${window.location.protocol}//${process.env.API_BASE}` : '/';
  },
  // 返回提示文本, 此次可使用方法
  tipsTxt: {
    404: '请检查网络是否可用或联系管理员！',
    401: '您暂无访问权限，如需要访问请联系管理员！',
    500: '服务出错，请稍后再试！'
  },
  // 处理方法, 执行后不会继续执行后面代码
  hand: {
    200: (response) => {
      return new Promise((resolve, reject) => {
        resolve(response);
      })
    },
    // token 无效
    451: (response) => {
      return new Promise((resolve, reject) => {
        connectAuth.refreshToken(true).then((toekn) => {
          if (common.isEmpty(toekn)) {
            connectAuth.againLogin();
            return reject(response);
          }
          // 刷新token之后重新发起请求
          let config = response.config;
          common.setCookie(cookieConfig.tokenName, `${toekn.token_type} ${toekn.access_token}`);
          config.headers = { ...config.headers, Authorization: `${toekn.token_type} ${toekn.access_token}` };
          return resolve(axios(config));
        });
      })
    }
  },
  // 其他 
  other: {
    unknown: '系统未知错误,请反馈给管理员'
  }
}
