"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const { defineProperty, set } = Reflect;
const stampSymbol = Symbol.for('stamp');
/**
 * TODO
 */
const InstanceOf = (0, compose_1.default)({
    methods: {},
    composers: [
        ({ stamp }) => {
            // Attaching to object prototype to save memory
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            set(stamp.compose.methods, stampSymbol, stamp);
            defineProperty(stamp, Symbol.hasInstance, {
                value(obj) {
                    return obj && obj[stampSymbol] === stamp;
                },
            });
        },
    ],
});
exports.default = InstanceOf;
// For CommonJS default export support
module.exports = InstanceOf;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: InstanceOf });
