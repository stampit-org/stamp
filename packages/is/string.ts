/**
 * @internal Checks if passed argument is considered a `string`.
 */
const isString = (value: unknown): value is string => typeof value === 'string';

export default isString;

// For CommonJS default export support
module.exports = isString;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isString });
