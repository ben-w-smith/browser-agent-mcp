const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    background: "./src/extension/background/index.ts",
    "content-script": "./src/extension/content/index.ts",
    popup: "./src/extension/popup/index.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist/extension"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/extension/manifest.json",
          to: "manifest.json",
        },
        {
          from: "src/extension/popup/popup.html",
          to: "popup.html",
        },
        {
          from: "src/extension/devtools.html",
          to: "devtools.html",
        },
        {
          from: "src/extension/devtools-panel.html",
          to: "devtools-panel.html",
        },
        {
          from: "src/extension/devtools.js",
          to: "devtools.js",
        },
        {
          from: "src/extension/devtools-panel.js",
          to: "devtools-panel.js",
        },
      ],
    }),
  ],
};
