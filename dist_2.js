var depRelation = [{
    key: "index.js",
    deps: ["a.js","b.js"],
    code: function(require, module, exports){
      "use strict";

var _a = _interopRequireDefault(require("./a.js"));

var _b = _interopRequireDefault(require("./b.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log(_a["default"].value + _b["default"].value);
    }}
    ,{
    key: "a.js",
    deps: ["dir/a2.js"],
    code: function(require, module, exports){
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _a = _interopRequireDefault(require("./dir/a2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var a = {
  value: 1,
  value2: _a["default"]
};
var _default = a;
exports["default"] = _default;
    }}
    ,{
    key: "dir/a2.js",
    deps: ["dir/dir_in_dir/a3.js"],
    code: function(require, module, exports){
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _a = _interopRequireDefault(require("./dir_in_dir/a3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var a2 = {
  value: 12,
  value3: _a["default"]
};
var _default = a2;
exports["default"] = _default;
    }}
    ,{
    key: "dir/dir_in_dir/a3.js",
    deps: [],
    code: function(require, module, exports){
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var a3 = {
  value: 123
};
var _default = a3;
exports["default"] = _default;
    }}
    ,{
    key: "b.js",
    deps: ["dir/b2.js"],
    code: function(require, module, exports){
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _b = _interopRequireDefault(require("./dir/b2.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var b = {
  value: 2,
  value2: _b["default"]
};
var _default = b;
exports["default"] = _default;
    }}
    ,{
    key: "dir/b2.js",
    deps: ["dir/dir_in_dir/b3.js"],
    code: function(require, module, exports){
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _b = _interopRequireDefault(require("./dir_in_dir/b3.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var b2 = {
  value: 22,
  value3: _b["default"]
};
var _default = b2;
exports["default"] = _default;
    }}
    ,{
    key: "dir/dir_in_dir/b3.js",
    deps: [],
    code: function(require, module, exports){
      "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var b3 = {
  value: 123
};
var _default = b3;
exports["default"] = _default;
    }}
    ];
var modules = {};
execute(depRelation[0].key);

  function execute(key) {
  // 如果已经 require 过，就直接返回上次的结果
  if (modules[key]) { return modules[key] }
  // 找到要执行的项目
  var item = depRelation.find(i => i.key === key)
  // 找不到就报错，中断执行
  if (!item) { throw new Error(`${item} is not found`) }
  // 把相对路径变成项目路径
  var pathToKey = (path) => {
    var dirname = key.substring(0, key.lastIndexOf('/') + 1)
    var projectPath = (dirname + path).replace(/\.\//g, '').replace(/\/\//, '/')
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
console.log(modules);
  