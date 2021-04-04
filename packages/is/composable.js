"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = __importDefault(require("./object"));
/**
 * Checks if passed argument is considered as composable (i.e. stamp or descriptor).
 */
// More proper implementation would be
// isDescriptor(obj) || isStamp(obj)
// but there is no sense since stamp is function and function is object.
// TODO: finer type guard
const isComposable = object_1.default;
exports.default = isComposable;
// For CommonJS default export support
module.exports = isComposable;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isComposable });
