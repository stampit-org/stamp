"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const core_1 = require("@stamp/core");
const is_1 = require("@stamp/is");
const { defineProperty, get, ownKeys, set } = Reflect;
const dedupe = (array) => [...new Set(array)];
const makeProxyFunction = (functions, name) => {
    function deferredFn(...args) {
        return [...functions.map((func) => func.apply(this, [...args]))];
    }
    defineProperty(deferredFn, 'name', { value: name, configurable: true });
    return deferredFn;
};
const getSettings = (descriptor) => { var _a; return (_a = descriptor === null || descriptor === void 0 ? void 0 : descriptor.deepConfiguration) === null || _a === void 0 ? void 0 : _a.Collision; };
const checkIf = (descriptor, setting, methodName) => {
    const settings = getSettings(descriptor);
    const settingsFor = settings && get(settings, setting);
    return (0, is_1.isArray)(settingsFor) && settingsFor.indexOf(methodName) >= 0;
};
const isForbidden = (descriptor, methodName) => {
    var _a;
    return ((_a = getSettings(descriptor)) === null || _a === void 0 ? void 0 : _a.forbidAll)
        ? !checkIf(descriptor, 'allow', methodName)
        : checkIf(descriptor, 'forbid', methodName);
};
const isDeferred = (descriptor, methodName) => checkIf(descriptor, 'defer', methodName);
const setMethodsMetadata = (opts, methodsMetadata) => {
    const { methods } = opts.stamp.compose;
    const setMethodCallback = (key) => {
        const metadata = get(methodsMetadata, key);
        const value = 
        // eslint-disable-next-line no-nested-ternary
        (0, is_1.isArray)(metadata)
            ? metadata.length === 1
                ? // Some collisions aggregated to a single method
                    // Mutating the resulting stamp
                    metadata[0]
                : makeProxyFunction(metadata, key)
            : metadata;
        set(methods, key, value);
    };
    ownKeys(methodsMetadata).forEach(setMethodCallback);
};
const removeDuplicates = (settings) => {
    if ((0, is_1.isArray)(settings.defer))
        set(settings, 'defer', dedupe(settings.defer));
    if ((0, is_1.isArray)(settings.forbid))
        set(settings, 'forbid', dedupe(settings.forbid));
    if ((0, is_1.isArray)(settings.allow))
        set(settings, 'allow', dedupe(settings.allow));
};
const throwIfAmbiguous = (settings) => {
    if ((0, is_1.isArray)(settings.forbid)) {
        const intersect = (value) => settings.forbid.indexOf(value) >= 0;
        const deferredAndForbidden = (0, is_1.isArray)(settings.defer) ? settings.defer.filter(intersect) : [];
        if (deferredAndForbidden.length > 0) {
            throw new Error(`Ambiguous Collision settings. [${deferredAndForbidden.join(', ')}] both deferred and forbidden`);
        }
        const allowedAndForbidden = (0, is_1.isArray)(settings.allow) ? settings.allow.filter(intersect) : [];
        if (allowedAndForbidden.length > 0) {
            throw new Error(`Ambiguous Collision settings. [${allowedAndForbidden.join(', ')}] both allowed and forbidden`);
        }
    }
};
const throwIfForbiddenOrAmbiguous = (existingMetadata, descriptor, composable, methodName) => {
    // Process Collision.forbid
    if (existingMetadata && isForbidden(descriptor, methodName)) {
        throw new Error(`Collision of method \`${String(methodName)}\` is forbidden`);
    }
    // Process Collision.defer
    if (isDeferred(composable, methodName)) {
        if (existingMetadata && !(0, is_1.isArray)(existingMetadata)) {
            throw new Error(`Ambiguous Collision settings. The \`${String(methodName)}\` is both deferred and regular`);
        }
        // Process no Collision settings
    }
    else if ((0, is_1.isArray)(existingMetadata)) {
        // TODO: update error message below
        throw new Error(`Ambiguous Collision settings. The \`${String(methodName)}\` is both deferred and regular`);
    }
};
const composer = (opts) => {
    const descriptor = opts.stamp.compose;
    const settings = getSettings(descriptor);
    if ((0, is_1.isObject)(settings)) {
        // Deduping is an important part of the logic
        removeDuplicates(settings);
        // Make sure settings are not ambiguous
        throwIfAmbiguous(settings);
        if (settings.forbidAll ||
            ((0, is_1.isArray)(settings.defer) && settings.defer.length > 0) ||
            ((0, is_1.isArray)(settings.forbid) && settings.forbid.length > 0)) {
            const methodsMetadata = {}; // methods aggregation
            const getCallbackFor = (composable) => (methodName) => {
                const method = get(composable.methods, methodName);
                const existingMetadata = get(methodsMetadata, methodName);
                throwIfForbiddenOrAmbiguous(existingMetadata, descriptor, composable, methodName);
                let value = method;
                // Process Collision.defer
                if (isDeferred(composable, methodName)) {
                    const arr = existingMetadata || [];
                    arr.push(method);
                    value = arr;
                }
                set(methodsMetadata, methodName, value);
            };
            opts.composables
                .map((composable) => ((0, is_1.isStamp)(composable) ? composable.compose : composable))
                .filter((composable) => (0, is_1.isObject)(composable.methods))
                .forEach((composable) => {
                const { methods } = composable;
                const setMethodCallback = getCallbackFor(composable);
                ownKeys(methods)
                    .filter((methodName) => {
                    const method = get(methods, methodName);
                    const existingMetadata = get(methodsMetadata, methodName);
                    // Checking by reference if the method is already present
                    return (method !== undefined &&
                        (existingMetadata === undefined ||
                            (existingMetadata !== method &&
                                (!(0, is_1.isArray)(existingMetadata) || existingMetadata.indexOf(method) === -1))));
                })
                    .forEach(setMethodCallback);
            });
            setMethodsMetadata(opts, methodsMetadata);
        }
    }
};
/**
 * TODO
 */
const Collision = (0, compose_1.default)({
    deepConfiguration: { Collision: { defer: [], forbid: [] } },
    staticProperties: {
        collisionSetup(opts) {
            return ((this === null || this === void 0 ? void 0 : this.compose) ? this : Collision).compose({
                deepConfiguration: { Collision: opts },
            });
        },
        collisionSettingsReset() {
            return this.collisionSetup(null);
        },
        collisionProtectAnyMethod(opts) {
            return this.collisionSetup((0, core_1.assign)({}, opts, { forbidAll: true }));
        },
    },
    composers: [composer],
});
exports.default = Collision;
// For CommonJS default export support
module.exports = Collision;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Collision });
