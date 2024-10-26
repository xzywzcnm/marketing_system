const prefix = "/marketing-admin"; // 接口代理前缀
const api = {
  storeManagement: {
    query: prefix + "/ebay/store/query", //店铺管理列表查询
    getAuthorizeUrl: prefix + "/ebay/store/getAuthorizeUrl", //营销授权
    walmartqueryAll: prefix + "/walmart/store/queryAll", //walmart店铺基础信息
    getWalmartStoreDetail: prefix + "/walmart/store/getStoreDetail", //walmart店铺详情
    updateStoreInfo: prefix + "/walmart/store/updateStoreInfo", //walmart店铺信息修改
    updateAccount: prefix + "/walmart/store/updateAccount", //walmart店铺授权api账号密码存储
    checkAccount: prefix + "/walmart/store/checkAccount", //验证沃尔玛api账号密码权限
    getSellerList: prefix + "/ebay/link/getSellerList", //下载店铺链接
    updataCommonLink: prefix + "/walmart/store/updataCommonLink", //沃尔玛手动同步链接
    getEbayStoreDetail: prefix + '/ebay/store/getEbayStoreDetail', // ebay店铺详情信息
    updateSyncInventory: prefix + "/ebay/store/updateEbayStoreInfo", //eBay店铺修改同步库存设置
    temu_Query: `${prefix}/temu/store/query`, // temu 店铺管理列表查询
    temu_updateTemuToken: `${prefix}/temu/store/updateTemuStoreInfo`, // temu 店铺管理
    tiktok_Query: `${prefix}/tiktok/store/query`, // tiktok店铺管理列表查询
    getTiktokStoreDetail: `${prefix}/tiktok/store/getStoreDetail`, //tiktok店铺详细信息
    updateTiktokStoreInfo: `${prefix}/tiktok/store/updateStoreInfo`, // tiktok店铺更新信息
    eliExpress: {
      list: `${prefix}/aliexpress/store/list`, // 查询aliexpress店铺列表
      update: `${prefix}/aliexpress/store/update`, // 更新店铺信息
      getAuthorizeUrl: `${prefix}/aliexpress/store/getAuthorizeUrl`, // 获取授权url
    },
    otto: {
      list: `${prefix}/otto/store/list`, // 店铺管理查询
      update: `${prefix}/otto/store/update`, // 店铺设置保存
      getDetail: `${prefix}/otto/store/get`, // 店铺设置查询
      getShippingGroupInfo: `${prefix}/otto/storeShippingProfile/getByCommonStoreId`, // 店铺下的运输组查询
    },
    real: {
      list: `${prefix}/real/store/query`, // 店铺管理查询
      update: `${prefix}/real/store/updateStoreInfo`, // 更新店铺信息
      getDetail: `${prefix}/real/store/queryStoreDetail`, // 店铺详情
      getShippingGroupInfo: `${prefix}/real/storeShippingGroupRel/getShippingGroupInfo`, // 店铺下的运输组查询
    },
    temuHalfPipe: {
      list: `${prefix}/temux/store/list`, // 店铺管理查询
      update: `${prefix}/temux/store/update`, // 店铺管理设置
      getAllEnable: `${prefix}/temu/developerAccount/getAllEnable`, // 获取所有temu开发者账号
    },
  }
};
export default api;
