const { getPrototypeOf, prototype } = Object;

/**
 * @internal Checks if passed argument is a plain old javascript object (POJO).
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const isPlainObject = (value: unknown): value is object => {
  if (prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const unknownPrototype = getPrototypeOf(value);
  return unknownPrototype === null || unknownPrototype === prototype;
};

// For Typescript .d.ts
export default isPlainObject;

// For CommonJS default export support
module.exports = isPlainObject;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isPlainObject });
