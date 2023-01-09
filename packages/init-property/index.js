"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const is_1 = require("@stamp/is");
const { get, ownKeys, set } = Reflect;
const initializer = function initializer(opts, ref) {
    const args = ref.args.slice();
    ownKeys(this).forEach((key) => {
        const stamp = get(this, key);
        if ((0, is_1.isStamp)(stamp)) {
            args[0] = opts === null || opts === void 0 ? void 0 : opts[key];
            set(this, key, stamp(...args));
        }
    });
};
/**
 * TODO
 */
const InitProperty = (0, compose_1.default)({
    initializers: [initializer],
    composers: [
        (opts) => {
            const { initializers } = opts.stamp.compose;
            initializers.splice(initializers.indexOf(initializer), 1);
            initializers.unshift(initializer);
        },
    ],
});
exports.default = InitProperty;
// For CommonJS default export support
module.exports = InitProperty;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: InitProperty });
