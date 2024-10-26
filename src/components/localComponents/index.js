import Vue from 'vue'
// 获取所有组件文件
const files = require.context('../', true, /index\.js$/);
// 挂载自定义组件 sart
const install = (Vue, opts = {}) => {
  if (install.installed) return;
  files.keys().forEach(key => {
    if (key !== './localComponents/index.js' && files(key).default) {
      Vue.component(files(key).default.name, files(key).default);
    }
  })
}
Vue.use(install);
// 挂载自定义组件 end
