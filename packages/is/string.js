"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal Checks if passed argument is considered a `string`.
 */
const isString = (value) => typeof value === 'string';
exports.default = isString;
// For CommonJS default export support
module.exports = isString;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isString });
