import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import copyActiveCode from '@/utils/clipboard';
import {
  debounce, throttle, cloneDeep, isArray, isObject, isNumber, isString, isBoolean, isFunction, isDate, isRegExp, isSymbol,
  isSet,
  random
} from 'lodash';
import store from '@/store';

const tool = {
  /**
 * 最多执行异步方法数量
 * @param concurrency 数据源
 * @param limit 并发最大数量, 默认 10
 * @returns 
 */
  enqueuePromise(concurrency = [], { limit = 10, progress = (percent) => { } } = {}) {
    let index = 0;
    const ret = [];
    const executing = [];
    const poolLimit = limit > 0 ? limit : 10;
    const enqueue = () => {
      // 边界处理, concurrency 为空数组
      if (index === concurrency.length) {
        concurrency.length === 0 && progress(100);
        return Promise.resolve();
      }
      // 每调一次 enqueue, 初始化一个 promise
      let newPromise = concurrency[index++]();
      if (Object.prototype.toString.call(newPromise).slice(8, -1) !== 'Promise') {
        if (isFunction(newPromise)) {
          newPromise = newPromise();
          if (Object.prototype.toString.call(newPromise).slice(8, -1) !== 'Promise') {
            newPromise = Promise.resolve(newPromise);
          }
        } else {
          newPromise = Promise.resolve(newPromise);
        }
      }
      progress(Number(((index / concurrency.length) * 100).toFixed(2)));
      // 放入 promises 数组
      ret.push(newPromise);
      // 将有返回值的 promise 从 executing 数组中删除, 并将下一个需要执行的放进 executing 数组中
      const perform = newPromise.then(() => {
        return executing.splice(executing.indexOf(perform), 1);
      }).catch(() => {
        return executing.splice(executing.indexOf(perform), 1);
      });
      // 插入 executing 数组, 表示正在执行的 promise
      executing.push(perform);
      // 使用 Promise.rece, 每当 executing 数组中 promise 数量低于 poolLimit, 就实例化新的 promise 并执行
      let result = Promise.resolve();
      if (executing.length >= poolLimit) {
        result = Promise.race(executing);
      }
      // 递归, 直到遍历完 concurrency
      return result.then(() => enqueue());
    };
    return enqueue().then(() => ret);
  }
}

