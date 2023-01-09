"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = __importDefault(require("./object"));
/**
 * Checks if passed argument is considered a descriptor.
 */
// TODO: finer type guard
const isDescriptor = object_1.default;
exports.default = isDescriptor;
// For CommonJS default export support
module.exports = isDescriptor;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isDescriptor });
