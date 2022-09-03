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
      // console.log("node1", node);
      const dirname = path.dirname(filename);
      const newFile = "./" + path.join(dirname, node.source.value);
      console.log("dirname1", dirname);
      console.log("newFile1", newFile);
      dependencies[node.source.value] = newFile;
    },
  });

  console.log("dependencies1", dependencies);

  // console.log("ast1", ast.program.body);

  // console.log("content", content);

  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });

  console.log("code1", code);
  return {
    filename,
    dependencies,
    code,
  };
};

const moduleInfo = moduleAnalyser("./src/index.js");
console.log("moduleInfo", moduleInfo);
