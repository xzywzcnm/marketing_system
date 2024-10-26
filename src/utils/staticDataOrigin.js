import Big from 'big.js';
import common from '@/assets/scripts/common';
// 商品状态
const salesStatusList = [
  { label: "在售", value: 1, key: '1' },
  { label: "促销", value: 4, key: '2' },
  { label: "清仓", value: 3, key: '3' },
  { label: "转季", value: 5, key: '4' },
  { label: "试卖", value: 2, key: '5' },
  { label: "停售", value: 0, key: '6' },
  { label: "盲盒", value: 8, key: '8' },
  { label: "无状态SKU", value: 6, key: '7' },
];
const salesStatusList1 = [
  { label: '在售', value: 0, key: '1' },
  { label: '促销', value: 1, key: '2' },
  { label: '清仓', value: 2, key: '3' },
  { label: '转季', value: 3, key: '4' },
  { label: '试卖', value: 4, key: '5' },
  { label: '停售', value: 5, key: '6' }
];
const saleList = {
  0: { label: "在售", value: 0, style: "color:#409EFF;" },
  1: { label: "已下架", value: 1, style: "color:#F56C6C;" },
  2: { label: "异常", value: 2, style: "color:#F56C6C;" },
};
// 修改类型
export const updateTypeJson = {
  0: { value: 0, label: '修改库存' },
  1: { value: 1, label: '修改处理时间' },
  2: { value: 2, label: '自动补货' },
  3: { value: 3, label: '修改价格' },
  4: { value: 4, label: '修改标签' }
}
/**
 * 
 * @param keys 数组, 字符串或空， 用于返回对应数据
 * @returns 
 */
export function getSalesStatus(keys) {
  const newKeys = common.isString(keys) ? [keys] : keys;
  let list = common.copy(salesStatusList);
  if (common.isEmpty(newKeys) || !common.isArray(newKeys)) {
    list.forEach(item => {
      delete item.key;
    });
    return list;
  }
  return list.filter(f => newKeys.includes(f.key)).map(item => {
    delete item.key;
    return item;
  })
}
/**
 * 
 * @param keys 数组, 字符串或空， 用于返回对应数据
 * @returns 
 */
export function getMoreoverSalesStatus(keys) {
  const newKeys = common.isString(keys) ? [keys] : keys;
  let list = common.copy(salesStatusList1);
  if (common.isEmpty(newKeys) || !common.isArray(newKeys)) {
    list.forEach(item => {
      delete item.key;
    });
    return list;
  }
  return list.filter(f => newKeys.includes(f.key)).map(item => {
    delete item.key;
    return item;
  })
}
/**
 * 
 * @param keys 数组, 字符串或空， 用于返回对应数据
 * @returns 
 */
export function getSaleList(keys) {
  const newKeys = common.isString(keys) ? [keys] : keys;
  const list = common.copy(saleList);
  if (common.isEmpty(newKeys) || !common.isArray(newKeys)) {
    return list;
  }
  const objKeys = Object.keys(list);
  objKeys.forEach(key => {
    !keys.includes(key) && delete list[keys];
  })
  return list;
}

// 处理百分比
export const processFloatPoint = (num, len, rate) => {
  if (!(num && common.isNumber(num))) return num;
  if (len && !common.isNumber(len)) return num;
  if (rate && !common.isNumber(rate)) return num;

  if (rate) {
    return Number(new Big(num).times(rate).toFixed(len));
  } else {
    return Number(new Big(num.toFixed(len)));
  }
}