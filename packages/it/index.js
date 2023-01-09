"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint @typescript-eslint/no-use-before-define: ["error", { "variables": false }] */
const compose_1 = __importDefault(require("@stamp/compose"));
const core_1 = require("@stamp/core");
const is_1 = require("@stamp/is");
const shortcut_1 = __importDefault(require("@stamp/shortcut"));
const { concat } = Array.prototype;
const { get, ownKeys, set } = Reflect;
const extractFunctions = (...args) => {
    const fns = concat.apply([], [...args]).filter(is_1.isFunction);
    return fns.length === 0 ? undefined : fns;
};
const standardiseDescriptor = (descr) => {
    if (!(0, is_1.isObject)(descr))
        return descr;
    const { methods, properties, props, initializers, init, composers, deepProperties, deepProps, propertyDescriptors, staticProperties, statics, staticDeepProperties, deepStatics, configuration, conf, deepConfiguration, deepConf, } = descr;
    const p = (0, is_1.isObject)(props) || (0, is_1.isObject)(properties) ? (0, core_1.assign)({}, props, properties) : undefined;
    const dp = (0, is_1.isObject)(deepProps) || (0, is_1.isObject)(deepProperties) ? (0, core_1.merge)({}, deepProps, deepProperties) : undefined;
    const sp = (0, is_1.isObject)(statics) || (0, is_1.isObject)(staticProperties) ? (0, core_1.assign)({}, statics, staticProperties) : undefined;
    const sdp = (0, is_1.isObject)(deepStatics) || (0, is_1.isObject)(staticDeepProperties) ? (0, core_1.merge)({}, deepStatics, staticDeepProperties) : undefined;
    let spd = descr.staticPropertyDescriptors;
    if ((0, is_1.isString)(descr.name))
        spd = (0, core_1.assign)({}, spd || {}, { name: { value: descr.name } });
    const c = (0, is_1.isObject)(conf) || (0, is_1.isObject)(configuration) ? (0, core_1.assign)({}, conf, configuration) : undefined;
    const dc = (0, is_1.isObject)(deepConf) || (0, is_1.isObject)(deepConfiguration) ? (0, core_1.merge)({}, deepConf, deepConfiguration) : undefined;
    const ii = extractFunctions(init, initializers);
    const cc = extractFunctions(composers);
    const descriptor = {};
    if (methods)
        descriptor.methods = methods;
    if (p)
        descriptor.properties = p;
    if (ii)
        descriptor.initializers = ii;
    if (cc)
        descriptor.composers = cc;
    if (dp)
        descriptor.deepProperties = dp;
    if (sp)
        descriptor.staticProperties = sp;
    if (sdp)
        descriptor.staticDeepProperties = sdp;
    if (propertyDescriptors)
        descriptor.propertyDescriptors = propertyDescriptors;
    if (spd)
        descriptor.staticPropertyDescriptors = spd;
    if (c)
        descriptor.configuration = c;
    if (dc)
        descriptor.deepConfiguration = dc;
    return descriptor;
};
// { (...args: any[]): StampWithShortcuts; compose: ComposeMethod & Descriptor; }
const stampit = function stampit(...args) {
    return compose_1.default.apply(this || baseStampit, args.map((arg) => ((0, is_1.isStamp)(arg) ? arg : standardiseDescriptor(arg))));
};
const baseStampit = shortcut_1.default.compose({
    staticProperties: {
        create(...args) {
            return this.apply(this, args);
        },
        compose: stampit, // infecting
    },
});
const shortcuts = shortcut_1.default.compose.staticProperties;
ownKeys(shortcuts).forEach((prop) => set(stampit, prop, get(shortcuts, prop).bind(baseStampit)));
stampit.compose = stampit.bind(undefined);
exports.default = stampit;
// For CommonJS default export support
module.exports = stampit;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: stampit });
