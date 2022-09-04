const fs = require("fs");
const path = require("path");
const paser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

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

const makeDependenciesGraph = (entry) => {
  const entryModule = moduleAnalyser(entry);

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

const generateCode = (entry) => {
  const graph = JSON.stringify(makeDependenciesGraph(entry));
  return `
  (function(graph){
    function require(module) {
      function localRequire(relativePath) {
        // ./message.js
        return require(graph[module].dependencies[relativePath]);
      }

      var exports = {};

      (function(require, exports, code) {
        eval(code)
      })(localRequire, exports, graph[module].code)
      
      return exports;
    };

    require('${entry}')
  })(${graph})
  `;
};

const code = generateCode("./src/index.js");
console.log("code", code);
