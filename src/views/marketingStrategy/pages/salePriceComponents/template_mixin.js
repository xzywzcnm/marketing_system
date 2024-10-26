/*
 * 只针对于更换模板的逻辑统一放这里维护
 */
import api from '@/api';
import common from '@/assets/scripts/common'
import request from '@/assets/scripts/request';
import { Message } from 'element-ui';
export default {
  // 点击更换模板
  replaceTemplateCommand(e, { list, row, total }) {
    if (!([1, 2, 3].includes(e))) return;
    if (e == 1 && !list.length) {
      Message.error("请勾选列表数据~");
      return;
    }
    if (e == 2 && !total) {
      Message.warning("暂无数据要更换~");
      return;
    }
    return {
      templateData: e == 1 ? list : e == 3 ? [row] : [],//更改的数据
      templateNum: e == 1 ? list.length : e == 3 ? 0 : total,//条数
    }
  },
  // 更换模板数据返回
  restartComputedCommand({ templateType, templateData, templateInfo, searchOptions, type }) {
    return new Promise((resolve, reject) => {
      let typeTemp = {
        'spu': {
          1: "mainRTemplate",
          2: "mainRtForQuery",
          3: "mainRTemplate",
        },
        'sku': {
          1: "detailRTemplate",
          2: "detailRtForQuery",
          3: "detailRTemplate",
        },
      }
      let apiUrl = api.salePrice[typeTemp[type][templateType]];
      let fun = {
        1() {//批量
          return this.commonList();
        },
        2() {//全部
          return {
            api: apiUrl + `?templateId=${templateInfo.templateId}`,
            data: common.removeEmpty(searchOptions)
          };
        },
        3() {//单个
          return this.commonList();
        },
        // 多个和单个返回值一致
        commonList() {
          return {
            api: apiUrl,
            data: templateData.map(k => {
              let temp = {};
              let params = type == 'spu' ? 'linkId' : 'linkDetailId';
              temp[params] = k.id;
              temp.templateId = templateInfo.templateId;
              console.log(type, templateType)
              // 主链接批量更换模板加上店铺id
              if (['spu'].includes(type) && [1, 3].includes(templateType)) temp.commonStoreId = k.commonStoreId;
              return temp;
            })
          };
        }
      }
      let temp = fun[templateType]();
      if (!temp) {
        reject('返回值错误~');
        return;
      }
      // console.log(temp, templateData)
      request.post(temp.api, temp.data).then(({ data }) => {
        resolve(data);
      }).catch(err => {
        reject(err);
      })
    })
  }
};
