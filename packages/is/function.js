"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal Checks if passed argument is considered a `function`.
 */
const isFunction = (value) => typeof value === 'function';
exports.default = isFunction;
// For CommonJS default export support
module.exports = isFunction;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isFunction });
