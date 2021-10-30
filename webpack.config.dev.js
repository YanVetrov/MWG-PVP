const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const path = require("path");
const webpack = require("webpack");
module.exports = {
  mode: "development",
  devServer: {
    contentBase: "dist",
    port: 3000,
  },
  resolve: {
    alias: {
      "~": [path.resolve(__dirname, "src/")],
    },
    fallback: {
      crypto: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "vue-style-loader",
            options: { sourceMap: false },
          },
          {
            loader: "css-loader",
            options: { sourceMap: false },
          },
        ],
      },
      // {
      //   test: /\.(png|jpg|gif|mp3|ttf|svg)$/i,
      //   use: [
      //     {
      //       loader: "url-loader",
      //       options: {
      //         name: "[path][name].[ext]",
      //         sourceMap: false,
      //         esModule: false,
      //         publicPath: "/",
      //       },
      //     },
      //   ],
      // },
      {
        test: /\.(png|jpg|jpeg|gif|mp3|ttf|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
              sourceMap: false,
              esModule: false,
            },
          },
        ],
      },
    ],
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
      template: "src/index.html",
      filename: "index.html",
    }),
    new VueLoaderPlugin(),
  ],
};
