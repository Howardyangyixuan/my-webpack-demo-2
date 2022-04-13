import babel = require('@babel/core');
import * as fs from 'fs';
import {dirname, relative, resolve} from 'path';
import {writeFileSync} from 'fs';
import {exec} from 'child_process';

//已经加载（运行过）的模块
const modules = {}
//项目绝对路径
const projectRoot = resolve(__dirname, 'project_1');
//依赖分析结果的类型
type DepRelation = { key: string, deps: string[], code:string}
//实例化一个分析结果对象
const depRelation: DepRelation[] = [];

//入口文件名
const filename = 'index.js';
//入口文件绝对路径
const filepath = resolve(projectRoot, filename);
collect(filepath);

function generateCode() {
  let code = "";
  //依赖对象部分
  code += "var depRelation = [" + depRelation.map((item)=>{
    const {key, deps, code} = item
    return `{
    key: ${JSON.stringify(key)},
    deps: ${JSON.stringify(deps)},
    code: function(require, module, exports){
      ${code}
    }}
    `
  }).join(',') + '];\n'
  //函数的执行以及函数的定义
  code += "var modules = {};\n"
  code += "execute(depRelation[0].key);\n"
  code += `
  function execute(key) {
  // 如果已经 require 过，就直接返回上次的结果
  if (modules[key]) { return modules[key] }
  // 找到要执行的项目
  var item = depRelation.find(i => i.key === key)
  // 找不到就报错，中断执行
  if (!item) { throw new Error(\`\${item} is not found\`) }
  // 把相对路径变成项目路径
  var pathToKey = (path) => {
    var dirname = key.substring(0, key.lastIndexOf('/') + 1)
    var projectPath = (dirname + path).replace(\/\\.\\\/\/g, '').replace(\/\\\/\\\/\/, '/')
    return projectPath
  }
  // 创建 require 函数
  var require = (path) => {
    return execute(pathToKey(path))
  }
  // 初始化当前模块
  modules[key] = { __esModule: true }
  // 初始化 module 方便 code 往 module.exports 上添加属性
  var module = { exports: modules[key] }
  // 调用 code 函数，往 module.exports 上添加导出属性
  // 第二个参数 module 大部分时候是无用的，主要用于兼容旧代码
  item.code(require, module, module.exports)
  // 返回当前模块
  return modules[key]
}
  `
  return code
}

writeFileSync('dist.js',generateCode());
console.log(depRelation);
console.log('done');

//获取path相对于项目目录的相对路径
function getProjectPath(path: string) {
  return relative(projectRoot, path);
}

//依赖分析
function collect(filepath: string) {
  //入口文件相对路径
  const key = getProjectPath(filepath);
  if (depRelation.find(i=>i.key===key)) {
    console.warn('存在循环依赖! 依赖为:', key);
    return;
  }
  const code = fs.readFileSync(filepath).toString();
  const ast = babel.parse(code, {sourceType: 'module'});
  const {code: es5code} = babel.transformFromAstSync(ast,code,{
    presets:['@babel/preset-env']
  })
  const dep = {key,deps: [], code: es5code}
  depRelation.push(dep);
  babel.traverse(ast, {
    enter: item => {
      if (item.node.type === 'ImportDeclaration') {
        //依赖文件的绝对路径 = 入口文件所在文件夹绝对路径 + 依赖文件相对于入口文件的相对路径
        const depAbsolutePath = resolve(dirname(filepath), item.node.source.value);
        //依赖文件相对于项目目录的相对路径
        const depProjectPath = getProjectPath(depAbsolutePath);
        //将依赖存入依赖分析结果
          dep.deps.push(depProjectPath);
        //递归分析依赖
        collect(depAbsolutePath);
      }
    }
  });
}

