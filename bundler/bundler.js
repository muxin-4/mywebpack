const fs = require("fs");
const path = require("path");
const paser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

/**
 * 单个模块分析
 *
 * 返回 文件名、依赖文件、代码
 *
 * @param {*} filename
 * @returns
 */
const moduleAnalyser = (filename) => {
  const content = fs.readFileSync(filename, "utf-8");
  const ast = paser.parse(content, {
    sourceType: "module",
  });

  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename);
      const newFile = "./" + path.join(dirname, node.source.value);
      dependencies[node.source.value] = newFile;
    },
  });

  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  return {
    filename,
    dependencies,
    code,
  };
};

/**
 * 生成代码图谱
 * @param {*} entry
 * @returns
 */
const makeDependenciesGraph = (entry) => {
  const entryModule = moduleAnalyser(entry);
  // 打印entryModule如下
  // {
  //   filename: './src/index.js',
  //   dependencies: { './message.js': './src/message.js' },
  //   code: '"use strict";\n' +
  //     '\n' +
  //     'var _message = _interopRequireDefault(require("./message.js"));\n' +
  //     '\n' +
  //     'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
  //     '\n' +
  //     'console.log(_message["default"]);'
  // }

  // 使用数组实现递归
  const graghArray = [entryModule];
  for (let i = 0; i < graghArray.length; i++) {
    const item = graghArray[i];

    const { dependencies } = item;
    if (dependencies) {
      for (let j in dependencies) {
        graghArray.push(moduleAnalyser(dependencies[j]));
      }
    }
  }

  const graph = {};
  graghArray.forEach((item) => {
    graph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code,
    };
  });

  return graph;
};

/**
 * 生成代码
 * @param {*} entry
 * @returns
 */
const generateCode = (entry) => {
  /**
   * 使用JSON.stringfy()的原因是:
   * 最下面return了一个字符串，makeDependenciesGraph(entry)是一个对象
   * 对象传到字符串中，会转化为[object object]，所以用JSON.stringfy()把对象转为字符串后，再传递进字符串中
   */
  const graph = JSON.stringify(makeDependenciesGraph(entry));

  // 打印makeDependenciesGraph(entry)如下
  // {
  //   './src/index.js': {
  //     dependencies: { './message.js': './src/message.js' },
  //     code: '"use strict";\n' +
  //       '\n' +
  //       'var _message = _interopRequireDefault(require("./message.js"));\n' +    // 浏览器中没有require，require无法直接在浏览器上运行
  //       '\n' +
  //       'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
  //       '\n' +
  //       'console.log(_message["default"]);'
  //   },
  //   './src/message.js': {
  //     dependencies: { './word.js': './src/word.js' },
  //     code: '"use strict";\n' +
  //       '\n' +
  //       'Object.defineProperty(exports, "__esModule", {\n' +
  //       '  value: true\n' +
  //       '});\n' +
  //       'exports["default"] = void 0;\n' +
  //       '\n' +
  //       'var _word = require("./word.js");\n' +
  //       '\n' +
  //       'var message = "say ".concat(_word.word);\n' +
  //       'var _default = message;\n' +
  //       'exports["default"] = _default;'
  //   },
  //   './src/word.js': {
  //     dependencies: {},
  //     code: '"use strict";\n' +
  //       '\n' +
  //       'Object.defineProperty(exports, "__esModule", {\n' +    // 浏览器中没有exports，exports无法直接在浏览器上运行
  //       '  value: true\n' +
  //       '});\n' +
  //       'exports.word = void 0;\n' +
  //       'var word = "hello";\n' +
  //       'exports.word = word;'
  //   }
  // }

  // return的是编译后的代码
  return `
  (function(graph){ // 使用闭包，防止污染全局环境
    function require(module) {
      function localRequire(relativePath) { // 相对路径转换为绝对路径
        // ./message.js
        return require(graph[module].dependencies[relativePath]);
      }

      var exports = {};
      (function(require, exports, code) { // 模块代码放在闭包中执行，这样模块代码不会影像外部代码
        eval(code)
      })(localRequire, exports, graph[module].code)
      return exports;
    };

    require('${entry}') // entry加引号的原因，因为是拼接一段js代码，而不是运行一段js代码

  })(${graph})
  `;
};

const code = generateCode("./src/index.js");
console.log("code", code);
