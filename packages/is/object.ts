/** Workaround for `object` type */
type anyObject = Record<string, unknown>;

/**
 * @internal Checks if passed argument is considered an `object`.
 *
 * > Note that functions are `object`s too.
 */
const isObject = (value: unknown): value is anyObject => {
  const type = typeof value;
  return Boolean(value) && (type === 'object' || type === 'function');
};

// For Typescript .d.ts
export default isObject;

// For CommonJS default export support
module.exports = isObject;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isObject });
