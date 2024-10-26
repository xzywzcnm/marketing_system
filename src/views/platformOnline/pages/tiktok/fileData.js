import Big from 'big.js';
import common from '@/assets/scripts/common';

// 主链接排序
export const mainSortButtonList = [
  {
    sortHeader: "更新时间",
    sortField: "tsl.gmt_updated",
    sortType: "DESC",
  },
  {
    sortHeader: "上架时间",
    sortField: "tsl.shelved_time",
    sortType: "DESC",
    default: true,
  },
  // {
  //   sortHeader: "昨日销量",
  //   sortField: "sum(tsl.sold_quantity_yesterday)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近3天销量",
  //   sortField: "sum(tsl.sold_quantity_three_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近7天销量",
  //   sortField: "sum(tsl.sold_quantity_week)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近15天销量",
  //   sortField: "sum(tsl.sold_quantity_half_month)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近30天销量",
  //   sortField: "sum(tsl.sold_quantity_month)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "昨日毛利率",
  //   sortField: "sum(cpi.gross_profit_yesterday)/sum(cpi.order_price_yesterday)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近3天毛利率",
  //   sortField: "sum(cpi.gross_profit_three_day)/sum(cpi.order_price_three_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近7天毛利率",
  //   sortField: "sum(cpi.gross_profit_seven_day)/sum(cpi.order_price_seven_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近15天毛利率",
  //   sortField: "sum(cpi.gross_profit_fifteen_day)/sum(cpi.order_price_fifteen_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近30天毛利率",
  //   sortField: "sum(cpi.gross_profit_month)/sum(cpi.order_price_month)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近30天退款率",
  //   sortField: "sum(cpi.refund_fee_month)/sum(cpi.transaction_price_month)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近60天退款率",
  //   sortField: "sum(cpi.refund_fee_sixty_day)/sum(cpi.transaction_price_sixty_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近90天退款率",
  //   sortField: "sum(cpi.refund_fee_ninety_day)/sum(cpi.transaction_price_ninety_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "链接评分",
  //   sortField: "tslr.average_rating",
  //   sortType: "DESC",
  // },
]

// 子链接排序
export const childSortButtonList = [
  {
    sortHeader: "更新时间",
    sortField: "tsl.gmt_updated",
    sortType: "DESC",
  },
  {
    sortHeader: "上架时间",
    sortField: "tsl.shelved_time",
    sortType: "DESC",
    default: true,
  },
  // {
  //   sortHeader: "昨日销量",
  //   sortField: "sum(tsl.sold_quantity_yesterday)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近3天销量",
  //   sortField: "sum(tsl.sold_quantity_three_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近7天销量",
  //   sortField: "sum(tsl.sold_quantity_week)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近15天销量",
  //   sortField: "sum(tsl.sold_quantity_half_month)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近30天销量",
  //   sortField: "sum(tsl.sold_quantity_month)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "昨日毛利率",
  //   sortField: "sum(cpi.gross_profit_yesterday)/sum(cpi.order_price_yesterday)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近3天毛利率",
  //   sortField: "sum(cpi.gross_profit_three_day)/sum(cpi.order_price_three_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近7天毛利率",
  //   sortField: "sum(cpi.gross_profit_seven_day)/sum(cpi.order_price_seven_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近15天毛利率",
  //   sortField: "sum(cpi.gross_profit_fifteen_day)/sum(cpi.order_price_fifteen_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近30天毛利率",
  //   sortField: "sum(cpi.gross_profit_month)/sum(cpi.order_price_month)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近30天退款率",
  //   sortField: "sum(cpi.refund_fee_month)/sum(cpi.transaction_price_month)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近60天退款率",
  //   sortField: "sum(cpi.refund_fee_sixty_day)/sum(cpi.transaction_price_sixty_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "近90天退款率",
  //   sortField: "sum(cpi.refund_fee_ninety_day)/sum(cpi.transaction_price_ninety_day)",
  //   sortType: "DESC",
  // },
  // {
  //   sortHeader: "链接评分",
  //   sortField: "tslr.average_rating",
  //   sortType: "DESC",
  // },
]

