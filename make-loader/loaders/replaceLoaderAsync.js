// 异步Loader
module.exports = function (source) {
  const options = this.getOptions();
  const callback = this.async();

  setTimeout(() => {
    const result = source.replace("dell", options.name);
    console.log("result1", options);
    console.log("result2", result);
    callback(null, result);
  }, 3000);
};

// this.callback(
//   err: Error | null,
//   content: string | Buffer,
//   sourceMap?: SourceMap,
//   meta?: any
// );
