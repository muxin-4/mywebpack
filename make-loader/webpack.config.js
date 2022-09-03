const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    main: "./src/index.js",
  },
  // resolveLoader: {
  //   modules: ['node_modules', './loaders']
  // },
  module: {
    rules: [
      {
        test: /\.js/,
        /**
         * loader使用顺序，从下到上，从右到左
         */
        use: [
          {
            // loader: 'replaceLoader', // 使用resolveLoaders，就可以省略path.resolve，和下面这行作用 等价
            loader: path.resolve(__dirname, "./loaders/replaceLoader.js"),
          },
          {
            // loader: 'replaceLoaderAsync',
            loader: path.resolve(__dirname, "./loaders/replaceLoaderAsync.js"),
            options: {
              name: "yaya1",
            },
          }
        ],
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};
