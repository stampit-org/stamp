"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.required = void 0;
/* eslint @typescript-eslint/no-use-before-define: ["error", { "variables": false }] */
const compose_1 = __importDefault(require("@stamp/compose"));
const core_1 = require("@stamp/core");
const is_1 = require("@stamp/is");
const { freeze } = Object;
const { get, ownKeys } = Reflect;
exports.required = function required(settings) {
    const localStamp = this ? this : Required;
    const { deepConfiguration } = localStamp.compose;
    const prevSettings = deepConfiguration === null || deepConfiguration === void 0 ? void 0 : deepConfiguration.Required;
    // filter out non stamp things
    const newSettings = core_1.assign({}, compose_1.default(prevSettings, settings).compose);
    return localStamp.compose({ deepConfiguration: { Required: newSettings } });
};
freeze(exports.required);
const checkDescriptorHaveThese = (descriptor, settings) => {
    if (descriptor && settings) {
        // Traverse settings and find if there is anything required.
        const settingsKeys = ownKeys(settings);
        for (const settingsKey of settingsKeys) {
            const settingsValue = get(settings, settingsKey);
            if (is_1.isObject(settingsValue)) {
                const metadataKeys = ownKeys(settingsValue);
                for (const metadataKey of metadataKeys) {
                    const metadataValue = get(settingsValue, metadataKey);
                    if (metadataValue === Required || metadataValue === exports.required) {
                        // We found one thing which have to be provided. Let's check if it exists.
                        const descValue = get(descriptor, settingsKey);
                        if (!descValue || get(descValue, metadataKey) === undefined) {
                            throw new Error(`Required: There must be ${String(metadataKey)} in this stamp ${String(settingsKey)}`);
                        }
                    }
                }
            }
        }
    }
};
/**
 * TODO
 */
const Required = compose_1.default({
    initializers: [
        (_, opts) => {
            const descriptor = opts.stamp.compose;
            const { deepConfiguration } = descriptor;
            const settings = deepConfiguration === null || deepConfiguration === void 0 ? void 0 : deepConfiguration.Required;
            checkDescriptorHaveThese(descriptor, settings);
        },
    ],
    staticProperties: {
        required: exports.required,
    },
});
exports.default = Required;
// For CommonJS default export support
module.exports = Required;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Required });
// Now is the time to freeze
freeze(Required);
