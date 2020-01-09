const { isArray: isarray } = Array;

/**
 * @internal Checks if passed argument is considered an array.
 */
const isArray = isarray;

export default isArray;

// For CommonJS default export support
module.exports = isArray;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isArray });
