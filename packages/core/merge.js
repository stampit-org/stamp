var isPlainObject = require('@stamp/is/plain-object');
var isArray = require('@stamp/is/array');
var getOwnPropertyKeys = require("./get-own-property-keys");

/**
 * The 'src' argument plays the command role.
 * The returned values is always of the same type as the 'src'.
 * @param dst The object to merge into
 * @param src The object to merge from
 * @returns {*}
 */
function mergeOne(dst, src) {
  if (src === undefined) return dst;

  // According to specification arrays must be concatenated.
  // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
  if (isArray(src)) return (isArray(dst) ? dst : []).concat(src);

  // Now deal with non plain 'src' object. 'src' overrides 'dst'
  // Note that functions are also assigned! We do not deep merge functions.
  if (!isPlainObject(src)) return src;

  var keys = getOwnPropertyKeys(src);
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    var desc = Object.getOwnPropertyDescriptor(src, key);
    // is this a regular property?
    if (desc.hasOwnProperty('value')) { // eslint-disable-line
      // Do not merge properties with the 'undefined' value.
      if (desc.value === undefined) return dst;

      var srcValue = src[key];
      // Recursive calls to mergeOne() must allow only plain objects or arrays in dst
      var newDst = isPlainObject(dst[key]) || isArray(srcValue) ? dst[key] : {};
      // deep merge each property. Recursion!
      dst[key] = mergeOne(newDst, srcValue);
    } else { // nope, it looks like a getter/setter
      Object.defineProperty(dst, key, desc);
    }
  }

  return dst;
}

module.exports = function (dst) {
  for (var i = 1; i < arguments.length; i++) {
    dst = mergeOne(dst, arguments[i]);
  }
  return dst;
};
