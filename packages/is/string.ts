/**
 * @internal Checks if passed argument is a `string`.
 */
const isString = (value: unknown): value is string => typeof value === 'string';

// For Typescript .d.ts
export default isString;

// For CommonJS default export support
module.exports = isString;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isString });
