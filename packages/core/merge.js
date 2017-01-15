var isPlainObject = require('@stamp/is/plain-object');
var isObject = require('@stamp/is/object');
var isArray = require('@stamp/is/array');

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

  // See if 'dst' is allowed to be mutated.
  // If not - it's overridden with a new plain object.
  var returnValue = isObject(dst) ? dst : {};

  var keys = Object.keys(src);
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];

    var srcValue = src[key];
    // Do not merge properties with the 'undefined' value.
    if (srcValue !== undefined) {
      var dstValue = returnValue[key];
      // Recursive calls to mergeOne() must allow only plain objects or arrays in dst
      var newDst = isPlainObject(dstValue) || isArray(srcValue) ? dstValue : {};

      // deep merge each property. Recursion!
      returnValue[key] = mergeOne(newDst, srcValue);
    }
  }

  return returnValue;
}

module.exports = function (dst) {
  for (var i = 1; i < arguments.length; i++) {
    dst = mergeOne(dst, arguments[i]);
  }
  return dst;
};
