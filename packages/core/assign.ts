type AnObject = Record<string, unknown>;

const { defineProperty, getOwnPropertyDescriptor, ownKeys } = Reflect;

/** @internal */
const assignOne = (destination: AnObject, source: AnObject | undefined): AnObject => {
  // eslint-disable-next-line eqeqeq, no-eq-null
  if (source != null) {
    // We need to copy regular properties, symbols, getters and setters.
    const keys = ownKeys(source);
    for (const key of keys) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      defineProperty(destination, key, getOwnPropertyDescriptor(source, key)!);
    }
  }

  return destination;
};

/**
 * Mutates destination object with shallow assign of passed source objects. Returns destination object.
 */
// ! weak types
const assign = <T = any>(dst: AnObject, ...arguments_: Array<AnObject | undefined>): T => {
  for (const argument of arguments_) {
    dst = assignOne(dst, argument);
  }

  return dst as T;
};

export default assign;

// For CommonJS default export support
module.exports = assign;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: assign });
