import babel = require('@babel/core');
import * as fs from 'fs';
import {dirname, relative, resolve} from 'path';

const module = {};
//项目绝对路径
const projectRoot = resolve(__dirname, 'project_1');
//依赖分析结果的类型
type DepRelation = { [key: string]: { deps: string[], code: string } }
//实例化一个分析结果对象
const depRelation: DepRelation = {};

//入口文件名
const filename = 'index.js';
//入口文件绝对路径
const filepath = resolve(projectRoot, filename);
collect(filepath);
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
  if (Object.keys(module).includes(key)) {
    console.warn('存在循环依赖! 依赖为:', key);
    return;
  }
  module[key] = undefined;
  const code = fs.readFileSync(filepath).toString();
  const ast = babel.parse(code, {sourceType: 'module'});
  const {code: es5code} = babel.transformFromAstSync(ast,code,{
    presets:['@babel/preset-env']
  })
  depRelation[key] = {deps: [], code: es5code};
  babel.traverse(ast, {
    enter: item => {
      if (item.node.type === 'ImportDeclaration') {
        //依赖文件的绝对路径 = 入口文件所在文件夹绝对路径 + 依赖文件相对于入口文件的相对路径
        const depAbsolutePath = resolve(dirname(filepath), item.node.source.value);
        //依赖文件相对于项目目录的相对路径
        const depProjectPath = getProjectPath(depAbsolutePath);
        //将依赖存入依赖分析结果
        depRelation[key].deps.push(depProjectPath);
        //递归分析依赖
        collect(depAbsolutePath);
      }
    }
  });
}
