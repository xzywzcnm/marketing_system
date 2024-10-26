import Big from 'big.js';
import common from '@/assets/scripts/common';

// 主链接排序
export const mainSortButtonList = [
  {
    sortHeader: "更新时间",
    sortField: "wsl.gmt_updated",
    sortType: "DESC",
  },
  {
    sortHeader: "上架时间",
    sortField: "wsl.shelved_time",
    sortType: "DESC",
    default: true,
  },
  {
    sortHeader: "昨日销量",
    sortField: "sum(wsl.sold_quantity_yesterday)",
    sortType: "DESC",
  },
  {
    sortHeader: "近3天销量",
    sortField: "sum(wsl.sold_quantity_three_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近7天销量",
    sortField: "sum(wsl.sold_quantity_week)",
    sortType: "DESC",
  },
  {
    sortHeader: "近15天销量",
    sortField: "sum(wsl.sold_quantity_half_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天销量",
    sortField: "sum(wsl.sold_quantity_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "昨日毛利率",
    sortField: "sum(cpi.gross_profit_yesterday)/sum(cpi.order_price_yesterday)",
    sortType: "DESC",
  },
  {
    sortHeader: "近3天毛利率",
    sortField: "sum(cpi.gross_profit_three_day)/sum(cpi.order_price_three_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近7天毛利率",
    sortField: "sum(cpi.gross_profit_seven_day)/sum(cpi.order_price_seven_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近15天毛利率",
    sortField: "sum(cpi.gross_profit_fifteen_day)/sum(cpi.order_price_fifteen_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天毛利率",
    sortField: "sum(cpi.gross_profit_month)/sum(cpi.order_price_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天退款率",
    sortField: "sum(cpi.refund_fee_month)/sum(cpi.transaction_price_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "近60天退款率",
    sortField: "sum(cpi.refund_fee_sixty_day)/sum(cpi.transaction_price_sixty_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近90天退款率",
    sortField: "sum(cpi.refund_fee_ninety_day)/sum(cpi.transaction_price_ninety_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "链接评分",
    sortField: "wslr.average_rating",
    sortType: "DESC",
  },
]

// 子链接排序
export const childSortButtonList = [
  {
    sortHeader: "更新时间",
    sortField: "wsl.gmt_updated",
    sortType: "DESC",
  },
  {
    sortHeader: "上架时间",
    sortField: "wsl.shelved_time",
    sortType: "DESC",
    default: true,
  },
  {
    sortHeader: "昨日销量",
    sortField: "sum(wsl.sold_quantity_yesterday)",
    sortType: "DESC",
  },
  {
    sortHeader: "近3天销量",
    sortField: "sum(wsl.sold_quantity_three_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近7天销量",
    sortField: "sum(wsl.sold_quantity_week)",
    sortType: "DESC",
  },
  {
    sortHeader: "近15天销量",
    sortField: "sum(wsl.sold_quantity_half_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天销量",
    sortField: "sum(wsl.sold_quantity_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "昨日毛利率",
    sortField: "sum(cpi.gross_profit_yesterday)/sum(cpi.order_price_yesterday)",
    sortType: "DESC",
  },
  {
    sortHeader: "近3天毛利率",
    sortField: "sum(cpi.gross_profit_three_day)/sum(cpi.order_price_three_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近7天毛利率",
    sortField: "sum(cpi.gross_profit_seven_day)/sum(cpi.order_price_seven_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近15天毛利率",
    sortField: "sum(cpi.gross_profit_fifteen_day)/sum(cpi.order_price_fifteen_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天毛利率",
    sortField: "sum(cpi.gross_profit_month)/sum(cpi.order_price_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天退款率",
    sortField: "sum(cpi.refund_fee_month)/sum(cpi.transaction_price_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "近60天退款率",
    sortField: "sum(cpi.refund_fee_sixty_day)/sum(cpi.transaction_price_sixty_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近90天退款率",
    sortField: "sum(cpi.refund_fee_ninety_day)/sum(cpi.transaction_price_ninety_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "链接评分",
    sortField: "wslr.average_rating",
    sortType: "DESC",
  },
]

