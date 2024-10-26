// 状态
export const saleList = {
  0: { label: "下架", value: 0, style: "color:#F56C6C;" },
  1: { label: "上架", value: 1, style: "color:#409EFF;" },
}

// 主链接排序
export const childSortButtonList = [
  {
    sortHeader: "创建时间",
    sortField: "tsl.platform_create_time",
    sortType: "DESC",
    default: true,
  },
  {
    sortHeader: "昨日销量",
    sortField: "sum(tsld.sold_quantity_yesterday)",
    sortType: "DESC",
  },
  {
    sortHeader: "近3天销量",
    sortField: "sum(tsld.sold_quantity_three_day)",
    sortType: "DESC",
  },
  {
    sortHeader: "近7天销量",
    sortField: "sum(tsld.sold_quantity_week)",
    sortType: "DESC",
  },
  {
    sortHeader: "近15天销量",
    sortField: "sum(tsld.sold_quantity_half_month)",
    sortType: "DESC",
  },
  {
    sortHeader: "近30天销量",
    sortField: "sum(tsld.sold_quantity_month)",
    sortType: "DESC",
  },
]

// 主链接表头
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
    label: "图片",
    minWidth: "120px",
    fixed: 'left',
    slot: 'picture',
    align: 'center',
  },
  {
    label: "平台商品信息",
    minWidth: "180px",
    fixed: 'left',
    slot: 'goodsInfo',
    checkHide: true,
    align: 'center',
  },
  {
    label: "SKU",
    minWidth: "100px",
    slot: 'erpSku',
    checkHide: true,
    align: 'center',
  },
  {
    label: "申报价格",
    minWidth: "120px",
    slot: 'declarePrice',
    checkHide: true,
    align: 'center',
  },
  {
    label: "仓库",
    minWidth: "140px",
    slot: 'warehouseList',
    align: 'center',
  },
  {
    label: "库存",
    minWidth: "120px",
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
    label: "创建时间",
    minWidth: "90px",
    slot: 'handleTime',
    align: 'center',
  },
]