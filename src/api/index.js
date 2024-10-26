//api总入口
import commonApi from './commonApi'; // 通用接口

let apiMaps = {
  ...commonApi,
};
// 获取所有 views 目录下 apiConfig.js 文件
const files = require.context('../views/', true, /apiConfig\.js$/);
// 此次不做 API 标识重复判断提示
files.keys().forEach(key => {
  apiMaps = {
    ...apiMaps,
    ...files(key).default
  }
})

export default apiMaps;