// 自发主链接表头
export const mainTableHead = [
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
    label: "操作",
    minWidth: "70px",
    fixed: 'left',
    slot: 'inventoryManage',
    checkHide: true,
    align: 'center',
  },
  {
    label: "图片/评分",
    minWidth: "100px",
    fixed: 'left',
    slot: 'pictureState',
    checkHide: true,
    align: 'center',
  },
  {
    label: "店铺/SPU/店铺SPU/ItemId",
    minWidth: "180px",
    fixed: 'left',
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
    prop: 'availQuantity',
    align: 'center',
  },
  // {
  //   label: "产品名称",
  //   minWidth: "140px",
  //   fixed: 'left',
  //   prop: 'productName',
  //   align: 'center',
  // },
  // {
  //   label: "多属性",
  //   minWidth: "130px",
  //   slot: 'attrs',
  //   align: 'center',
  // },
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
    label: "上架日期",
    minWidth: "110px",
    slot: 'times',
    align: 'center',
  },
  // {
  //   label: "状态",
  //   minWidth: "80px",
  //   slot: 'status',
  //   align: 'center',
  // },
]

// 自发子链接表头
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
    label: "操作",
    minWidth: "70px",
    fixed: 'left',
    slot: 'inventoryManage',
    checkHide: true,
    align: 'center',
  },
  {
    label: "图片/状态/评分",
    minWidth: "110px",
    fixed: 'left',
    slot: 'pictureState',
    checkHide: true,
    align: 'center',
  },
  {
    label: "店铺/店铺SKU/ItemId/GTIN",
    minWidth: "216px",
    fixed: 'left',
    slot: 'storeInfo',
    checkHide: true,
    align: 'center',
  },
  {
    label: "产品信息",
    minWidth: "180px",
    fixed: 'left',
    slot: 'productInfo',
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
    label: "配送类型",
    minWidth: "130px",
    slot: 'fulfillmentType',
    align: 'center',
  },
  {
    label: "仓库",
    minWidth: "136px",
    slot: 'warehouse',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "80px",
    slot: 'inventory',
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
    label: "上架日期",
    minWidth: "110px",
    slot: 'times',
    align: 'center',
  },
]

// wfs主链接表头
export const wfsMainTableHead = [
  {
    label: "图片",
    minWidth: "110px",
    fixed: 'left',
    slot: 'pictureInfo',
    align: 'center',
  },
  {
    label: "基础信息",
    minWidth: "160px",
    fixed: 'left',
    slot: 'baseInfo',
    align: 'center',
  },
  {
    label: "价格",
    minWidth: "80px",
    fixed: 'left',
    slot: 'priceInfo',
    align: 'center',
  },
  // 库存

  {
    label: "库存",
    minWidth: "50px",
    // slot: 'stockInfo1',
    prop: 'stockInfo1',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "80px",
    slot: 'stockInfo3',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "80px",
    slot: 'stockInfo2',
    align: 'center',
  },
  // 销量
  {
    label: "销量",
    minWidth: "60px",
    // slot: 'saleInfo1',
    prop: 'saleInfo1',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "80px",
    slot: 'saleInfo2',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "80px",
    slot: 'saleInfo3',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "80px",
    slot: 'saleInfo4',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "80px",
    slot: 'saleInfo5',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "80px",
    slot: 'saleInfo6',
    align: 'center',
  },
  // 利润
  {
    label: "利润",
    minWidth: "60px",
    // slot: 'profitInfo1',
    prop: 'profitInfo1',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "85px",
    slot: 'profitInfo2',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "85px",
    slot: 'profitInfo3',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "85px",
    slot: 'profitInfo4',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "85px",
    slot: 'profitInfo5',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "85px",
    slot: 'profitInfo6',
    align: 'center',
  },
  {
    label: "上架日期",
    minWidth: "90px",
    slot: 'times',
    align: 'center',
  }
]

