"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const core_1 = require("@stamp/core");
const is_1 = require("@stamp/is");
const { get, ownKeys, set } = Reflect;
const initializer = function initializer(opts, ref) {
    if ((0, is_1.isObject)(opts)) {
        const { deepConfiguration } = ref.stamp.compose;
        const keysToAssign = deepConfiguration === null || deepConfiguration === void 0 ? void 0 : deepConfiguration.ArgOverProp;
        if (keysToAssign === null || keysToAssign === void 0 ? void 0 : keysToAssign.length) {
            keysToAssign.forEach((key) => {
                const incomingValue = get(opts, key);
                if (incomingValue !== undefined) {
                    set(this, key, incomingValue);
                }
            });
        }
    }
};
const dedupe = (array) => [...new Set(array)];
/**
 * TODO
 */
const ArgOverProp = (0, compose_1.default)({
    staticProperties: {
        argOverProp(...args) {
            let propNames = [];
            let defaultProps;
            args.forEach((arg) => {
                if ((0, is_1.isString)(arg)) {
                    propNames.push(arg);
                }
                else if ((0, is_1.isArray)(arg)) {
                    propNames = [...propNames, ...arg.filter(is_1.isString)];
                }
                else if ((0, is_1.isObject)(arg)) {
                    defaultProps = (0, core_1.assign)(defaultProps || {}, arg);
                    propNames = [...propNames, ...ownKeys(arg)];
                }
            });
            const localStamp = ((this === null || this === void 0 ? void 0 : this.compose) ? this : ArgOverProp);
            return localStamp.compose({
                deepConfiguration: { ArgOverProp: propNames },
                properties: defaultProps, // default property values
            });
        },
    },
    initializers: [initializer],
    composers: [
        ((opts) => {
            const descriptor = opts.stamp.compose;
            const { initializers } = descriptor;
            // Always keep our initializer the first
            initializers.splice(initializers.indexOf(initializer), 1);
            initializers.unshift(initializer);
            const { deepConfiguration } = descriptor;
            const propNames = deepConfiguration === null || deepConfiguration === void 0 ? void 0 : deepConfiguration.ArgOverProp;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if ((0, is_1.isArray)(propNames))
                deepConfiguration.ArgOverProp = dedupe(propNames);
        }),
    ],
});
exports.default = ArgOverProp;
// For CommonJS default export support
module.exports = ArgOverProp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ArgOverProp });
