const { prototype } = Object;
const { getPrototypeOf } = Reflect;

/**
 * @internal Checks if passed argument is a plain old javascrip object (POJO).
 */
const isPlainObject = (value: unknown): value is {} =>
  !!value && typeof value === 'object' && getPrototypeOf(value as {}) === prototype;

export default isPlainObject;

// For CommonJS default export support
module.exports = isPlainObject;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isPlainObject });