// wfs子链接表头
export const wfsChildTableHead = [
  {
    label: "图片",
    minWidth: "85px",
    fixed: 'left',
    slot: 'pictureInfo',
    align: 'center',
  },
  {
    label: "基础信息",
    minWidth: "160px",
    fixed: 'left',
    slot: 'baseInfo',
    align: 'center',
  },
  {
    label: "价格",
    minWidth: "80px",
    fixed: 'left',
    slot: 'priceInfo',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "50px",
    prop: 'stockInfo1',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "78px",
    slot: 'stockInfo3',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "78px",
    // prop: 'stockInfo2',
    slot: 'stockInfo2',
    align: 'center',
  },
  // 销量
  {
    label: "销量",
    minWidth: "86px",
    slot: 'saleInfo1',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "78px",
    slot: 'saleInfo2',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "78px",
    slot: 'saleInfo3',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "78px",
    slot: 'saleInfo4',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "78px",
    slot: 'saleInfo5',
    align: 'center',
  },
  {
    label: "销量",
    minWidth: "78px",
    slot: 'saleInfo6',
    align: 'center',
  },
  // 利润
  {
    label: "利润",
    minWidth: "60px",
    prop: 'profitInfo1',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "77px",
    slot: 'profitInfo2',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "77px",
    slot: 'profitInfo3',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "77px",
    slot: 'profitInfo4',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "77px",
    slot: 'profitInfo5',
    align: 'center',
  },
  {
    label: "利润",
    minWidth: "77px",
    slot: 'profitInfo6',
    align: 'center',
  },
  {
    label: "备注",
    minWidth: "80px",
    slot: 'remarks',
    align: 'center',
  },
  {
    label: "上架日期",
    minWidth: "90px",
    slot: 'times',
    align: 'center',
  }
]

// wfs主链接排序
export const wfsMainSortButtonList = {
  walmartSellAbleStatus: 'IFNULL(sum(wsl.wfs_avail_quantity),0)+IFNULL(sum(wsl.avail_quantity),0)',
  walmartWfsSellAbleStatus: 'sum(wsl.wfs_avail_quantity)',
  walmartWfsInboundStatus: 'sum(wsl.wfs_inbound_quantity)',
  walmartD1SaleStatus: 'sum(wsl.sold_quantity_yesterday_self_shipment)',
  walmartD3SaleStatus: 'sum(wsl.sold_quantity_three_day_self_shipment)',
  walmartD7SaleStatus: 'sum(wsl.sold_quantity_week_self_shipment)',
  walmartD15SaleStatus: 'sum(wsl.sold_quantity_half_month_self_shipment)',
  walmartD30SaleStatus: 'sum(wsl.sold_quantity_month_self_shipment)',
  walmartWfsD1SaleStatus: 'sum(wsl.sold_quantity_yesterday_wfs)',
  walmartWfsD3SaleStatus: 'sum(wsl.sold_quantity_three_day_wfs)',
  walmartWfsD7SaleStatus: 'sum(wsl.sold_quantity_week_wfs)',
  walmartWfsD15SaleStatus: 'sum(wsl.sold_quantity_half_month_wfs)',
  walmartWfsD30SaleStatus: 'sum(wsl.sold_quantity_month_wfs)',
  walmartTotalD1SaleStatus: 'sum(wsl.sold_quantity_yesterday)',
  walmartTotalD3SaleStatus: 'sum(wsl.sold_quantity_three_day)',
  walmartTotalD7SaleStatus: 'sum(wsl.sold_quantity_week)',
  walmartTotalD15SaleStatus: 'sum(wsl.sold_quantity_half_month)',
  walmartTotalD30SaleStatus: 'sum(wsl.sold_quantity_month)',
  walmartD1ProfitStatus: 'sum(cpi.gross_profit_yesterday)/sum(cpi.order_price_yesterday)',
  walmartD3ProfitStatus: 'sum(cpi.gross_profit_three_day)/sum(cpi.order_price_three_day)',
  walmartD7ProfitStatus: 'sum(cpi.gross_profit_seven_day)/sum(cpi.order_price_seven_day)',
  walmartD15ProfitStatus: 'sum(cpi.gross_profit_fifteen_day)/sum(cpi.order_price_fifteen_day)',
  walmartD30ProfitStatus: 'sum(cpi.gross_profit_month)/sum(cpi.order_price_month)',
  walmartD30RefundStatus: 'sum(cpi.refund_fee_month)/sum(cpi.transaction_price_month)',
  walmartD60RefundStatus: 'sum(cpi.refund_fee_sixty_day)/sum(cpi.transaction_price_sixty_day)',
  walmartD90RefundStatus: 'sum(cpi.refund_fee_ninety_day)/sum(cpi.transaction_price_ninety_day)',
}

