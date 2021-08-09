/**
 * @internal Checks if passed argument is considered an array.
 */
// eslint-disable-next-line prefer-destructuring
const isArray = Array.isArray; // JSDoc is lost with destructuring

export default isArray;

// For CommonJS default export support
module.exports = isArray;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isArray });
