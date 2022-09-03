const path = require("path");
const CopyrightWebapckPlugin = require("./plugins/copyright-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    main: "./src/index.js",
  },
  plugins: [
    new CopyrightWebapckPlugin({
        name: 'wgy'
    })
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};
