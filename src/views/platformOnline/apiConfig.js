const prefix = "/marketing-admin"; // 接口代理前缀
const api = {
  ebay: {
    ebayQueryAll: prefix + "/ebay/storeLink/list", //在线商品信息查询
    ebayQueryDetail: prefix + "/ebay/storeLink/detail", //在线商品信息详情
    ebayQueryErpSkuDetailByLink:
      prefix + "/ebay/storeLink/queryErpSkuDetailByLink", //根据链接ID获取sku信息
    ebayUpdateAutoReplenishment: prefix + "/ebay/storeLink/updateSyncInfo", //ebay店铺更新自动补货数量
    updateAutoReplenishmentForLink:
      prefix + "/ebay/storeLink/updateSyncInfoForLink", //ebay店铺更新自动补货数量（链接）
    listLinkDetailByLinkIdList:
      prefix + "/ebay/storeLink/listLinkDetailByLinkIdList", //根据linkId列表获取库存和价格
    updatePriceToEbay: prefix + "/ebay/storeLinkDetail/updatePrice", //多店铺批量更改价格
    updateInventoryToEbay: prefix + "/ebay/storeLinkDetail/updateInventory", //多店铺批量更改库存
    getLinkLog: prefix + "/ebay/storeLinkLog/getLinkLog", //获取ebay店铺日志信息
    updateSyncInfoForAllLink:
      prefix + "/ebay/storeLink/updateSyncInfoForAllLink", //所有查询出来的链接更新自动补货
    countAutoReplenishmentForLink: prefix + "/ebay/storeLink/countAutoReplenishmentForLink", //计算需要自动补货的链接数量
    ebayEndItems: prefix + '/ebay/storeLink/endItems', // 批量下架选中主链接
    ebayEndItemsForQuery: prefix + '/ebay/storeLink/endItemsForQuery', // 批量下架所有主链接
    ebayCountEndItemsForQuery: prefix + '/ebay/storeLink/countEndItemsForQuery', // 获取已上架主链接总数 列表搜索条件一致
    storeLinkDetailList: prefix + "/ebay/storeLinkDetail/list", //ebay子链接视图查询
    batchUpdateLinkDetail: prefix + "/ebay/storeLinkDetail/batchUpdateLinkDetail", //批量更新子链接忽略初始化
    batchUpdateLinkDetail1: prefix + "/ebay/storeLinkDetail/batchUpdateLinkDetail/1", //设置仓库-设置选中链接
    batchUpdateLinkDetail2: prefix + "/ebay/storeLinkDetail/batchUpdateLinkDetail/2", //设置仓库-设置所有结果集
    delLinkDetail: prefix + "/ebay/storeLinkDetail/removeSkuByEbay",  //删除选中子链接sku
    delLinkDetailAll: prefix + "/ebay/storeLinkDetail/removeSkuByEbayForQuery", //删除sku-设置所有结果集
    queryStore: prefix + "/ebay/store/queryStore", //ebay店铺下拉框
    countLinkDetailsNum: prefix + "/ebay/storeLink/countLinkDetailsNum", //主链接 合计修改子链接数量
    countLinksNum: prefix + "/ebay/storeLinkDetail/countLinksNum", //子链接 合计修改主链接数量
    queryInventoryInfoByLink: prefix + "/ebay/storeLinkDetail/queryInventoryInfoByLink" //获取子链接的库存信息
  },
  walmart: {
    list: prefix + '/walmart/storeLink/list',//主链接查询
    listSub: prefix + '/walmart/storeLink/listSub', //子链接查询
    queryStore: prefix + '/walmart/store/queryStore',//搜索条件店铺下拉框查询
    getLinkLogs: prefix + '/walmart/storeLink/getLinkLogs',//日志
    getLinkDetail: prefix + '/walmart/storeLink/getLinkDetail',//库存管理（查询子链接明细）
    updateLinksInfo: prefix + '/walmart/storeLink/updateLinksInfo',//库存管理保存
    updateBatchLinksInfo: prefix + '/walmart/storeLink/updateBatchLinksInfo',//修改链接信息
    countLinkDetailsNum: prefix + '/walmart/storeLink/countLinkDetailsNum',//合计修改子链接数量
    queryContentDisplay: prefix + '/walmart/contentDisplay/queryContentDisplay',//查询自定义列显示与隐藏的设置信息
    updateContentDisplay: prefix + '/walmart/contentDisplay/updateContentDisplay',//修改自定义列显示与隐藏的设置功能
    endItem: prefix + '/walmart/storeLink/endItem',//下架子链接
    updateBatchInventory: prefix + '/walmart/storeLink/updateBatchInventory',//修改链接库存信息
    queryInventoryInfoByLink: prefix + '/walmart/storeLink/queryInventoryInfoByLink',//获取主链接下所有子链接的库存信息
    saveNotes: prefix + '/walmart/wfsNotes/save',//walmart（WFS）新增备注
    getNotes: prefix + '/walmart/wfsNotes/get',//walmaer（WFS）查询子链接所有备注
    updateBatchLinksPrice: prefix + '/walmart/storeLink/updateBatchLinksPrice',//批量修改价格
  },
  abnormalLink: {
    listUnusualModifiedLink: prefix + "/ebay/storeLinkDetailSyncError/listUnusualModifiedLink", //异常修改链接
    retryReviseInventory: prefix + "/ebay/storeLinkDetailSyncError/retryReviseInventory", //重试修改价格/库存
  },
  temu: {
    list: prefix + "/temu/storeLink/list", //产品在线展示接口
    queryStore: prefix + "/temu/store/queryStore", //temu店铺下拉框
    queryLinkLog: prefix + "/temu/storeLinkLog/queryLinkLog", //temu日志查询
    queryDetailByLink: prefix + "/temu/storeLink/queryDetailByLink", //库存管理
    updateSyncInfo: prefix + "/temu/storeLink/updateSyncInfo", //库存管理保存
    updateSyncInventoryForLink: prefix + "/temu/storeLink/updateSyncInventoryForLink", //设置同步库存
    updateSyncInventoryForQuery: prefix + "/temu/storeLink/updateSyncInventoryForQuery", //所有结果集设置同步库存
    listUpdateInventoryInfo: prefix + "/temu/storeLink/listUpdateInventoryInfo", //展示修改库存信息
    updateInventoy: prefix + "/temu/storeLink/updateInventoy", //修改库存
    exportLinkInfo: prefix + "/temu/storeLink/exportLinkInfo", //销量导出
    queryJitStatus: prefix + "/temu/storeLink/queryJitStatus", //判断列表所有是否包含JIT链接
  },
  otto: {
    list: prefix + "/otto/storeLink/list", // otto在线链接-主视图
    childList: prefix + "/otto/storeLinkDetail/list", // otto在线链接-子视图
    queryStore: prefix + "/otto/store/queryStore", //temu店铺下拉框
    inUseList: prefix + "/otto/storeLinkBrand/inUseList", // otto在线链接-获取平台下拉列表
    queryBeforeUpdate: prefix + "/otto/storeLinkDetail/queryBeforeUpdate", // 链接修改前查询
    updateLinkDetail: prefix + "/otto/storeLinkDetail/updateLinkDetail", // otto在线链接-单个平台spu修改库存、处理时间、补货值
    storeLinkLogList: prefix + "/otto/storeLinkLog/list", // 日志列表分页查询
    queryBeforeBatchUpdate: prefix + "/otto/storeLinkDetail/queryBeforeBatchUpdate", // 批量更新前获取更新总数(主链接)
    batchUpdateLinkDetail: prefix + "/otto/storeLinkDetail/batchUpdateLinkDetail", // 批量链接修改
    queryContentDisplay: prefix + '/walmart/contentDisplay/queryContentDisplay',//查询自定义列显示与隐藏的设置信息
    updateContentDisplay: prefix + '/walmart/contentDisplay/updateContentDisplay',//修改自定义列显示与隐藏的设置功能
    queryInventoryInfoByLink: prefix + '/otto/storeLinkDetail/queryInventoryInfoByLink',//获取子链接的库存信息
    // 主链接导出 http://192.168.91.7:882/project/318/interface/api/15724
    mainExport: prefix + '/otto/storeLink/export',
    // 子链接导出 http://192.168.91.7:882/project/318/interface/api/15725
    childExport: prefix + '/otto/storeLinkDetail/export',
    getLabelList: prefix + '/otto/storeLinkDetailLabel/list',//获取所有标签信息
    updateLinkDetailLabels: prefix + '/otto/storeLinkDetail/updateLinkDetailLabels',//修改链接明细标签信息
    // 查询 执行异常数据列表 http://192.168.91.7:882/project/318/interface/api/15720
    listUpdateErrorLogs: prefix + '/otto/storeLinkLog/listUpdateErrorLogs',
    // 导出执行异常数据列表 http://192.168.91.7:882/project/318/interface/api/15723
    exportUpdateErrorLogs: prefix + '/otto/storeLinkLog/exportUpdateErrorLogs',
    // 价格管理查看 http://192.168.91.7:882/project/318/interface/api/15758
    queryLinkDetailPriceByLink: prefix + '/otto/storeLinkDetail/queryLinkDetailPriceByLink',
    // 价格管理保存 http://192.168.91.7:882/project/318/interface/api/15757
    updatePrices: prefix + '/otto/storeLinkDetail/updatePrices',
    // 批量修改价格 http://192.168.91.7:882/project/318/interface/api/15759
    batchUpdatePrices: prefix + '/otto/storeLinkDetail/batchUpdatePrices',
    // 库存管理查询 http://192.168.91.7:882/project/318/interface/api/15784
    queryLinkDetailInventoryByLink: prefix + '/otto/storeLinkDetail/queryLinkDetailInventoryByLink',
    // 库存管理保存 http://192.168.91.7:882/project/318/interface/api/15785
    updateSyncInventoryInfos: prefix + '/otto/storeLinkDetail/updateSyncInventoryInfos',
    // 批量修改库存管理 http://192.168.91.7:882/project/318/interface/api/15786
    batchUpdateSyncInventoryInfos: prefix + '/otto/storeLinkDetail/batchUpdateSyncInventoryInfos',
    // 仓库对应处理时间查询 http://192.168.91.7:882/project/318/interface/api/15787
    queryGroupByStoreId: prefix + '/otto/storeWarehouseDeliveryRel/queryGroupByStoreId',
    // otto导入商品关联 http://192.168.91.7:882/project/318/interface/api/15795
    importProductLinkRel: prefix + '/otto/storeLinkDetail/importProductLinkRel',
    // 修改商品关联 http://192.168.91.7:882/project/318/interface/api/15797
    updateProductLinkRel: prefix + '/otto/storeLinkDetail/updateProductLinkRel',
    // 查询批量修改链接状态数量 http://192.168.91.7:882/project/318/interface/api/15824
    queryUpdateLinkStatusNum: prefix + '/otto/storeLinkDetail/queryUpdateLinkStatusNum',
    // 批量修改链接状态 http://192.168.91.7:882/project/318/interface/api/15825
    batchUpdateLinkStatus: prefix + '/otto/storeLinkDetail/batchUpdateLinkStatus',
    // 计算修改链接的店铺数量 http://192.168.91.7:882/project/318/interface/api/16073
    countUpdateLinksStoreNum: prefix + '/otto/storeLinkDetail/countUpdateLinksStoreNum',
  },
  aliExpress: {
    list: prefix + "/aliexpress/storeLinkDetail/list", // 查询链接列表
    update: prefix + "/aliexpress/storeLinkDetail/update", // 修改链接同步库存状态
    combobox: prefix + "/aliexpress/store/combobox", // aliexpress获取启用、开启全托管并且已授权的店铺（校验店铺权限）
    getLinkDetailLogs: prefix + "/aliexpress/storeLinkDetail/getLinkDetailLogs", // 查询子链接日志
    countUpdateReplenishmentLinks: prefix + "/aliexpress/storeLinkDetail/countUpdateReplenishmentLinks", // 计数需要修改自动补货的链接数量
    batchUpdateLinkDetails: prefix + "/aliexpress/storeLinkDetail/batchUpdateLinkDetails", // 批量修改链接明细
    updateLinkDetails: prefix + "/aliexpress/storeLinkDetail/updateLinkDetails", // 修改链接明细信息
  },
  tiktok: {
    // tiktok 店铺下拉框 http://192.168.91.7:882/project/318/interface/api/15667
    queryStore: prefix + '/tiktok/store/queryStore',
    // 查询主链接列表 http://192.168.91.7:882/project/318/interface/api/15665
    list: prefix + '/tiktok/storeLink/list',
    // 查询子链接列表 http://192.168.91.7:882/project/318/interface/api/15666
    childList: prefix + '/tiktok/storeLinkDetail/list',
    // 查询日志 http://192.168.91.7:882/project/318/interface/api/15668 
    queryLinkLog: prefix + '/tiktok/storeLinkLog/getLinkLog',
    // 查询主链接下的子链接长度(获取链接明细数量) http://192.168.91.7:882/project/318/interface/api/15672
    countLinkDetailsNum: prefix + '/tiktok/storeLink/getLinkDetailCount',
    // 根据链接ID获取sku信息-库存管理查询 http://192.168.91.7:882/project/318/interface/api/15670
    queryErpSkuDetailByLink: prefix + '/tiktok/storeLink/getLinkDetail',
    // 店铺更新自动补货数量（库存管理保存）
    updateAutoReplenishment: prefix + "/tiktok/storeLink/updateLinkDetail",
    // 修改链接信息(批量修改链接明细) http://192.168.91.7:882/project/318/interface/api/15673
    updateBatchLinksInfo: prefix + '/tiktok/storeLink/updateBatchLinkDetail',
    // 获取所有产品类目 http://192.168.91.7:882/project/318/interface/api/14241
    getAllProductCategory: prefix + '/erp/productTag/getAll'
  },
  real: {
    // 列表查询 http://192.168.91.7:882/project/318/interface/api/15967
    childList: prefix + "/real/storeLink/list",
    // 店铺搜索框下拉 http://192.168.91.7:882/project/318/interface/api/15969
    queryStore: prefix + "/real/store/queryStore",
    // 日志查询 http://192.168.91.7:882/project/318/interface/api/15968
    storeLinkLogList: prefix + "/real/storeLinkLog/queryLinkLog",
    // 批量修改链接 http://192.168.91.7:882/project/318/interface/api/15971
    batchUpdateLinks: prefix + '/real/storeLink/batchUpdateLinks',
    // 单个修改链接库存 http://192.168.91.7:882/project/318/interface/api/15973
    updateLinkInventory: prefix + '/real/storeLink/updateLinkInventory',
    // 获取链接库存信息 http://192.168.91.7:882/project/318/interface/api/15970
    queryInventoryInfoByLink: prefix + '/real/storeLink/queryInventoryInfoByLink',
    // 导入商品关联 http://192.168.91.7:882/project/318/interface/api/15972
    importProductLinkRel: prefix + '/real/storeLink/importProductLinkRel',
    // 计算需要修改库存的链接数量 http://192.168.91.7:882/project/318/interface/api/15974
    countUpdateLinks: prefix + '/real/storeLink/countUpdateLinks',
    queryContentDisplay: prefix + '/walmart/contentDisplay/queryContentDisplay',//查询自定义列显示与隐藏的设置信息
    updateContentDisplay: prefix + '/walmart/contentDisplay/updateContentDisplay',//修改自定义列显示与隐藏的设置功能
    // 链接导出 http://192.168.91.7:882/project/318/interface/api/15977
    export: prefix + '/real/storeLink/export',
    // 计算修改链接的店铺数量 http://192.168.91.7:882/project/318/interface/api/15996
    countUpdateLinksStoreNum: prefix + '/real/storeLink/countUpdateLinksStoreNum',
    // 获取品牌接口 http://192.168.91.7:882/project/318/interface/api/15997
    queryManufacturerInfo: prefix + '/real/storeLink/queryManufacturerInfo',
    // 批量设置自动调整物流 http://192.168.91.7:882/project/318/interface/api/15998
    batchUpdateDelivery: prefix + '/real/storeLink/batchUpdateDelivery',
  },
  //temu半托管管理文档 http://192.168.91.7:882/project/318/interface/api/cat_7293
  temuHalfPipe: {
    list: prefix + '/temux/storeLinkDetail/list',
    updateApplyPrice: prefix + '/temux/storeLinkDetail/updateApplyPrice',
    importApplyPrice: prefix + '/temux/storeLinkDetail/importApplyPrice',
    updateInventoryQuantity: prefix + '/temux/storeLinkDetail/updateInventoryQuantity',
    updateWarehouse: prefix + '/temux/storeLinkDetail/updateWarehouse',
    queryStore: prefix + '/temux/store/queryStore',
    storeLinkLogList: prefix + "/temux/storeLinkDetailLog/queryLinkLog",
    queryInventoryInfoByLink: prefix + '/temux/storeLinkDetail/queryInventoryInfoByLink',
    export: prefix + '/temux/storeLinkDetail/export',
  },
};
export default api;