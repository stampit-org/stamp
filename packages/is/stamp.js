var isFunction = require('./function');

module.exports = function isStamp(arg) {
  return isFunction(arg) && isFunction(arg.compose);
};
