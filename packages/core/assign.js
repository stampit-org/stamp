var getOwnPropertyKeys = require("./get-own-property-keys");

module.exports = function assign(dst, src) {
  if (src != null) {
    // We need to copy regular properties, symbols, getters and setters.
    var keys = getOwnPropertyKeys(src);
    for (var i = 0; i < keys.length; i += 1) {
      var desc = Object.getOwnPropertyDescriptor(src, keys[i]);
      Object.defineProperty(dst, keys[i], desc);
    }
  }

  return dst;
};
