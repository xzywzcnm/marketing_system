'use strict'
const PROXY_URL = {
  dev: 'http://172.20.200.30:9544',
  uat: 'http://dyterp.pyl.com.cn',
  prod: 'https://ierp.tongtool.com',
  jy: 'http://172.20.200.102:14102',
  cs: 'http://172.20.201.185:14102',
}

module.exports = {
  // '/': {
  //   target: PROXY_URL.dev,
  //   changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
  //   logLevel: 'debug',
  //   pathRewrite: {
  //     '^/': ''
  //   }
  // }
}
