"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal Checks if passed argument is considered an `object`.
 */
const isObject = (value) => {
    const type = typeof value;
    return !!value && (type === 'object' || type === 'function');
};
exports.default = isObject;
// For CommonJS default export support
module.exports = isObject;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isObject });
