/** Workaround for `object` type */
type anyObject = Record<string, unknown>;

const { defineProperty, getOwnPropertyDescriptor, ownKeys } = Reflect;

const assignOne = (destination: anyObject, source: anyObject | undefined): anyObject => {
  // eslint-disable-next-line eqeqeq, no-eq-null
  if (source != null) {
    // We need to copy regular properties, symbols, getters and setters.
    const keys = ownKeys(source);
    for (const key of keys) {
      defineProperty(destination, key, getOwnPropertyDescriptor(source, key)!);
    }
  }

  return destination;
};

/**
 * Mutates destination object with shallow assign of passed source objects. Returns destination object.
 */
const assign = <T extends anyObject = anyObject>(dst: T, ...arguments_: Array<anyObject | undefined>): T => {
  for (const argument of arguments_) {
    dst = assignOne(dst, argument) as T;
  }

  return dst;
};

export default assign;

// For CommonJS default export support
module.exports = assign;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: assign });
