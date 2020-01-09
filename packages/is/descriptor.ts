import isObject from './object';

/**
 * Checks if passed argument is considered a descriptor.
 */
// TODO: finer type guard
const isDescriptor = isObject;

export default isDescriptor;

// For CommonJS default export support
module.exports = isDescriptor;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isDescriptor });
