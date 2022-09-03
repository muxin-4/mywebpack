class CopyrightWebapckPlugin {
  constructor(options) {
    console.log("CopyrightWebapckPlugin1", options);
  }

  apply(compiler) {
    compiler.hooks.compile.tap("CopyrightWebapckPlugin", (compilation) => {
      console.log("compile");
    });

    compiler.hooks.emit.tapAsync(
      "CopyrightWebapckPlugin",
      (compilation, cb) => {
        debugger;
        console.log("emit", compilation.assets);

        compilation.assets["copyright.txt"] = {
          source: function () {
            return "copyright by wgy";
          },
          size: function () {
            return 21;
          },
        };
        cb();
      }
    );
  }
}

module.exports = CopyrightWebapckPlugin;
