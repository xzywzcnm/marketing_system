import { processFloatPoint } from '@/utils/staticDataOrigin';

const commonSaleList = [
  {
    label: "销量信息",
    align: 'center',
    header: 'soldQuantityHead',
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
    percent: true,
    header: 'grossProfitRateHead',
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
      {
        label: "当月累计",
        minWidth: "70px",
        prop: 'grossProfitRateTotalThisMonth',
        align: 'center',
      },
    ],
  },
  {
    label: "退款率信息",
    align: 'center',
    percent: true,
    header: 'refundFeeRateHead',
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
]

// 列表
export const columnHead = {
  'ebay': {
    mainTableHead: [
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
        align: 'center',
      },
      {
        label: "图片",
        minWidth: "90px",
        fixed: 'left',
        slot: 'picture',
        align: 'center',
      },
      {
        label: "店铺/店铺SPU/Itemid/店铺类目",
        minWidth: "200px",
        fixed: 'left',
        slot: 'storeInfo',
        checkHide: true,
        align: 'center',
      },
      {
        label: "产品信息",
        minWidth: "160px",
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
        label: "链接价格/估算利润",
        minWidth: "170px",
        slot: 'prices',
        align: 'left',
      },
      {
        label: "售价估算",
        minWidth: "190px",
        slot: 'salePrices',
        align: 'left',
      },
      {
        label: "上一次调整",
        minWidth: "180px",
        slot: 'lastAjust',
        align: 'left',
      },
      ...commonSaleList,
      {
        label: "估算/修改时间",
        minWidth: "100px",
        slot: 'mulTime',
        align: 'center',
      },
      {
        label: "上架/最后更新时间",
        minWidth: "126px",
        slot: 'lastTime',
        align: 'center',
      },
      {
        label: "警告",
        minWidth: "100px",
        slot: 'warning',
        align: 'center',
        fixed: 'right',
      },
    ],
    childTableHead: [
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
        align: 'center',
      },
      {
        label: "图片",
        minWidth: "90px",
        fixed: 'left',
        slot: 'picture',
        align: 'center',
      },
      {
        label: "店铺/店铺SKU/Itemid/店铺类目",
        minWidth: "200px",
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
        checkHide: true,
      },
      {
        label: "标题/平台类目",
        minWidth: "180px",
        slot: 'titleCategory',
        align: 'center',
      },
      {
        label: "链接价格/估算利润",
        minWidth: "130px",
        slot: 'prices',
        align: 'left',
      },
      {
        label: "售价估算",
        minWidth: "190px",
        slot: 'salePrices',
        align: 'left',
      },
      {
        label: "上一次调整",
        minWidth: "160px",
        slot: 'lastAjust',
        align: 'left',
      },
      {
        label: "产品标签",
        minWidth: "180px",
        slot: 'productTag',
        align: 'left',
      },
      ...commonSaleList,
      {
        label: "估算/修改时间",
        minWidth: "100px",
        slot: 'mulTime',
        align: 'center',
      },
      {
        label: "上架/最后更新时间",
        minWidth: "126px",
        slot: 'lastTime',
        align: 'center',
      },
      {
        label: "警告",
        minWidth: "100px",
        slot: 'warning',
        align: 'center',
        fixed: 'right',
      },
    ]
  }
}

//预估毛利信息、退款率情况 如无数据则前端补0；以百分比展示
export function SupplementZero(row) {
  commonSaleList.forEach(item => {
    if (!item.percent) return;
    item.children.forEach(data => {
      if (data.prop in row) {
        let num = processFloatPoint(row[data.prop] || 0, 2, 100);
        row[data.prop] = num + '%';
      }
    })
  })
  return row;
}