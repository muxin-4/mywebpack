/**
 * 同步Loader
 * 要用函数表达式，因为可以使用this获取上下文
 * 不可以使用箭头函数，this指向的不知道是谁，拿不到上下文
 * @param {*} source 
 * @returns 
 */
module.exports = function (source) {
  // const options = this.getOptions();
  // return source.replace("dell", options.name);
  return source.replace("yaya1", 'world');
};

