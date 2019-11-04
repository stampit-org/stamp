var getOwnPropertyKeys = require("./get-own-property-keys");

function assignOne(dst, src) {
  if (src != null) {
    // We need to copy regular properties, symbols, getters and setters.
    var keys = getOwnPropertyKeys(src);
    for (var i = 0; i < keys.length; i += 1) {
      var desc = Object.getOwnPropertyDescriptor(src, keys[i]);
      Object.defineProperty(dst, keys[i], desc);
    }
  }

  return dst;
}

module.exports = function(dst) {
  for (var i = 1; i < arguments.length; i++) {
    dst = assignOne(dst, arguments[i]);
  }
  return dst;
};