// wfs子链接排序
export const wfsChildSortButtonList = {
  walmartSellAbleStatus: 'IFNULL(wsl.wfs_avail_quantity,0)+IFNULL(wsl.avail_quantity,0)',// walmart可售
  walmartWfsSellAbleStatus: 'wsl.wfs_avail_quantity',// wfs可售
  walmartWfsInboundStatus: 'wsl.wfs_inbound_quantity',// wfs在途
  walmartD1SaleStatus: 'wsl.sold_quantity_yesterday_self_shipment',// 自发D1销量
  walmartD3SaleStatus: 'wsl.sold_quantity_three_day_self_shipment',// 自发D3销量
  walmartD7SaleStatus: 'wsl.sold_quantity_week_self_shipment',// 自发D7销量
  walmartD15SaleStatus: 'wsl.sold_quantity_half_month_self_shipment',// 自发D15销量
  walmartD30SaleStatus: 'wsl.sold_quantity_month_self_shipment',// 自发D30销量
  walmartWfsD1SaleStatus: 'wsl.sold_quantity_yesterday_wfs',// WFSD1销量
  walmartWfsD3SaleStatus: 'wsl.sold_quantity_three_day_wfs',// WFSD3销量
  walmartWfsD7SaleStatus: 'wsl.sold_quantity_week_wfs',// WFSD7销量
  walmartWfsD15SaleStatus: 'wsl.sold_quantity_half_month_wfs',// WFSD15销量
  walmartWfsD30SaleStatus: 'wsl.sold_quantity_month_wfs',// WFSD30销量
  walmartTotalD1SaleStatus: 'wsl.sold_quantity_yesterday',// 合计D1销量
  walmartTotalD3SaleStatus: 'wsl.sold_quantity_three_day',// 合计D3销量
  walmartTotalD7SaleStatus: 'wsl.sold_quantity_week',// 合计D7销量
  walmartTotalD15SaleStatus: 'wsl.sold_quantity_half_month',// 合计D15销量
  walmartTotalD30SaleStatus: 'wsl.sold_quantity_month',// 合计D30销量
  walmartD1ProfitStatus: 'cpi.gross_profit_yesterday/cpi.order_price_yesterday',// 毛利率D1
  walmartD3ProfitStatus: 'cpi.gross_profit_three_day/cpi.order_price_three_day',// 毛利率D3
  walmartD7ProfitStatus: 'cpi.gross_profit_seven_day/cpi.order_price_seven_day',// 毛利率D7
  walmartD15ProfitStatus: 'cpi.gross_profit_fifteen_day/cpi.order_price_fifteen_day',// 毛利率D15
  walmartD30ProfitStatus: 'cpi.gross_profit_month/cpi.order_price_month',// 毛利率D30
  walmartD30RefundStatus: 'cpi.refund_fee_month/cpi.transaction_price_month',// 退款率D30
  walmartD60RefundStatus: 'cpi.refund_fee_sixty_day/cpi.transaction_price_sixty_day',// 退款率D60
  walmartD90RefundStatus: 'cpi.refund_fee_ninety_day/cpi.transaction_price_ninety_day',// 退款率D90
  daysAvailableForSaleStatus: '(IFNULL(wsl.wfs_avail_quantity,0)+IFNULL(wsl.avail_quantity,0))/(wsl.sold_quantity_week/7)',// 可售天数
}

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