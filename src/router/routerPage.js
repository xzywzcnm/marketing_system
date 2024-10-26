//路由入口设置
let routerMaps = [];
// 获取所有 views 目录下 routerConfig.js 文件
const files = require.context('../views/', true, /routerConfig\.js$/);
// 此次不做 API 标识重复判断提示
files.keys().forEach(key => {
  routerMaps = [...routerMaps, ...files(key).default]
})
// 对路由进行排序
routerMaps.sort(function (a, b) {
  return a.sort - b.sort
});
export default routerMaps;
