import common from '@/assets/scripts/common';
import { getSalesStatus } from "@/utils/staticDataOrigin";
// 状态
export const saleList = {
  // 0: { label: "下架", value: 0, style: "color:#F56C6C;" },
  1: { label: "上架", value: 1 },
  2: { label: "下架", value: 2 },
}

// 匹配类型
export const mateList = {
  0: { label: "已匹配", value: 1 },
  1: { label: "未匹配", value: 0 },
}

export const commonList = {
  1: { label: "启用", value: 1 },
  0: { label: "禁用", value: 0 },
}

export const productTypeList = {
  1: { label: "带电", value: 1 },
  2: { label: "不带电", value: 2 },
}

// 自动修改处理时间
export const inventAssistant = commonList;
// 自动补货
export const deliveryTList = commonList;

// 配送类型
export const fulfillmentTypeList = {
  0: { label: "商家自发货", value: 0 },
  1: { label: "平台仓发货", value: 1 },
}

// ERP商品状态
export const goodsStatusArr = (arr) => {
  let list = [
    ...getSalesStatus(arr),
    { label: "组合映射SKU", value: 9, key: "9" },
  ];
  return common.arrayToObj(list);
}

// 子链接排序
export const childSortButtonList = [
  {
    sortHeader: "上架时间",
    sortField: "rsl.shelved_time",
    sortType: "DESC",
    default: true,
  },
  {
    sortHeader: "昨日销量",
    sortField: "rsl.sold_quantity_yesterday",
    sortType: "DESC",
  },
  {
    sortHeader: "近3天销量",
    sortField: "rsl.sold_quantity_three_day",
    sortType: "DESC",
  },
  {
    sortHeader: "近7天销量",
    sortField: "rsl.sold_quantity_week",
    sortType: "DESC",
  },
  {
    sortHeader: "近15天销量",
    sortField: "rsl.sold_quantity_half_month",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天销量",
    sortField: "rsl.sold_quantity_month",
    sortType: "DESC",
  },
  {
    sortHeader: "近一年销量",
    sortField: "rsl.sold_quantity_year",
    sortType: "DESC",
  },
  {
    sortHeader: "昨日毛利率",
    sortField: "cpi.gross_profit_yesterday / cpi.order_price_yesterday",
    sortType: "DESC",
  },
  {
    sortHeader: "近3天毛利率",
    sortField: "cpi.gross_profit_three_day / cpi.order_price_three_day",
    sortType: "DESC",
  },
  {
    sortHeader: "近7天毛利率",
    sortField: "cpi.gross_profit_seven_day / cpi.order_price_seven_day",
    sortType: "DESC",
  },
  {
    sortHeader: "近15天毛利率",
    sortField: "cpi.gross_profit_fifteen_day / cpi.order_price_fifteen_day",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天毛利率",
    sortField: "cpi.gross_profit_month / cpi.order_price_month",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天退款率",
    sortField: "cpi.refund_fee_month / cpi.transaction_price_month",
    sortType: "DESC",
  },
  {
    sortHeader: "近60天退款率",
    sortField: "cpi.refund_fee_sixty_day / cpi.transaction_price_sixty_day",
    sortType: "DESC",
  },
  {
    sortHeader: "近90天退款率",
    sortField: "cpi.refund_fee_ninety_day / cpi.transaction_price_ninety_day",
    sortType: "DESC",
  },
]

// 子链接表头
export const childTableHead = [
  {
    type: "selection",
    width: "40px",
    fixed: 'left',
    checkHide: true,
    align: 'center',
  },
  {
    label: "日志",
    minWidth: "60px",
    fixed: 'left',
    slot: 'log',
    checkHide: true,
    align: 'center',
  },
  {
    label: "图片",
    minWidth: "90px",
    fixed: 'left',
    slot: 'picture',
    align: 'center',
    checkHide: true,
  },
  {
    label: "基础信息",
    minWidth: "170px",
    fixed: 'left',
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
    label: "标题",
    minWidth: "180px",
    slot: 'titleCategory',
    align: 'center',
  },
  {
    label: "仓库",
    minWidth: "180px",
    slot: 'warehouseList',
    align: 'center',
  },
  {
    label: "配送类型",
    minWidth: "90px",
    slot: 'fulfillmentType',
    align: 'center',
  },
  {
    label: "库存",
    width: "120px",
    slot: 'inventory',
    align: 'center',
  },
  {
    label: "物流信息",
    width: "200px",
    slot: 'logisticInfo',
    align: 'center',
  },
  {
    label: "价格",
    minWidth: "110px",
    slot: 'prices',
    align: 'center',
  },
  {
    label: "销量信息",
    align: 'center',
    children: [
      {
        label: "昨日",
        minWidth: "64px",
        prop: 'soldQuantityYesterday',
        align: 'center',
      },
      {
        label: "近3天",
        minWidth: "64px",
        prop: 'soldQuantityThreeDay',
        align: 'center',
      },
      {
        label: "近7天",
        minWidth: "64px",
        prop: 'soldQuantityWeek',
        align: 'center',
      },
      {
        label: "近15天",
        minWidth: "64px",
        prop: 'soldQuantityHalfMonth',
        align: 'center',
      },
      {
        label: "近30天",
        minWidth: "64px",
        prop: 'soldQuantityMonth',
        align: 'center',
      },
      {
        label: "近1年",
        minWidth: "64px",
        prop: 'soldQuantityYear',
        align: 'center',
      },
    ],
  },
  {
    label: "预估毛利信息",
    align: 'center',
    children: [
      {
        label: "昨日",
        minWidth: "64px",
        prop: 'grossProfitRateTotalYesterday',
        align: 'center',
      },
      {
        label: "近3天",
        minWidth: "64px",
        prop: 'grossProfitRateTotalThreeDay',
        align: 'center',
      },
      {
        label: "近7天",
        minWidth: "64px",
        prop: 'grossProfitRateTotalSevenDay',
        align: 'center',
      },
      {
        label: "近15天",
        minWidth: "64px",
        prop: 'grossProfitRateTotalFifteenDay',
        align: 'center',
      },
      {
        label: "近30天",
        minWidth: "64px",
        prop: 'grossProfitRateTotalMonth',
        align: 'center',
      },
    ],
  },
  {
    label: "退款率信息",
    align: 'center',
    children: [
      {
        label: "近30天",
        minWidth: "64px",
        prop: 'refundFeeRateTotalMonth',
        align: 'center',
      },
      {
        label: "近60天",
        minWidth: "64px",
        prop: 'refundFeeRateTotalSixtyDay',
        align: 'center',
      },
      {
        label: "近90天",
        minWidth: "64px",
        prop: 'refundFeeRateTotaNinetyDay',
        align: 'center',
      },
    ],
  },
  {
    label: "上架时间",
    minWidth: "90px",
    slot: 'shelvedTime',
    align: 'center',
  },
  {
    label: "状态",
    minWidth: "80px",
    slot: 'status',
    align: 'center',
  },
]