/**
 * @internal Checks if passed argument is considered an `object`.
 */
const isObject = (value: unknown): value is object => {
  const type = typeof value;
  return !!value && (type === 'object' || type === 'function');
};

export default isObject;

// For CommonJS default export support
module.exports = isObject;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isObject });
