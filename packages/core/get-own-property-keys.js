"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ownKeys } = Reflect;
/** @deprecated Use Reflect.ownKeys() instead */
const getOwnPropertyKeys = ownKeys;
exports.default = getOwnPropertyKeys;
// For CommonJS default export support
module.exports = getOwnPropertyKeys;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: getOwnPropertyKeys });
