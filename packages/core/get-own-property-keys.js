module.exports = function getOwnPropertyKeys(obj) {
  var keys = Object.getOwnPropertyNames(obj);
  if (!Object.getOwnPropertySymbols) return keys;
  return keys.concat(Object.getOwnPropertySymbols(obj));
};
