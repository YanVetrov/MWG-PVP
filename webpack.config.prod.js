const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  mode: "production",
  resolve: {
    fallback: {
      crypto: false,
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
    ],
  },
  // optimization: {
  //   minimizer: [
  //     new UglifyJSPlugin({
  //       uglifyOptions: {
  //         output: {
  //           comments: false,
  //         },
  //       },
  //     }),
  //   ],
  // },
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
      template: "build/index.html",
      filename: "index.html",
      hash: true,
      minify: false,
    }),
  ],
};
