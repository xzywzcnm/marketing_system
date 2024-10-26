const prefix = "/marketing-admin"; // 接口代理前缀
const api = {
  common: {
    // 获取用户信息 http://192.168.91.7:882/project/318/interface/api/15722 GET 方式
    listSysUserNames: prefix + '/common/base/listSysUserNames',
    queryAllWarehouse: prefix + "/erp/warehouse/queryAll", //仓库下拉框信息查询
    queryByErpUserId: prefix + "/erp/warehouse/queryByErpUserId", //用户权限仓库下拉框查询,
    queryStore: prefix + "/common/store/queryStore", //店铺下拉框查询
    querySiteCode: prefix + "/common/site/querySiteCode", //站点下拉框查询
    nameMappingList: '/dyt-cloud-upms-admin/sys/user/nameMappingList', // 营销人员查询接口
    noticeTaskList: prefix + '/common/noticeTask/list', // 消息列表查询
    noticeTaskUpdateRead: prefix + '/common/noticeTask/updateRead', // 根据ID更新已读
    // 获取所有产品类目树形结构 http://192.168.91.7:882/project/318/interface/api/15792
    treeList: prefix + '/erp/productCategory/treeList',
    // 获取导入模板 http://192.168.91.7:882/project/318/interface/api/15796
    getTemplate: prefix + '/common/importTask/getTemplate',
    // 普通商品货品查询 http://192.168.91.7:882/project/318/interface/api/15793
    productGoodsQuery: prefix + '/erp/productGoods/query',
    // 映射sku查询 http://192.168.91.7:882/project/318/interface/api/15794
    skuMappingQuery: prefix + '/erp/skuMapping/query',
  }
}

export default api;
