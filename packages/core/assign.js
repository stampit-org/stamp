"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { defineProperty, getOwnPropertyDescriptor, ownKeys } = Reflect;
const assignOne = (dst, src) => {
    if (src != null) {
        // We need to copy regular properties, symbols, getters and setters.
        const keys = ownKeys(src);
        for (const key of keys) {
            defineProperty(dst, key, getOwnPropertyDescriptor(src, key));
        }
    }
    return dst;
};
/**
 * Mutates destination object with shallow assign of passed source objects. Returns destination object.
 */
const assign = (dst, ...args) => {
    for (const arg of args) {
        // eslint-disable-next-line no-param-reassign
        dst = assignOne(dst, arg);
    }
    return dst;
};
exports.default = assign;
// For CommonJS default export support
module.exports = assign;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: assign });
