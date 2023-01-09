"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@stamp/core");
const is_1 = require("@stamp/is");
const { defineProperties } = Object;
const { get, set } = Reflect;
const createFactory = () => {
    return function Stamp(options = {}, ...moreArgs) {
        const descriptor = Stamp.compose || {};
        const { methods, properties, deepProperties, propertyDescriptors, initializers } = descriptor;
        // Next line was optimized for most JS VMs. Please, be careful here!
        let instance = { __proto__: methods };
        // let obj = {};
        // if (methods) setPrototypeOf(obj, methods);
        (0, core_1.merge)(instance, deepProperties);
        (0, core_1.assign)(instance, properties);
        defineProperties(instance, propertyDescriptors || {});
        if (initializers && initializers.length > 0) {
            let returnedValue;
            const args = [options, ...moreArgs];
            for (const initializer of initializers) {
                if ((0, is_1.isFunction)(initializer)) {
                    returnedValue = initializer.call(instance, options, {
                        instance,
                        stamp: Stamp,
                        args,
                    });
                    if (returnedValue !== undefined)
                        instance = returnedValue;
                }
            }
        }
        return instance;
    };
};
const createStamp = (descriptor, composeFunction) => {
    const Stamp = createFactory();
    const { staticDeepProperties, staticProperties, staticPropertyDescriptors } = descriptor;
    if (staticDeepProperties)
        (0, core_1.merge)(Stamp, staticDeepProperties);
    if (staticProperties)
        (0, core_1.assign)(Stamp, staticProperties);
    if (staticPropertyDescriptors)
        defineProperties(Stamp, staticPropertyDescriptors);
    const composeImplementation = (0, is_1.isFunction)(Stamp.compose) ? Stamp.compose : composeFunction;
    Stamp.compose = function _compose(...args) {
        return composeImplementation.apply(this, args);
    };
    (0, core_1.assign)(Stamp.compose, descriptor);
    return Stamp;
};
const concatAssignFunctions = (dstObject, srcArray, propName) => {
    if ((0, is_1.isArray)(srcArray)) {
        const deduped = new Set(get(dstObject, propName) || []);
        for (const fn of srcArray) {
            if ((0, is_1.isFunction)(fn))
                deduped.add(fn);
        }
        set(dstObject, propName, [...deduped]);
    }
};
const combineProperties = (dstObject, srcObject, propName, action) => {
    const srcValue = get(srcObject, propName);
    if ((0, is_1.isObject)(srcValue)) {
        if (!(0, is_1.isObject)(get(dstObject, propName)))
            set(dstObject, propName, {});
        action(get(dstObject, propName), srcValue);
    }
};
const deepMergeAssign = (dstObject, srcObject, propName) => combineProperties(dstObject, srcObject, propName, core_1.merge);
const mergeAssign = (dstObject, srcObject, propName) => combineProperties(dstObject, srcObject, propName, core_1.assign);
const mergeComposable = (dstDescriptor, srcComposable) => {
    const srcDescriptor = (srcComposable === null || srcComposable === void 0 ? void 0 : srcComposable.compose) || srcComposable;
    mergeAssign(dstDescriptor, srcDescriptor, 'methods');
    mergeAssign(dstDescriptor, srcDescriptor, 'properties');
    deepMergeAssign(dstDescriptor, srcDescriptor, 'deepProperties');
    mergeAssign(dstDescriptor, srcDescriptor, 'propertyDescriptors');
    mergeAssign(dstDescriptor, srcDescriptor, 'staticProperties');
    deepMergeAssign(dstDescriptor, srcDescriptor, 'staticDeepProperties');
    mergeAssign(dstDescriptor, srcDescriptor, 'staticPropertyDescriptors');
    mergeAssign(dstDescriptor, srcDescriptor, 'configuration');
    deepMergeAssign(dstDescriptor, srcDescriptor, 'deepConfiguration');
    concatAssignFunctions(dstDescriptor, srcDescriptor.initializers, 'initializers');
    concatAssignFunctions(dstDescriptor, srcDescriptor.composers, 'composers');
};
/**
 * TODO
 */
const compose = function compose(...args) {
    const descriptor = {};
    const composables = [];
    if ((0, is_1.isComposable)(this)) {
        mergeComposable(descriptor, this);
        composables.push(this);
    }
    for (const arg of args) {
        if ((0, is_1.isComposable)(arg)) {
            mergeComposable(descriptor, arg);
            composables.push(arg);
        }
    }
    let stamp = createStamp(descriptor, compose);
    const { composers } = descriptor;
    if ((0, is_1.isArray)(composers) && composers.length > 0) {
        for (const composer of composers) {
            const returnedValue = composer({ stamp, composables });
            if ((0, is_1.isStamp)(returnedValue))
                stamp = returnedValue;
        }
    }
    return stamp;
};
exports.default = compose;
// For CommonJS default export support
module.exports = compose;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: compose });