// 自发主链接表头
export const mainTableHead = [
  {
    type: "selection",
    width: "40px",
    // fixed: 'left',
    checkHide: true,
    align: 'center',
  },
  {
    label: "日志",
    minWidth: "60px",
    slot: 'log',
    checkHide: true,
    align: 'center',
  },
  {
    label: "库存管理",
    minWidth: "70px",
    slot: 'inventoryManage',
    checkHide: true,
    align: 'center',
  },
  {
    label: "图片",
    minWidth: "100px",
    slot: 'pictureState',
    checkHide: true,
    align: 'center',
  },
  {
    label: "店铺/SPU ID",
    minWidth: "180px",
    slot: 'storeInfo',
    checkHide: true,
    align: 'center',
  },
  {
    label: "标题/平台类目",
    minWidth: "200px",
    slot: 'titleCategory',
    align: 'center',
  },
  {
    label: "价格",
    minWidth: "140px",
    slot: 'prices',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "80px",
    slot: 'availQuantity',
    align: 'center',
  },
  {
    label: "上架时间",
    minWidth: "110px",
    slot: 'times',
    align: 'center',
  },
  {
    label: "状态",
    minWidth: "80px",
    slot: 'status',
    align: 'center',
  }
]

// 自发子链接表头
export const childTableHead = [
  {
    type: "selection",
    width: "40px",
    // fixed: 'left',
    checkHide: true,
    align: 'center',
  },
  {
    label: "日志",
    minWidth: "60px",
    slot: 'log',
    checkHide: true,
    align: 'center',
  },
  {
    label: "库存管理",
    minWidth: "70px",
    slot: 'inventoryManage',
    checkHide: true,
    align: 'center',
  },
  {
    label: "图片",
    minWidth: "110px",
    slot: 'pictureState',
    checkHide: true,
    align: 'center',
  },
  {
    label: "店铺/SKU ID/平台SKU",
    minWidth: "216px",
    slot: 'storeInfo',
    checkHide: true,
    align: 'center',
  },
  {
    label: "产品信息",
    minWidth: "180px",
    slot: 'productInfo',
    align: 'center',
  },
  {
    label: "产品标签",
    minWidth: "180px",
    slot: 'productTagName',
    align: 'center',
  },
  {
    label: "标题/平台类目",
    minWidth: "200px",
    slot: 'titleCategory',
    align: 'center',
  },
  {
    label: "多属性",
    minWidth: "130px",
    slot: 'attrs',
    align: 'center',
  },
  {
    label: "价格",
    minWidth: "120px",
    slot: 'prices',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "80px",
    slot: 'availQuantity',
    align: 'center',
  },
  {
    label: "上架时间",
    minWidth: "110px",
    slot: 'times',
    align: 'center',
  },
]

// 处理百分比
export const processFloatPoint = (num, len, rate) => {
  if (!(num && common.isNumber(num))) return num;
  if (len && !common.isNumber(len)) return num;
  if (rate && !common.isNumber(rate)) return num;

  if (rate) {
    return Number(new Big(num).times(100).toFixed(len));
  } else {
    return Number(new Big(num.toFixed(len)));
  }
}

// 配送类型
export const deliveryTypeList = {
  0: { label: 'Seller Fulfilled', value: 0, inventory: 'availQuantity' },
  1: { label: 'Walmart Fulfilled', value: 1, inventory: 'wfsAvailQuantity' },
  2: { label: 'WFS Eligible', value: 2, inventory: 'availQuantity' },
}

// tiktok 写死的站点数据
export const siteDataJson = {
  GB: { label: '英国', value: 'GB' },
  US: { label: '美国', value: 'US' }
}

// tiktok 状态
// 商品状态
export const saleList = {
  0: { label: "下架", value: 0, style: "color:#f20;" },
  1: { label: "上架", value: 1, style: "color:#4d8ce9;" },
  2: { label: "删除", value: 2, style: "color:#f20;" }
}