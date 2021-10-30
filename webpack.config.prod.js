const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const path = require("path");
const CompressionPlugin = require("compression-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { extendDefaultPlugins } = require("svgo");
module.exports = {
  mode: "production",
  resolve: {
    fallback: {
      crypto: false,
    },
    alias: {
      "~": [path.resolve(__dirname, "src/")],
    },
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
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
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
              sourceMap: false,
              esModule: false,
            },
          },
          // uncomment for image optimize
          // {
          //   loader: ImageMinimizerPlugin.loader,
          //   options: {
          //     severityError: "warning",
          //     minimizerOptions: {
          //       plugins: [
          //         ["gifsicle", { interlaced: true }],
          //         ["jpegtran", { progressive: true }],
          //         ["optipng", { optimizationLevel: 5 }],
          //         [
          //           "svgo",
          //           {
          //             plugins: extendDefaultPlugins([
          //               {
          //                 name: "removeViewBox",
          //                 active: false,
          //               },
          //               {
          //                 name: "addAttributesToSVGElement",
          //                 params: {
          //                   attributes: [
          //                     { xmlns: "http://www.w3.org/2000/svg" },
          //                   ],
          //                 },
          //               },
          //             ]),
          //           },
          //         ],
          //       ],
          //     },
          //   },
          // },
        ],
      },
      {
        test: /\.(mp3|ttf)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
              sourceMap: false,
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: false,
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
    new HTMLWebpackPlugin({
      template: "src/index.html",
      filename: "index.html",
      hash: true,
      minify: false,
    }),
    new VueLoaderPlugin(),
    new CompressionPlugin(),
  ],
};
