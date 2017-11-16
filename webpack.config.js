var path = require("path");
var webpack = require("webpack");
var BundleTracker = require("webpack-bundle-tracker");

module.exports = {
  context: __dirname,

  entry: "./web/js/index",

  output: {
      path: path.resolve("./assets/"),
      filename: "[name].js",
  },

  plugins: [
    new BundleTracker({filename: "./webpack-stats.json"}),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({PRODUCTION: JSON.stringify(false)})
  ],

  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader"},
        {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          loader: 'url-loader?limit=100000'
        }
    ],
  },

  resolve: {
    modules: ["node_modules"],
    extensions: [".js", ".jsx"]
  },
};
