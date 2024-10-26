import {
  MessageBox,
  Message
} from 'element-ui';
import {
  setToken,
  removeToken
} from '@/assets/scripts/token.js';
import config from '@/utils/config';
import store from '@/store';
import common from '@/assets/scripts/common';
import NProgress from 'nprogress';

const { token_name } = config;
const AUTHUrl = window.location.origin.includes('172.20.200.14') ? process.env.AUTH.replace('dyt.pms.com.cn', '172.20.200.14') : process.env.AUTH;
const other = {
  targetPage: '/index.html#/messageHand', // 获取数据页
  // targetPage: '#/recordPages', // 获取数据页
  againLoginPage: '/index.html#/againLogin', // 重新登录页
  homePage: '/index.html#/home', // 首页
  loginPage: '/index.html#/login',  // 登录页
  // 检查认证中心服务是否可访问
  networkTest: `${window.location.protocol}//${AUTHUrl}/static/js/networkTest.js`,
  isPass: false,
  clearPassTime: null,
  targetEnv: process.env.ENV_CONFIG, // 环境变
  recordUrl: `${window.location.protocol}//${AUTHUrl}`, // 对应认证中心地址
  systemCode: process.env.SYSTEMCODE, // 系统代码
  messageKey: 'recordInfo',  // 通讯 key
  removeEvent: () => { },
  // 跨窗口发送信息方法
  postMessageHand: (config, remove) => {
    if ((!config.type || !config.src) && !config.remove) {
      console.error(`参数格式错误, 请参考:
      postMessageHand({
        type: '传递数据获取对应数据类型,接收方类型必须相同, 类型: string, 必传',
        src: '目标链接, 类型: string, 必传',
        data: '需要传递的参数',
        responseHand: '目标页面接收到数据并且响应返回的数据, 类型: function'
      }) `)
      return;
    }
    const key = `${other.messageKey}${config.type}`;

    const tool = {
      isloadSuccess: () => {
        // 用于检测目标链接是否能正常打开
        return new Promise((resolve, reject) => {
          if (other.isPass) return resolve({ success: true });
          let link = document.createElement('script');
          link.src = other.networkTest;
          document.body.appendChild(link);
          // 加载成功
          link.onload = () => {
            other.isPass = true;
            resolve(true);
            link.remove();
          }
          // 加载失败
          link.onerror = (e) => {
            other.isPass = false;
            reject(false);
            link.remove();
          }
        })
      },
      createIframe: () => {
        const url = `${config.src}?iframe=iframe&targetEnv=${other.targetEnv}`;
        if (other.clearPassTime) {
          clearTimeout(other.clearPassTime);
          other.clearPassTime = null;
        }
        tool.isloadSuccess(url).then(res => {
          const oldIframe = document.querySelector(`#iframe${other.messageKey}`);
          // oldIframe && oldIframe.remove();
          // 绑定方法
          window.addEventListener('message', tool[`function${key}`]);
          // console.log('createIframe: ', key, oldIframe)
          if (!oldIframe) {
            // 创建 iframe 指向 认证中心
            let iframe = document.createElement('iframe');
            iframe.id = `iframe${other.messageKey}`;
            iframe.src = url;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            // 页面加载后向目标页面发送数据
            iframe.onload = (e) => {
              setTimeout(() => {
                iframe.contentWindow.postMessage({ [`${key}`]: { ...config.data, type: config.type } }, '*');
              }, 200)
            }
          } else {
            setTimeout(() => {
              oldIframe.contentWindow.postMessage({ [`${key}`]: { ...config.data, type: config.type } }, '*');
            }, 200)
          }
        }).catch(() => {
          store.commit('routerModel/routerLoading', false);
          NProgress.done();
          MessageBox.confirm('获取认证中心信息失败，无法打开当前系统，是否前往认证中心？', "提示", {
            closeOnClickModal: false,
            showClose: false,
            closeOnPressEscape: false,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            certification.goToLogin();
          }).catch(() => { })
        })
      },
      // 目标页面响应
      [`function${key}`]: (e) => {
        if (typeof e.data[`${key}`] === 'undefined') return;
        // 解除绑定
        typeof config.responseHand === 'function' && config.responseHand(e.data[`${key}`]);
      },
      removeEvent: () => {
        // 解除绑定
        window.removeEventListener('message', tool[`function${key}`]);
      }
    }
    // 执行处理
    config.remove ? tool.removeEvent() : tool.createIframe();
  },
  addModal: (config) => {
    // 直接将body样式类名赋值会造成原有的类名缺失
    // document.querySelector('body').className = 'again-login-body';
    const body = document.querySelector('body');
    let className = body.className.split(' ');
    if (!body.className.includes('again-login-body')) {
      className.push('again-login-body');
      body.className =  className.join(' ');
    }

    let par = document.createElement('div');
    par.setAttribute('class', 'mk_model');
    par.style.zIndex = '2147483646';
    let dom = `<div class="mk_model_main">${config.content}</div>`;
    par.innerHTML = dom;
    document.body.appendChild(par);
  },
  removeModal: () => {
    setTimeout(() => {
      // document.querySelector('body').className = '';
      const body = document.querySelector('body');
      let className = body.className.split(' ');
      if (className.includes('again-login-body')) {
        className.splice(className.indexOf('again-login-body'), 1);
        body.className =  className.join(' ');
      }
      // 移除弹框内容
      let mk_model = document.querySelector('.mk_model');
      mk_model.parentNode.removeChild(mk_model);
    }, 200)
  }
}

