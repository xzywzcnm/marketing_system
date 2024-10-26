'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')
const proxyConfig = require('./proxy.env');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const os = require("os");
const networkInterfaces = os.networkInterfaces();
const ipv4Config = networkInterfaces[Object.keys(networkInterfaces)[0]].find((config) => {
  return config.family === 'IPv4';
});
const ip = ipv4Config ? ipv4Config.address : '0.0.0.0';
const isProd = process.env.NODE_ENV === 'production';
let pakageName = 'marketing';

const fileManagerPlugin = () => {
  return new FileManagerPlugin({
    onEnd:{
      // 创建目录
      // mkdir: [`./dist/${pakageName}`],
      // 将需要打包的文件复制到打包目录
      // copy: [
      //   {source: `./${pakageName}`, destination: `./dist/${pakageName}` }
      // ],
      // 移动单个文件或整个目录
      // move: [],
      // 移除旧压缩包和临时文件夹
      delete:[ `./${pakageName}.zip`],
      // 生成压缩包
      archive: [
        {source: `./${pakageName}`, destination: `./${pakageName}.zip`},
        // {source: `./${pakageName}`, destination: `./${pakageName}.gz`},
      ]
    }
  })
}

module.exports = {
  dev: {
    // Paths
    assetsSubDirectory: 'static',

    assetsPublicPath: '/',
    // 代理
    proxyTable: proxyConfig,
    // Various Dev Server settings
    host: ip, // can be overwritten by process.env.HOST
    port: 8052, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: true,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-
    /**
     * Source Maps
     */
    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,
    cssSourceMap: false
  },
  build: {
    devEnv: require('./dev.env'),
    testEnv: require('./test.env'),
    prodEnv: require('./prod.env'),
    // Template for index.html
    index: path.resolve(__dirname, `../${pakageName}/${pakageName}/index.html`),
    // Paths
    assetsRoot: path.resolve(__dirname, `../${pakageName}/${pakageName}`),
    assetsSubDirectory: 'static',
    assetsPublicPath: './',
    /**
     * Source Maps
     */
    productionSourceMap: true, // 开启后使用静态资源相对路径
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    // bundleAnalyzerReport: process.env.npm_config_report
    bundleAnalyzerReport: false,
    fileManagerPlugin: isProd ? fileManagerPlugin : false
  }
}
