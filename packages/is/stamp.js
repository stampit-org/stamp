"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const function_1 = __importDefault(require("./function"));
/**
 * Checks if passed argument is a function and has a `.compose()` property.
 */
// TODO: finer type guard
const isStamp = (value) => function_1.default(value) && function_1.default(value.compose);
exports.default = isStamp;
// For CommonJS default export support
module.exports = isStamp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isStamp });
