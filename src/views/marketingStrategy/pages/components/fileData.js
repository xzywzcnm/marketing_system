import { getSalesStatus } from '@/utils/staticDataOrigin';
// 策略类型
export const policyType = {
  0: {
    name: "调整价格",
    value: 0,
    ajustName: '原价',
  },
  1: {
    name: "调整库存",
    value: 1,
    ajustName: '库存',
  },
  2: {
    name: "同步库存",
    value: 2,
  },
}

// 触发频次
export const triggerFrequencyList = {
  0: {
    name: "单次",
    value: 0,
  },
  1: {
    name: "每日",
    value: 1,
  },
  2: {
    name: "每周",
    value: 2,
  },
  3: {
    name: "每4小时",
    value: 3,
  },
}

// 状态
export const strategyStatuslist = {
  1: {
    name: "启用",
    value: 1,
  },
  0: {
    name: "停用",
    value: 0,
  },
}

// 条件
export const condition = {
  1: {
    name: "链接7天销量",
    value: 1,
    unit: "件",
  },
  2: {
    name: "链接30天销量",
    value: 2,
    unit: "件",
  },
  3: {
    name: "链接浏览量",
    value: 3,
    unit: "次",
  },
  4: {
    name: "链接收藏数",
    value: 4,
    unit: "次",
  },
  5: {
    name: "链接转化率",
    value: 5,
    unit: "%",
  },
  6: {
    name: "链接上架时间",
    value: 6,
    unit: "天",
  },
}

// 条件符号
export const conditionalSymbol = {
  0: {
    name: ">",
    value: 0,
  },
  1: {
    name: "<",
    value: 1,
  },
  2: {
    name: "=",
    value: 2,
  },
  3: {
    name: ">=",
    value: 3,
  },
  4: {
    name: "<=",
    value: 4,
  },
}

// 条件符号文字
export const conditionalSymbolText = {
  0: {
    name: "增加",
    value: 0,
    symbol: '+',
  },
  1: {
    name: "减少",
    value: 1,
    symbol: '-',
  },
  2: {
    name: "等于",
    value: 2,
    symbol: '=',
  },
}

// 调整类型
export const rangeTypeList = {
  0: {
    name: "库存",
    value: 0,
  },
  1: {
    name: "价格",
    value: 1,
  },
}

// ERP商品状态
export const goodsStatusArr = (type) => {
  let list = getSalesStatus(['1', '2', '3', '4', '5', '6']);
  if (type === 'nostatus') {
    list.push({ label: '该sku无状态 ', value: -1, hidden: true });
  }
  return list;
}

// 站点
export const siteExsit = {
  "CN": {
    label: '中国站',
    value: 'CN',
  },
  "BR": {
    label: '巴西站',
    value: 'BR',
  },
  "US": {
    label: '美国站',
    value: 'US',
  },
  "DE": {
    label: '德国站',
    value: 'DE',
  },
  "FR": {
    label: '法国站',
    value: 'FR',
  },
  "UA": {
    label: '乌克兰站',
    value: 'UA',
  },
  "IT": {
    label: '意大利站',
    value: 'IT',
  },
  "UK": {
    label: '英国站',
    value: 'UK',
  },
  "RU": {
    label: '俄罗斯站',
    value: 'RU',
  },
  "AU": {
    label: '澳大利亚站',
    value: 'AU',
  },
  "PL": {
    label: '波兰站',
    value: 'PL',
  },
}

// 调整类型
export const priceLockList = {
  0: { label: "停用", value: 0 },
  1: { label: "启用", value: 1 },
}
export const discountList = {
  0: { label: "停用", value: 0 },
  1: { label: "启用", value: 1 },
}