import common from '@/assets/scripts/common';
import { Message } from 'element-ui';
class FetchFun {
  constructor() { }
  defaultParmas = ['pageNum', 'pageSize', 'sortField', 'sortType'];
  // 处理查询数据
  returnSearchOptions(searchOptions, apiType, urlKeys = []) {
    const array = [...this.defaultParmas, ...urlKeys];
    let reqParams = common.removeEmpty(searchOptions);
    if (apiType === 'post') {
      let params = '',
        data = {};
      Object.keys(reqParams).forEach((key, index) => {
        if (!~array.indexOf(key)) {
          data[key] = reqParams[key];
        } else {
          let pre = !params ? '?' : '&';
          params += `${pre}${key}=${reqParams[key]}`;
        }
      });
      return { params, data };
    } else {
      return reqParams;
    }
  }
  // 重置表单
  reset(searchOptions, initOption) {
    if (!(searchOptions && Object.prototype.toString.call(searchOptions) == '[object Object]')) {
      return searchOptions;
    }
    let search = common.copy(searchOptions);
    let resetSearch = {};
    Object.keys(search).forEach(key => {
      if (this.defaultParmas.includes(key)) {
        resetSearch[key] = search[key];
      } else if (initOption && (initOption[key] || initOption[key] === 0)) {
        resetSearch[key] = initOption[key];
      } else {
        if (Array.isArray(search[key])) {
          resetSearch[key] = [];
        } else if (Object.prototype.toString.call(search[key]) == '[object Object]') {
          resetSearch[key] = {};
        } else {
          resetSearch[key] = null;
        }
      }
    })
    return resetSearch;
  }
  // 检验搜索条件是否加上(通过比较值得改动来判断是不是输入条件) resetOption:重置条件配置(有些默认值非空字符串非空数组)
  /**
   * searchParams 要查询条件
   * initParams 条件非空初始值
   * ignoreParams 忽略的参数
   * ignoreMesage 忽略提示
   *  */
  validateForm(searchParams = {}, initParams = {}, ignoreParams = this.defaultParmas, ignoreMesage = false) {
    let isSame = true;
    Object.keys(searchParams).forEach((key) => {
      if (!isSame) return;
      if (ignoreParams.includes(key)) return;
      if (common.isEmpty(searchParams[key])) return;
      if ((key in initParams) && (searchParams[key] === initParams[key])) return;
      isSame = false;
      // let [normalObj, nowsearchObj] = [{}, {}]; //normalObj 表单查询初始条件  nowsearchObj 表单查询条件
      // const nullArr = ['', null, undefined, -99, '-99']; //筛空字符串或全部
      //   if (!~array.indexOf(key)) {
      //     let search = searchOptions[key];
      //     nowsearchObj[key] = search;
      //     if (resetOption && key in resetOption) {
      //       if (
      //         hideFormdata.includes(key) ||
      //         nullArr.includes(resetOption[key])
      //       ) {
      //         normalObj[key] = resetOption[key];
      //         return;
      //       }
      //     }
      //     if (Array.isArray(search)) {
      //       normalObj[key] = [];
      //       return;
      //     }
      //     normalObj[key] = '';
      //   }
    });
    // let result = JSON.stringify(normalObj) === JSON.stringify(nowsearchObj);
    if (isSame && !ignoreMesage) Message({ message: '请输入条件查询~', type: 'warning' });
    return isSame;
  }
}
export default new FetchFun();