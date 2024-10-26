const prefix = '/marketing-admin'; // 接口代理前缀
const api = {
  marketingStrategy: {
    queryByParm: prefix + '/strategy/common/queryByParm', //营销策略-主界面查询全部-分页
    saveCommonStrategy: prefix + '/strategy/common/save', //营销策略-新增策略
    queryAll: prefix + '/strategy/dictionary/queryAll', //营销策略-新建营销策略-条件下拉框
    queryDetailById: prefix + '/strategy/common/queryDetailById', //营销策略-详情查询
    updateCommonStrategy: prefix + '/strategy/common/update', //营销策略-更新编辑策略
    productRelationqueryByParm: prefix + '/strategy/productRelation/queryByParm', //策略应用-分页查询
    saveproductRelation: prefix + '/strategy/productRelation/save', //策略应用-绑定spu
    removeSpu: prefix + '/strategy/productRelation/removeSpu', //策略应用-解绑spu
    queryAllwhite: prefix + '/strategy/white/queryAll', //策略应用-白名单查询
    savewhite: prefix + '/strategy/white/save', //策略应用-白名单添加
    removeItemIdwhite: prefix + '/strategy/white/removeItemId', //策略应用-白名单移除
    queryAllpurview: prefix + '/strategy/purview/queryAll', //策略应用-绑定店铺-查询所有店铺列表
    queryAllstoreRelation: prefix + '/strategy/storeRelation/queryAll', //策略应用-绑定店铺-条件查询已绑定店铺
    saveStoreRelation: prefix + '/strategy/storeRelation/save', //策略应用-绑定店铺-新增
    removeByParm: prefix + '/strategy/storeRelation/removeByParm', //策略应用-绑定店铺-删除
    updateStrategyStatus: prefix + '/strategy/common/updateStrategyStatus', //营销策略-修改禁用状态
    getStatrategyLog: prefix + '/strategy/log/getStrategyLog', //查询策略操作日志
  },
  salePrice: {
    ebayMainList: prefix + '/ebay/storeLinkValuation/list', //主链接视图
    ebaySubList: prefix + '/ebay/storeLinkDetailValuation/list', //子链接视图
    select: prefix + '/dc/priceCalTemplate/select', //获取所有启用模板
    getTemplateInfo: prefix + '/dc/priceCalTemplate/getTemplateInfo', //获取模板信息
    modifyPriceByRule: prefix + '/ebay/storeLinkDetailValuation/modifyPriceByRule', //修改价格
    modifyPriceByRuleForQuery: prefix + '/ebay/storeLinkDetailValuation/modifyPriceByRuleForQuery', //所有结果集修改价格
    showDetail: prefix + '/valuation/detail/showDetail', //查看明细
    getAllCategory: prefix + '/erp/productCategory/getAll', //获取所有产品类目
    getTreeList: prefix + '/erp/productCategory/treeList', //产品类目
    getCommonStoreCategory: prefix + '/ebay/storeCategory/getCommonStoreCategory', //店铺类目
    getAllProductTag: prefix + '/erp/productTag/getAll', //产品标签
    // 主链接
    mainRTemplate: prefix + '/ebay/storeLinkValuation/replaceTemplate', //更换模板(链接)
    mainCdetailValuation: prefix + '/ebay/storeLinkValuation/calLinkValuation', //重新计算(链接)
    mainRtForQuery: prefix + '/ebay/storeLinkValuation/replaceTemplateForQuery', //所有结果集更换模板(主链接)
    mainCdForQuery: prefix + '/ebay/storeLinkValuation/calLinkValuationForQuery', //所有结果集重新计算(主链接)
    // 子链接
    detailRTemplate: prefix + '/ebay/storeLinkDetailValuation/replaceTemplate', //更换模板(链接明细)
    detailCdetailValuation: prefix + '/ebay/storeLinkDetailValuation/calLinkDetailValuation', //重新计算(链接明细)
    detailRtForQuery: prefix + '/ebay/storeLinkDetailValuation/replaceTemplateForQuery', //所有结果集更换模板(子链接)
    detailCdForQuery: prefix + '/ebay/storeLinkDetailValuation/calLinkDetailValuationForQuery', //所有结果集重新计算(子链接)
    detailExport: prefix + '/ebay/storeLinkDetailValuation/export', //所有结果集重新计算(子链接)
    getNotLockPriceNumber: prefix + '/ebay/storeLinkDetailValuation/getNotLockPriceNumber', //获取子链接全量修改价格，未锁定价格数量
    getChildNumber: prefix + '/ebay/storeLinkDetailValuation/getItemSkuNum', // 获取主链接下的子链接数量
    updateContentDisplay: prefix + '/walmart/contentDisplay/updateContentDisplay',//修改自定义列显示与隐藏的设置功能
    queryContentDisplay: prefix + '/walmart/contentDisplay/queryContentDisplay',//查询自定义列显示与隐藏的设置信息
    mainExport: prefix + '/ebay/storeLinkValuation/export',//售价估算-主链接视图导出
  }
}
export default api
