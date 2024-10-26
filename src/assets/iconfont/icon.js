const files = require.context('@/assets/iconfont/', true, /(iconfont|icon)\.(js|css)$/);
let apiMaps = {};
// 过滤以下文件
let ignoreList = ['./icon.js'];
files.keys().forEach(key => {
  if (ignoreList.includes(key)) return;
  apiMaps = {
    ...apiMaps,
    ...files(key).default
  }
})
export default apiMaps;