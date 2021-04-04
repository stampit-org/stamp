"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const { get } = Reflect;
/**
 * TODO
 */
const FpConstructor = compose_1.default({
    composers: [
        ((opts) => {
            var _a;
            const optsStamp = get(opts, 'stamp');
            optsStamp.of = optsStamp;
            optsStamp.constructor = optsStamp;
            optsStamp.compose.methods = (_a = optsStamp.compose.methods) !== null && _a !== void 0 ? _a : {};
            optsStamp.compose.methods.constructor = optsStamp;
        }),
    ],
});
exports.default = FpConstructor;
// For CommonJS default export support
module.exports = FpConstructor;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: FpConstructor });
