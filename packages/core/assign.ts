const { defineProperty, getOwnPropertyDescriptor, ownKeys } = Reflect;

const assignOne = (destination: object, source: object | undefined): object => {
  if (source != null) {
    // We need to copy regular properties, symbols, getters and setters.
    const keys = ownKeys(source);
    for (const key of keys) {
      defineProperty(destination, key, getOwnPropertyDescriptor(source, key) as PropertyDescriptor);
    }
  }

  return destination;
};

/**
 * Mutates destination object with shallow assign of passed source objects. Returns destination object.
 */
const assign = <T extends object = object>(dst: T, ...arguments_: (object | undefined)[]): T => {
  for (const argument of arguments_) {
    // eslint-disable-next-line no-param-reassign
    dst = assignOne(dst, argument) as T;
  }
  return dst;
};

export default assign;

// For CommonJS default export support
module.exports = assign;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: assign });
