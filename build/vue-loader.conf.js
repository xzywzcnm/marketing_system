'use strict'
const utils = require('./utils')
const config = require('../config')
// const isProduction = process.env.NODE_ENV === 'production'

const isProduction = ['production', 'development', 'testing', 'presentation'].includes(process.env.NODE_ENV)
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
