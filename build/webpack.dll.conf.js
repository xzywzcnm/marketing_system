const path = require('path');
const  webpack = require('webpack');
const rm = require('rimraf')
const config = require('../config')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

rm(resolve('build/vendor-manifest.json'), err => {
  if(err) throw err
  console.log('remove vendor-manifest')
})

rm(resolve('static/js/vendor.dll.js'), err => {
  if(err) throw err
  console.log('remove vendor.dll')
})

module.exports = {
    entry: {
      vendor: [
          'vue-router',
          'axios',
          'jsbarcode',
          'file-saver'
        ]
    },
    output: {
      path: path.join(__dirname, '../static/js'),
      filename: '[name].dll.js',
      library: '[name]_library'
    },
    plugins: [
      new webpack.DllPlugin({
        path: path.join(__dirname, '.', '[name]-manifest.json'),
        name: '[name]_library'
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      })
    ]
  };
