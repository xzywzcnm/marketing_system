const prefix = "/marketing-admin"; // 接口代理前缀
const api = {
  export: {
    reconReportList: prefix + '/exportTask/commonExportTask/list', // 导出查看-查询列表
    downLoadExcel: prefix + '/exportTask/commonExportTask/downLoadExcel', // 导出查看-下载excel
  },
  import: {
    list: prefix + '/common/importTask/list', // 导入列表查询
    // downLoadExcel: prefix + '/exportTask/commonExportTask/downLoadExcel', // 导出查看-下载excel
  },
};
export default api;
