import { isArray, isPlainObject } from '@stamp/is';

const { defineProperty, get, getOwnPropertyDescriptor, ownKeys, set } = Reflect;

/**
 * The 'src' argument plays the command role.
 * The returned values is always of the same type as the 'src'.
 * @param dst The object to merge into
 * @param src The object to merge from
 * @returns {*}
 */
function mergeOne(dst: object, src: unknown): unknown {
  if (src !== undefined) {
    // According to specification arrays must be concatenated.
    // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
    if (isArray(src)) return isArray(dst) ? [...dst, ...src] : [...src];

    // Now deal with non plain 'src' object. 'src' overrides 'dst'
    // Note that functions are also assigned! We do not deep merge functions.
    if (isPlainObject(src)) {
      const keys = ownKeys(src);
      for (const key of keys) {
        const desc = getOwnPropertyDescriptor(src, key) as PropertyDescriptor;
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
      }
    } else {
      return src;
    }
  }

  return dst;
}

/**
 * Mutates destination object by deeply merging passed source objects.
 * Arrays are concatenated, not overwritten.
 * Everything else but plain objects are copied by reference.
 *
 * Returns destination object/array or a new object/array in case it was not.
 */
export const merge = <T extends object = object>(dst: T, ...args: (object | undefined)[]): T => {
  for (const arg of args) {
    // eslint-disable-next-line no-param-reassign
    dst = mergeOne(dst, arg) as T;
  }
  return dst;
};

export default merge;
