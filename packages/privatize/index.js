"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const { defineProperty, get, ownKeys, set } = Reflect;
const stampSymbol = Symbol.for('stamp');
const privates = new WeakMap(); // WeakMap works in IE11, node 0.12
const makeProxyFunction = function makeProxyFunction(fn, name) {
    function proxiedFn(...args) {
        return fn.apply(privates.get(this), args);
    }
    defineProperty(proxiedFn, 'name', {
        value: name,
        configurable: true,
    });
    return proxiedFn;
};
const initializer = function initializer(_, opts) {
    const descriptor = opts.stamp.compose;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const privateMethodKeys = descriptor.deepConfiguration.Privatize.methods;
    const newObject = {}; // our proxy object
    privates.set(newObject, this);
    const { methods } = descriptor;
    if (methods) {
        ownKeys(methods).forEach((name) => {
            if (privateMethodKeys.indexOf(name) < 0) {
                // not private, thus wrap
                set(newObject, name, makeProxyFunction(get(methods, name), name));
            }
        });
        // Integration with @stamp/instanceof
        if (get(methods, stampSymbol))
            set(newObject, stampSymbol, opts.stamp);
    }
    return newObject;
};
/**
 * TODO
 */
const Privatize = compose_1.default({
    initializers: [initializer],
    deepConfiguration: { Privatize: { methods: [] } },
    staticProperties: {
        privatizeMethods(...args) {
            const methodNames = [];
            args.forEach((arg) => {
                if (typeof arg === 'string' && arg.length > 0) {
                    methodNames.push(arg);
                }
            });
            return ((this === null || this === void 0 ? void 0 : this.compose) ? this : Privatize).compose({
                deepConfiguration: {
                    Privatize: {
                        methods: methodNames,
                    },
                },
            });
        },
    },
    composers: [
        ((opts) => {
            const { initializers } = opts.stamp.compose;
            // Keep our initializer the last to return proxy object
            initializers.splice(initializers.indexOf(initializer), 1);
            initializers.push(initializer);
        }),
    ],
});
exports.default = Privatize;
// For CommonJS default export support
module.exports = Privatize;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Privatize });
