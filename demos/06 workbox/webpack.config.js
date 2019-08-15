const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

module.exports = env => {
  const mode = env.mode ? env.mode : "production";

  return {
    mode,
    entry: {
      main: "./src/index.js"
    },
    output: {
      filename: "[name].[hash].js",
      path: path.resolve(__dirname, "dist")
    },
    module: {
      rules: [{
        test: /service\-worker\.js/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]'
          }
        }]
      }]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: "./index.html",
        minify: { collapseWhitespace: true, removeComments: true },
        inject: true,
      }),
      new WorkboxWebpackPlugin.InjectManifest({
        swSrc: "./src/service-worker.js",
        swDest: "service-worker.js",
        importWorkboxFrom: 'disabled',
        importScripts: 'https://assets.dianwoda.cn/packages/workbox/v4.3.1/workbox-sw.js'
      })
    ],
    devtool: "source-map",
    devServer: {
      proxy: {
        '/api': 'http://192.168.98.112:8000'
      }
    }
  };
};
