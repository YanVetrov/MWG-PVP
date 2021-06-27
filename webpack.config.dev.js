const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
module.exports = {
  mode: "development",
  devServer: {
    contentBase: "dist",
    port: 3000,
  },
  devtool: "inline-source-map",
  resolve: {
    alias: {
      "~": [path.resolve(__dirname, "src/")],
    },
    fallback: {
      crypto: false,
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/assets",
          to: "assets",
        },
      ],
    }),
    new webpack.ProvidePlugin({
      PIXI: "pixi.js",
    }),
    new HTMLWebpackPlugin({
      template: "build/index.html",
      filename: "index.html",
    }),
  ],
};
