/*
 * 只针对于重新计算的逻辑统一放这里维护
 */
import api from '@/api';
import bus from '@/utils/bus';
import common from '@/assets/scripts/common'
import request from '@/assets/scripts/request';
import { Message, MessageBox } from 'element-ui';
export default {
  // 更换模板 
  restartComputedCommand(e, { list, total, searchOptions, type }) {
    return new Promise((resolve, reject) => {
      if (!([1, 2].includes(e))) {
        return reject('传参类型错误或正在计算中');
      }
      let typeTemp = {
        'spu': {
          1: "mainCdetailValuation",
          2: "mainCdForQuery"
        },
        'sku': {
          1: "detailCdetailValuation",
          2: "detailCdForQuery"
        },
      }
      let apiUrl = api.salePrice[typeTemp[type][e]];
      let fun = {
        1() {
          if (!list.length) {
            Message.error("请勾选列表数据~");
            return reject('请勾选列表数据');
          }
          return {
            str: `是否对选中的<span style="margin:0 10px;color:#FC2D1A;">${list.length}</span>条链接重新进行售价估算?`,
            temp: list.map(k => {
              let data = {};
              let params = type == 'spu' ? 'linkId' : 'linkDetailId';
              data[params] = k.id;
              data.templateId = k.templateId;
              // 重新计算(主链接)增加店铺id
              if (['spu'].includes(type) && [1].includes(e)) data.commonStoreId = k.commonStoreId;
              return data;
            })
          }
        },
        2() {
          if (!total) {
            Message.warning("暂无数据要计算~");
            return reject('暂无数据要计算');
          }
          return {
            str: '是否对所有链接重新进行售价估算?',
            temp: common.removeEmpty(searchOptions),
          };
        },
      }
      let temp = fun[e]();
      if (!temp) return;
      // console.log(temp.temp);
      MessageBox.confirm(temp.str, '重新计算', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      }).then(() => {
        request.post(apiUrl, temp.temp).then(({ data }) => {
          resolve();
          bus.emit('marketing-admin-newsTip');//更新消息
          Message.success("操作成功~");
        }).catch((err) => {
          reject(err);
        })
      }).catch((err) => {
        reject(err);
      });
    })
  }
};
