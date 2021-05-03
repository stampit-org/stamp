import { isArray, isPlainObject } from '@stamp/is';

type AnObject = Record<string, unknown>;

const { defineProperty, get, getOwnPropertyDescriptor, ownKeys, set } = Reflect;

/**
 * @internal
 * The 'src' argument plays the command role.
 * The returned values is always of the same type as the 'src'.
 * @param destination The object to merge into
 * @param source The object to merge from
 * @returns {*}
 */
function mergeOne(destination: AnObject | AnObject[], source: AnObject | AnObject[]): AnObject | AnObject[] {
  if (source !== undefined) {
    // According to specification arrays must be concatenated.
    // Also, the '.concat' creates a new array instance. Overrides the 'dst'.
    if (isArray(source)) return isArray(destination) ? [...destination, ...source] : [...source];

    // Now deal with non plain 'src' object. 'src' overrides 'dst'
    // Note that functions are also assigned! We do not deep merge functions.
    if (isPlainObject(source)) {
      const keys = ownKeys(source);
      for (const key of keys) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const desc = getOwnPropertyDescriptor(source, key)!;
        // Is this a regular property?
        if (getOwnPropertyDescriptor(desc, 'value') === undefined) {
          // Nope, it looks like a getter/setter
          defineProperty(destination, key, desc);
        } else if (desc.value !== undefined) {
          // Do not merge properties with the 'undefined' value.
          const dstValue = get(destination, key);
          const sourceValue: AnObject = get(source, key);
          // Recursive calls to mergeOne() must allow only plain objects or arrays in dst
          const newDst = isPlainObject(dstValue) || isArray(sourceValue) ? (dstValue as AnObject) : {};
          // Deep merge each property. Recursion!
          set(destination, key, mergeOne(newDst, sourceValue));
        }
      }
    } else {
      return source;
    }
  }

  return destination;
}

/**
 * Mutates destination object by deeply merging passed source objects.
 * Arrays are concatenated, not overwritten.
 * Everything else but plain objects are copied by reference.
 *
 * Returns destination object/array or a new object/array in case it was not.
 */
// ! weak types
const merge = <T = AnObject>(dst: AnObject | AnObject[], ...arguments_: Array<unknown | undefined>): T => {
  for (const argument of arguments_ as Array<AnObject | AnObject[]>) {
    dst = mergeOne(dst, argument);
  }

  return dst as T;
};

export default merge;

// For CommonJS default export support
module.exports = merge;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: merge });