const common = {
  // 防抖
  debounce: debounce,
  // 节流
  throttle: throttle,
  // 深拷贝
  copy: cloneDeep,
  // 是否数组
  isArray: isArray,
  // 是否对象, 包含数组和json
  isObject: isObject,
  // 是否为 undefined
  isUndefined(value) {
    return typeof value === 'undefined'
  },
  /**
   * 是否文件类型
   * @param value 
   * @returns 
   */
  isFile(value) {
    return Object.prototype.toString.call(value).slice(8, -1) === 'File';
  },
  // 是json
  isJson: (obj) => {
    return Object.prototype.toString.call(obj).slice(8, -1) === 'Object';
  },
  // 是否数字类型
  isNumber: isNumber,
  // 是否字符串
  isString: isString,
  /**
   * 是否Promise对象
   * @param value 
   * @returns 
   */
  isPromise: (value) => {
    return Object.prototype.toString.call(value).slice(8, -1) === 'Promise'
  },
  /**
   * 是否 Blob 类型 
   * @param value 数据源
   * @returns 
   */
  isBlob: (value) => {
    return Object.prototype.toString.call(value).slice(8, -1) === 'Blob'
  },
  /**
   * 判断是否为空, 可以支持判断 空数组、空对象、null、空字符串、undefined、NaN
   * @param value 需要验证的数据
   * @param type 多个空格或数组、对象末级递归至父级是否视为空值
   * @returns 
   */
  isEmpty(value, type = false) {
    if (this.isDate(value)) { return isNaN(value.getTime()); }
    if (this.isString(value)) {
      return this.isBoolean(type) && type ? value.trim() === '' : value === '';
    }
    if (this.isNumber(value)) { return isNaN(value); }
    if (this.isJson(value) || this.isArray(value)) {
      const arr = Object.values(value);
      if (!type) { return arr.length <= 0; }
      return Object.keys(this.removeEmpty(arr, true)).length <= 0;
    }
    return value === null || this.isUndefined(value);
  },
  // 是否boolean
  isBoolean: isBoolean,
  // 是否函数
  isFunction: isFunction,
  // 是否时间
  isDate: isDate,
  // 是否正则
  isRegExp: isRegExp,
  isSymbol: isSymbol,
  // 是否Set对象
  isSet: isSet,
  // 数组去重
  arrRemoveRepeat: (arr) => {
    return Array.from(new Set(arr));
  },
  // 移除对象中所有值的 2 端空格
  trim(target, ruleOut) {
    if (!this.isString(target) && !this.isArray(target) && !this.isObject(target)) { return target; }
    const outKey = !this.isEmpty(ruleOut) ? (typeof ruleOut == 'string' ? [ruleOut] : this.isArray(ruleOut) ? ruleOut : []) : [];
    const hand = (obj, stackPointerLike) => {
      if (typeof obj === 'string') { return obj.trim(); }
      if (!this.isObject(obj)) { return obj; }
      let backVal;
      if (this.isArray(obj)) {
        backVal = [];
        for (let index = 0, len = obj.length; index < len; index++) {
          let currentLikeKey = `${this.isEmpty(stackPointerLike) ? '' : stackPointerLike}[*]`;
          const otherLikeKey = `${this.isEmpty(stackPointerLike) ? '' : stackPointerLike}[${index}]`;
          for (let oi = 0, olen = outKey.length; oi < olen; oi++) {
            if (outKey[oi].includes(otherLikeKey)) {
              const newStr = outKey[oi].substring(0, otherLikeKey.length);
              newStr === otherLikeKey && (currentLikeKey = newStr);
            }
          }
          if (!outKey.includes(currentLikeKey)) {
            if (this.isObject(obj[index])) {
              backVal.push(hand(obj[index], currentLikeKey))
            } else {
              typeof obj[index] == 'string' ? backVal.push(obj[index].trim()) : backVal.push(obj[index]);
            }
          } else {
            backVal.push(obj[index]);
          }
        }
      } else if (this.isJson(obj)) {
        backVal = {};
        const objKeys = Object.keys(obj);
        for (let index = 0, len = objKeys.length; index < len; index++) {
          const currentLikeKey = `${this.isEmpty(stackPointerLike) ? '' : `${stackPointerLike}.`}${objKeys[index]}`;
          if (!outKey.includes(objKeys[index]) && !outKey.includes(currentLikeKey)) {
            if (this.isObject(obj[objKeys[index]])) {
              backVal[objKeys[index]] = hand(obj[objKeys[index]], currentLikeKey);
            } else {
              backVal[objKeys[index]] = typeof obj[objKeys[index]] == 'string' ? obj[objKeys[index]].trim() : obj[objKeys[index]];
            }
          } else {
            backVal[objKeys[index]] = obj[objKeys[index]];
          }
        }
      }
      return backVal;
    }
    return hand(this.copy(target));
  },
  /* 获取全部url参数,并转换成json对象 */
  getUrlParams(config, key) {
    const newUrl = decodeURIComponent((this.isString(config) ? config : config ? config.url : window.location.href) || window.location.href);
    if (newUrl.indexOf('?') === -1) return {};
    const urlOption = newUrl.substring(newUrl.indexOf('?') + 1);
    const urlList = this.split(urlOption, ['&']);
    let urlJson = {};
    const keysList = !this.isEmpty(key) ? key : this.isObject(config) && !this.isEmpty(config.keys) ? config.keys : null;
    for (let i = 0, len = urlList.length; i < len; i++) {
      const pos = urlList[i].indexOf('=');
      urlJson[urlList[i].substring(0, pos)] = urlList[i].substring(pos + 1);
    }
    if (this.isString(keysList)) {
      return urlJson[keysList];
    } else if (this.isArray(keysList)) {
      let newVal = {};
      for (let index = 0, klen = keysList.length; index < klen; index++) {
        newVal[keysList[index]] = urlJson[keysList[index]];
      }
      return newVal;
    }
    return urlJson;
  },
  /**
   * 将字符串分割成数组
   * @param str 需要分割的字符串
   * @param sign 分割符号，支持字符串、数组、RegExp; (注意：正则特殊符号不要放到数组中，请使用字符串)
   * @param removeEmpty 是否移除空值以及空格
   * @returns
   */
  split(str, sign, removeEmpty) {
    if (this.isEmpty(str) || !this.isString(str)) return [];
    if (this.isRegExp(sign)) return str.split(sign);
    if (this.isEmpty(sign) || (!this.isString(sign) && !this.isArray(sign))) return [str];
    const isRemove = typeof removeEmpty === 'boolean' && removeEmpty;
    if (this.isString(sign)) {
      if (isRemove) return str.split(sign).filter(f => !this.isEmpty(f, true));
      return str.split(sign);
    }
    let strArr = [];
    let newArr = [];
    for (let si = 0, slen = sign.length; si < slen; si++) {
      if (si === 0) {
        strArr = isRemove ? str.split(sign[si]).filter(f => !this.isEmpty(f, true)) : str.split(sign[si]);
      } else {
        newArr = [];
        for (let i = 0, len = strArr.length; i < len; i++) {
          newArr.push(isRemove ? strArr[i].split(sign[si]).filter(f => !this.isEmpty(f, true)) : strArr[i].split(sign[si]));
        }
        strArr = this.flat(newArr);
      }
    }
    return strArr;
  },
  /**
   * 多维数组扁平化
   * @param arr 转换目标数组
   * @returns
   */
  flat(arr) {
    return arr.flat(Infinity);
  },
  copyToClip(content) {
    let copyTxt = content;
    if (common.isObject(copyTxt)) {
      copyTxt = JSON.stringify(copyTxt);
    }
    return new Promise(resolve => {
      // execCommand 方法有可能弃用，，
      if (document.execCommand) {
        let staging = document.createElement('input');
        // const dome = document.querySelector('body')
        staging.setAttribute('value', copyTxt);
        document.body.appendChild(staging);
        staging.style.position = 'absolute';
        staging.style.top = '-500px';
        staging.select();
        document.execCommand('copy');
        document.body.removeChild(staging);
        resolve(true);
      } else {
        console.error('浏览器不支持该操作');
        resolve(false);
      }
    })
  },
  /**
   * 文件格式转为 base64
   * @param file 
   * @returns 
   */
  fileToBase64(file) {
    return new Promise((reslove, reject) => {
      let oFileReader = new FileReader();
      oFileReader.onloadend = (e) => {
        if (this.isEmpty(e.target)) return reject(e);
        reslove(e.target.result);
      };
      oFileReader.readAsDataURL(file);
    })
  },
  // base64 转为文件格式
  base64ToFile(base64Data, fileName = '') {
    const arr = base64Data.split(',');
    const fileType = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let leng = bstr.length;
    let UintArr = new Uint8Array(leng);
    while (leng--) {
      UintArr[leng] = bstr.charCodeAt(leng);
    }
    const newFile = new File([UintArr], fileName, {
      type: fileType
    })
    return newFile;
  },
  // 获取
  getCookie(keys) {
    if (common.isJson(keys)) {
      let newVal = {};
      Object.keys(keys).forEach(key => {
        newVal[key] = Cookies.get(key) || '';
      })
      return newVal;
    }
    return common.isString(keys) ? (Cookies.get(keys) || '') : common.isArray(keys) ? keys.map(key => (Cookies.get(key) || '')) : '';
  },
  // 插入Cookie
  setCookie(key, val, expires = {}) {
    if (common.isArray(key)) {
      key.forEach(item => {
        if (!common.isEmpty(item.key) && !common.isEmpty(item.value)) {
          Cookies.set(item.key, item.value, item.expires || {});
        }
      })
    } else if (!common.isEmpty(key) && !common.isEmpty(val)) {
      Cookies.set(key, val, expires);
    }
  },
  // 移除 Cookie
  delCookie(keys) {
    if (typeof keys === 'string' && !common.isEmpty(keys)) {
      Cookies.remove(keys);
    } else if (common.isArray(keys)) {
      keys.forEach((item) => {
        common.delCookie(item);
      })
    }
  },
  getParams: (obj) => {
    if (common.isJson(obj)) {
      const keys = Object.keys(obj);
      let params = '';
      keys.forEach(key => {
        params += params.includes('=') ? `&${key}=${obj[key]}` : `${key}=${obj[key]}`;
      })
      return params;
    }
    return ''
  },
  routerAdd: () => {
    const urlParams = common.getUrlParams();
    return `${urlParams.targetEnv ? '?targetEnv=' + urlParams.targetEnv : ''}`;
  },
  // 是有权限，支持 字符串、数组、json
  getPower: (str) => {
    const permissionsIds = store.getters['permissionsIds'];
    if (common.isJson(str)) {
      let newVal = {};
      Object.keys(str).forEach(key => {
        newVal[key] = permissionsIds.includes(str[key]);
      })
      return newVal;
    }
    return common.isString(str) ? permissionsIds.includes(str) : common.isArray(str) ? str.map(key => permissionsIds.includes(key)) : false;
  },
  // 获取元素坐标(元素的左上角为基点)
  getElementOffset(element) {
    const newElement = typeof element === 'string' ? document.querySelector(element) : element;
    let offset = { x: 0, y: 0 }
    let current = newElement.offsetParent;
    offset.x += newElement.offsetLeft;
    offset.y += newElement.offsetTop;
    while (current !== null) {
      offset.x += current.offsetLeft || 0;
      offset.y += current.offsetTop || 0;
      current = current.offsetParent;
    }
    return offset;
  },
  // 获取元素所在被滚动距离
  getElementScrollTop(element) {
    const newElement = typeof element === 'string' ? document.querySelector(element) : element;
    let top = 0;
    let current = newElement.parentNode;
    while (current !== null) {
      top += current.scrollTop || 0;
      current = current.parentNode;
    }
    return top;
  },
  dayjs: dayjs,
  // 运算 乘
  mul: (a, b) => {
    let c = 0;
    const d = a.toString();
    const e = b.toString();
    try {
      c += d.split(".")[1].length;
    } catch (f) { throw new Error(f) }
    try {
      c += e.split(".")[1].length;
    } catch (f) { throw new Error(f) }
    return (
      (Number(d.replace(".", "")) * Number(e.replace(".", ""))) / Math.pow(10, c)
    );
  },
  // 运算 除
  div: (a, b) => {
    let c;
    let d;
    let e = 0;
    let f = 0;
    try {
      e = a.toString().split('.')[1].length;
    } catch (g) { throw new Error(g) }
    try {
      f = b.toString().split('.')[1].length;
    } catch (g) { throw new Error(g) }
    return (
      (c = Number(a.toString().replace('.', ''))),
      (d = Number(b.toString().replace('.', ''))),
      common.mul(c / d, Math.pow(10, f - e))
    );
  },
  // 运算 加
  add: (a, b) => {
    let c, d, e;
    try {
      c = a.toString().split('.')[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split('.')[1].length;
    } catch (f) {
      d = 0;
    }
    return (e = Math.pow(10, Math.max(c, d))), (common.mul(a, e) + common.mul(b, e)) / e;
  },
  // 运算 减
  sub: (a, b) => {
    let c, d, e;
    try {
      c = a.toString().split('.')[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split('.')[1].length;
    } catch (f) {
      d = 0;
    }
    return (e = Math.pow(10, Math.max(c, d))), (common.mul(a, e) - common.mul(b, e)) / e;
  },
  // 下载文件
  downFile(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, filename);
    } else {
      let downloadurl = "";
      try {
        downloadurl = window.URL ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob);
      } catch (e) {
        //捕获异常
        if (window.console) {
          window.console.error(e);
        }
        let binaryData = [].concat(blob);
        let blobFile = new Blob(binaryData);
        downloadurl = window.URL ? window.URL.createObjectURL(blobFile) : window.webkitURL.createObjectURL(blobFile);
      }
      const link = document.createElement("a");
      document.body.appendChild(link);
      link.href = downloadurl;
      link.download = filename;
      link.click();
      setTimeout(function () {
        document.body.removeChild(link);
      }, 50);
    }
  },
  downLink(url) {
    // let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/;
    // if (!reg.test(url)) {
    //   throw new Error("传入参数不合法,不是标准的文件链接");
    // }
    if (!url) {
      throw new Error("文件链接为空!");
    }
    //  获取文件名
    let fileName = this.urlFile(url, 1);
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.target = '_blank';
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 0);
  },
  // 获取url中需要的数据  type  1: 获取文件名  2：获取后缀  3：获取文件名+后缀  4:获取文件前缀
  urlFile(url, type) {
    let filename = url.substring(url.lastIndexOf('/') + 1)
    switch (type) {
      case 1: return filename; break;
      case 2: return filename.substring(filename.lastIndexOf(".") + 1); break;
      case 3: return filename.substring(0, filename.lastIndexOf(".")); break;
      case 4: return url.substring(0, url.lastIndexOf('/') + 1)
    }
  },
  /**
   * Promise.allSettled 并发请求限制
   * @param concurrency 数据源
   * @param {object} options 其他配置
   * @param options.limit 并发最大数量, 默认 10
   * @param options.progress 执行进度，每次完成一个请求时回调一次，返回当前进度的百分比
   * @returns 
  */
  allSettled(concurrency = [], { limit = 10, progress = (percent) => { } } = {}) {
    return new Promise((resolve) => {
      tool.enqueuePromise(concurrency, { limit: limit, progress: progress }).then(ret => {
        if (this.isFunction(Promise.allSettled)) {
          resolve(Promise.allSettled(ret));
        } else {
          Promise.all(ret).then(res => {
            let obj = [];
            for (let i = 0, len = res.length; i < len; i++) {
              obj.push({ status: 'fulfilled', value: res[i] });
            }
            resolve(obj);
          }).catch((error) => {
            let obj = [];
            for (let i = 0, len = ret.length; i < len; i++) {
              obj.push({ status: 'rejected', reason: error });
            }
            resolve(obj);
          });
        }
      })
    })
  },
  /**
   * Promise.all 并发请求限制
   * @param concurrency 数据源
   * @param {object} options 其他配置
   * @param options.limit 并发最大数量, 默认 10
   * @param options.progress 执行进度，每次完成一个请求时回调一次，返回当前进度的百分比
   * @returns
  */
  promiseAll(concurrency = [], { limit = 10, progress = (percent) => { } } = {}) {
    return new Promise((resolve) => {
      tool.enqueuePromise(concurrency, { limit: limit, progress: progress }).then(ret => {
        resolve(Promise.all(ret))
      })
    })
  },
  /**
     * 移除对象空值
     * @param target 需要处理的目标对象
     * @param ruleOut 为空值时不移除的键名集合或key，包括 key 的所有子级
     * @param emptyAllClean 当子级为空时，递归清空父级, 默认为 false
     * @returns
     */
  removeEmpty: (target, ruleOut, emptyAllClean) => {
    let outKey = [];
    if (
      !common.isEmpty(ruleOut) &&
      (typeof ruleOut == 'string' || Array.isArray(ruleOut))
    ) {
      outKey = typeof ruleOut == 'string' ? [ruleOut] : ruleOut;
    } else if (typeof ruleOut == 'boolean') {
      emptyAllClean = ruleOut;
    }
    const hand = (option, clean = true) => {
      if (!common.isEmpty(option)) {
        let newObj;
        if (Array.isArray(option)) {
          newObj = [];
          option.forEach(item => {
            if (!common.isEmpty(item)) {
              if (common.isObject(item)) {
                const newVal = hand(item, false);
                if (!emptyAllClean && !clean) {
                  common.isEmpty(newVal) &&
                    common.isJson(item)
                    ? newObj.push(item)
                    : newObj.push(newVal);
                } else {
                  !common.isEmpty(newVal) &&
                    newObj.push(newVal);
                }
                // !common.isEmpty(newVal) && newObj.push(newVal);
              } else {
                newObj.push(item);
              }
            }
            // else if (!emptyAllClean && !clean && common.isObject(item)) {
            //   newObj.push(item);
            // }
          });
        } else if (common.isJson(option)) {
          newObj = {};
          Object.keys(option).forEach(key => {
            if (!outKey.includes(key)) {
              if (
                !common.isEmpty(option[key]) &&
                option[key] !== 'web-null'
              ) {
                if (common.isObject(option[key])) {
                  const newVal = hand(option[key], false);
                  if (!emptyAllClean && !clean) {
                    // newObj[key] = common.isEmpty(newVal) ? option[key] : newVal;
                    newObj[key] = newVal;
                  } else {
                    !common.isEmpty(newVal) &&
                      (newObj[key] = newVal);
                  }
                } else {
                  newObj[key] = option[key];
                }
              }
            } else {
              newObj[key] = option[key];
            }
          });
        }
        return newObj;
      }
      return option;
    };
    return hand(common.copy(target));
  },
  // 复制功能
  copyActiveCode: copyActiveCode,
  // 拼接url
  urlMontage(url, isThumb = true) {
    if (!url) return url;
    if (/(http|https):\/\/\S*/.test(url)) return url;
    let prefix = '/product-service/filenode/s';
    if (isThumb) {
      prefix = `${prefix}/thumb`;
    }
    const path = url.includes(prefix) ? url : prefix + url;
    const lorigin = process.env.ERP_AUTH ? `${window.location.protocol}//${process.env.ERP_AUTH}` : '/';
    return `${lorigin}${path}`;
  },
  // 处理预览图片
  handleSmallPicture(path, option = { odnHeight: 60, odnWidth: 60, odnBg: 'ffffff' }) {
    if (!path) return path;
    let suffix = '';
    let list = Object.keys(option);
    list.forEach((k, i) => {
      suffix += `${k}=${option[k]}${i < (list.length - 1) ? '&' : ''}`;
    })
    let symbol = path.indexOf('?') >= 0 ? '&' : '?';
    let url = path ? path + symbol + suffix : path;
    // console.log(path, symbol, suffix);
    return url;
  },
  // 将数组转对象
  arrayToObj(arr, key) {
    if (!Array.isArray(arr)) return {};
    let [temp, objKey] = [{}, key || "value"];
    arr.forEach((item) => {
      temp[item[objKey]] = item;
    });
    return temp;
  },
  // 对象归纳
  arrayToObjList(arr, key) {
    let temp = {};
    arr.forEach((item) => {
      let val = item[key];
      if (this.isEmpty(val)) val = 'null_' + parseInt(new Date().getTime() + Math.random() * 1000000000);
      if (!temp[val]) temp[val] = [];
      temp[val].push(item);
    });
    return temp;
  },
}
export default common;