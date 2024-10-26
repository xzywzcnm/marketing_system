/*
 * @Author: w
 * @Date: 2021-06-01 14:43:38
 * @LastEditors: w
 * @LastEditTime: 2021-06-21 10:25:32
 */
"use strict";
const merge = require("webpack-merge");
const prodEnv = require("./prod.env");

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  ENV_CONFIG: '"dev"',
  // 系统代码
  SYSTEMCODE: '"marketing-admin"',
  VUE_APP_BROADCASTKEY: '"broadcastMessage"',
  AUTH: '"172.20.200.30:9544/auth"',
  ERP_AUTH: '"172.20.200.30"',
  API_BASE: '"172.20.200.30:9544"', //30
  API_UPMS_BASE: '"172.20.200.30:9544"', // UPMS系统
  // API_BASE: '"172.20.200.116:14102"', // 成龙
  // API_BASE: '"172.20.200.105:14102"', // 伟昊
  // API_BASE: '"172.20.200.103:14102"',//黄磊
  // API_BASE: '"172.20.201.134:14102"' // 邹诗婷
  // API_BASE: '"172.20.201.164:14102"' // 王奕迪
});