const certification = {
  // 向认证中心获取信息, key系统名称, prams 需要传递的数据， type获取数据类型, callBack回调
  recordCertification (config = {}) {
    return new Promise((resolve, reject) => {
      let urlParams = common.getUrlParams({ url: window.location.search || window.location.href });
      if (urlParams['pageName'] && urlParams['pagePame']) {
        other.postMessageHand({
          type: 'loginAuth',
          src: `${other.recordUrl}${other.targetPage}`,
          data: {
            prams: {
              pageName: urlParams['pageName'],
              pagePame: urlParams['pagePame']
            }
          },
          responseHand: (res) => {
            // 当登录失败时，还是跳转到登录页面
            if (!res) {
              certification.goToLogin();
              return;
            }
            delete urlParams['pageName'];
            delete urlParams['pagePame'];
            let href = window.location.href.substring(0, window.location.href.indexOf('?'));
            if (!common.isEmpty(urlParams)) {
              let newParams = '';
              Object.keys(urlParams).forEach(key => {
                newParams = newParams ? `${newParams}&${key}=${urlParams[key]}` : `${key}=${urlParams[key]}`
              })
              href = `${href}?${newParams}`;
            }
            window.location.href = href;
            if (common.isEmpty(window.location.search)) {
              window.location.reload();
            }
          }
        })
      } else {
        const locat = window.location;
        if (!common.isEmpty(locat.search)) {
          if (locat.href.includes(`${locat.search}#/`)) {
            locat.href = `${locat.origin}${locat.pathname}${locat.hash}${locat.hash.includes('?')?locat.search.replace('?', '&'):locat.search}`;
          }
        }
        other.postMessageHand({
          type: config.type || 'getToken',
          src: `${other.recordUrl}${other.targetPage}`,
          data: {
            cookie: document.cookie,
            // 系统标识
            prams: config.prams || {}
          },
          responseHand: (res) => {
            resolve(res);
          }
        })
      }
    })
    // return new Promise((resolve, reject) => {
    //   other.postMessageHand({
    //     type: config.type || 'getToken',
    //     src: `${other.recordUrl}${other.targetPage}`,
    //     data: {
    //       cookie: document.cookie,
    //       // 系统标识
    //       prams: config.prams || {}
    //     },
    //     responseHand: (res) => {
    //       resolve(res);
    //     }
    //   })
    // })
  },
  // 刷新 token, key 系统标识，prams额外参数，callBack回调
  refreshToken (config = {}) {
    certification.recordCertification({ type: 'getToken' }).then(info => {
      // 当认证中心不存在token时，跳转登录
      if (!info.login || !info.token) {
        certification.goToLogin();
        return;
      }
      // 当 token 或 login 为空时，需要登录
      const userInfo = store.getters['userInfo'];
      // 当 token 不同时，增说明账号更换，刷新页面
      if (userInfo.loginName && userInfo.loginName !== info.login.loginName) {
        removeToken([token_name]);
        window.location.reload();
        return;
      }
      other.postMessageHand({
        src: `${other.recordUrl}${other.targetPage}`,
        type: 'refreshToken',
        data: {
          cookie: document.cookie,
          prams: config.prams || {}
        },
        responseHand: (res) => {
          // 存在token 刷新失败时弹窗重新登录窗口，否则跳转到认证中心登录页面
          if (!res.success) {
            certification[`${res.tagert === 'login' ? 'goToLogin' : 'againLogin'}`](true);
          } else {
            certification.authTokenHand(info);
            // 刷新成功后，执行下次刷新，此次处理token
            certification.refreshToken();
          }
          typeof config.callBack === 'function' && config.callBack(res);
        }
      });
    })
  },
  // 移除刷新 token 方法
  removeRefresh () {
    // 移除绑定
    other.postMessageHand({ type: 'refreshToken', remove: true });
  },
  // 退出登录, callBack 回调， 传递的参数 prams
  outSystemLogin (config = {}) {
    return new Promise(resolve => {
      MessageBox.confirm("退出认证中心，已打开的系统将受到影响，是否确认退出？", "提示", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const content = `<div style="padding: 10px 20px;">
          <i class="ivu-icon ivu-icon-ios-loading  ivu-load-loop" style="font-size: 18px; color: #2d8cf0;"></i>
          正在退出系统...
        </div>`;
        other.addModal({
          content: content,
          title: '提示'
        });
        certification.removeRefresh();
        other.postMessageHand({
          type: 'outLogin',
          src: `${other.recordUrl}${other.targetPage}`,
          data: {
            cookie: document.cookie,
            prams: {
              ...(config.prams || {}),
              targetUrl: document.location.href
            }
          },
          responseHand: async (res) => {
            resolve({
              data: res,
              removeModal: () => {
                other.removeModal();
              },
              defaultHand: () => {
                other.removeModal();
                if (!res) {
                  Message.error({
                    content: '退出系统失败，请重新操作!',
                    title: "提示"
                  });
                } else {
                  removeToken([token_name]);
                  // 返回登录页面
                  setTimeout(() => {
                    other.removeModal();
                    certification.goToLogin(true);
                  }, 100)
                }
              }
            });
          }
        })
      }).catch(() => { console.log("已取消") })
    })
  },
  // 重新登录(弹窗形式)
  againLogin () {
    const tool = {
      hand: () => {
        // 绑定方法
        window.addEventListener('message', tool.againLoginFun);
        // 创建 iframe
        const content = `<iframe
          style="width: 800px; height: 60vh; border: none;"
          id="againLogin" src="${other.recordUrl}${other.againLoginPage}"
          class="again-login-iframe"
        />`;
        other.addModal({ content: content, title: '', calssName: 'again-login-content' });
        // 弹窗登录窗口时清空当前 cookie
        removeToken([token_name]);
        // 则移除监听刷新 token
        certification.removeRefresh();
      },
      // 此次无论登录失败都会回调
      againLoginFun: (e) => {
        let res = e.data.againLogin;
        if (!res) return;
        if (res.success) {
          other.removeModal();
          // 解除绑定
          window.removeEventListener('message', tool.againLoginFun);
          // 进行 token 处理
          certification.authTokenHand(res.data);
          // 重新登录后账号是否相同，不同则跳转当前系统首页
          if (!res.sameAccount) {
            document.location.href = document.location.href.split('#/')[0];
          }
          // 重新登录成功后，启动刷新 token 方法
          certification.refreshToken();
        }
      }
    }
    tool.hand();
  },
  // 重定向到认证中心页面(默认首页)
  backOauth (url, type) {
    const oauthHome = typeof url === 'string' ? url : other.recordUrl + `${other.homePage}?targetEnv=${other.targetEnv}`;
    // if (window.opener) {
    //   window.open(oauthHome, `${other.targetEnv}authenticationCenter`);
    //   type && window.close();
    // } else {
    //   document.location.href = oauthHome;
    // }
    document.location.href = oauthHome;
  },
  // 重定向到认证中心登录页面
  goToLogin (type) {
    const login = `${other.recordUrl}${other.loginPage}`;
    if (!type) {
      certification.backOauth(`${login}?targetEnv=${other.targetEnv}&systemKey=${other.systemCode}&target=${document.location.href}`, true);
    } else {
      certification.backOauth(`${login}?targetEnv=${other.targetEnv}`, true);
    }
  },
  // 进行 token 处理 res, name
  authTokenHand (info = {}, type = false) {
    return new Promise((resolve, reject) => {
    // console.log('获取token认证中心发送过来的信息', info);
      const login = info.login || {};
      const token = info.token || {};
      const userInfo = Object.assign({}, info.userInfo || {}, login);
      setToken(`${token.token_type} ${token.access_token}`, token_name);
      store.commit("user/SET_USER_INFO", userInfo); // 更新vuex值
      store.commit("user/SET_TOKEN_INFO", token); // 更新vuex值
      // 当用户信息更新时，更新菜单和权限（点击路由时不处理）
      !type ? certification.getPermissions().then(res => {
      // 存储菜单
        store.commit('permission/menuTree', res.menuTree || []);
        // 存储权限
        store.commit('permission/permissionsIds', res.permissionsIds || []);
        resolve()
      }) : resolve();
    })
  },
  // 验证 token 是否已过期
  validationHand (config = {}) {
    return new Promise((resolve, reject) => {
      other.postMessageHand({
        type: 'validationToken',
        src: `${other.recordUrl}${other.targetPage}`,
        data: {
          prams: config.prams || {}
        },
        responseHand: (res) => {
          resolve(res)
        }
      })
    })
  },
  // 获取权限以及菜单树
  getPermissions () {
    return new Promise((resolve, reject) => {
      other.postMessageHand({
        type: 'getPermissions',
        src: `${other.recordUrl}${other.targetPage}`,
        data: {
          prams: {
            // 系统代码
            systemCode: other.systemCode
          }
        },
        responseHand: (res) => {
          resolve(res)
        }
      })
    })
  },
  // 保存最新访问地址
  saveTarget () {
    other.postMessageHand({
      type: 'saveTarget',
      src: `${other.recordUrl}${other.targetPage}`,
      data: {
        prams: {
          // 系统代码
          systemCode: other.systemCode,
          // 地址
          target: document.location.href
        }
      },
      responseHand: (res) => { }
    })
  }
}
export default certification;
