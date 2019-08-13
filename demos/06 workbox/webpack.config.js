const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
// const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

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
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: "./index.html",
        minify: { collapseWhitespace: true, removeComments: true },
        inject: true,
      }),
      // new WorkboxWebpackPlugin.InjectManifest({
      //   swSrc: "./src/src-sw.js",
      //   swDest: "sw.js"
      // })
    ],
    devtool: "source-map",
    // devServer: {
    //   publicPath: '/public',
    //   hot: true
    // }
  };
};
