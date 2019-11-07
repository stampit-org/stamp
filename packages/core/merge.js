'use strict';

const isPlainObject = require('@stamp/is/plain-object');
const isArray = require('@stamp/is/array');
const getOwnPropertyKeys = require('./get-own-property-keys');

const { defineProperty, get, getOwnPropertyDescriptor, set } = Reflect;

/**
 * The 'src' argument plays the command role.
 * The returned values is always of the same type as the 'src'.
 * @param dst The object to merge into
 * @param src The object to merge from
 * @returns {*}
 */
function mergeOne(dst, src) {
  if (src !== undefined) {
    // According to specification arrays must be concatenated.
    // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
    if (isArray(src)) return isArray(dst) ? [...dst, ...src] : [...src];

    // Now deal with non plain 'src' object. 'src' overrides 'dst'
    // Note that functions are also assigned! We do not deep merge functions.
    if (isPlainObject(src)) {
      getOwnPropertyKeys(src).forEach((key) => {
        const desc = getOwnPropertyDescriptor(src, key);
        // is this a regular property?
        if (getOwnPropertyDescriptor(desc, 'value') !== undefined) {
          // Do not merge properties with the 'undefined' value.
          if (desc.value !== undefined) {
            const dstValue = get(dst, key);
            const srcValue = get(src, key);
            // Recursive calls to mergeOne() must allow only plain objects or arrays in dst
            const newDst = isPlainObject(dstValue) || isArray(srcValue) ? dstValue : {};
            // deep merge each property. Recursion!
            set(dst, key, mergeOne(newDst, srcValue));
          }
        } else {
          // nope, it looks like a getter/setter
          defineProperty(dst, key, desc);
        }
      });
    } else {
      return src;
    }
  }

  return dst;
}

const merge = (...args) => args.reduce((dst, arg) => mergeOne(dst, arg));

module.exports = merge;
