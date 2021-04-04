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
    if (!is_1.isObject(descr))
        return descr;
    const { methods, properties, props, initializers, init, composers, deepProperties, deepProps, propertyDescriptors, staticProperties, statics, staticDeepProperties, deepStatics, configuration, conf, deepConfiguration, deepConf, } = descr;
    const p = is_1.isObject(props) || is_1.isObject(properties) ? core_1.assign({}, props, properties) : undefined;
    const dp = is_1.isObject(deepProps) || is_1.isObject(deepProperties) ? core_1.merge({}, deepProps, deepProperties) : undefined;
    const sp = is_1.isObject(statics) || is_1.isObject(staticProperties) ? core_1.assign({}, statics, staticProperties) : undefined;
    const sdp = is_1.isObject(deepStatics) || is_1.isObject(staticDeepProperties) ? core_1.merge({}, deepStatics, staticDeepProperties) : undefined;
    let spd = descr.staticPropertyDescriptors;
    if (is_1.isString(descr.name))
        spd = core_1.assign({}, spd || {}, { name: { value: descr.name } });
    const c = is_1.isObject(conf) || is_1.isObject(configuration) ? core_1.assign({}, conf, configuration) : undefined;
    const dc = is_1.isObject(deepConf) || is_1.isObject(deepConfiguration) ? core_1.merge({}, deepConf, deepConfiguration) : undefined;
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
    return compose_1.default.apply(this || baseStampit, args.map((arg) => (is_1.isStamp(arg) ? arg : standardiseDescriptor(arg))));
};
const baseStampit = shortcut_1.default.compose({
    staticProperties: {
        create(...args) {
            return this.apply(this, args);
        },
        compose: stampit,
    },
});
const shortcuts = shortcut_1.default.compose.staticProperties;
ownKeys(shortcuts).forEach((prop) => set(stampit, prop, get(shortcuts, prop).bind(baseStampit)));
stampit.compose = stampit.bind(undefined);
exports.default = stampit;
// For CommonJS default export support
module.exports = stampit;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: stampit });
