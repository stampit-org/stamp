"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const createShortcut = (propName) => {
    // eslint-disable-next-line func-names
    return function (arg) {
        const param = { [propName]: arg };
        return (this === null || this === void 0 ? void 0 : this.compose) ? this.compose(param) : (0, compose_1.default)(param);
    };
};
const properties = createShortcut('properties');
const staticProperties = createShortcut('staticProperties');
const configuration = createShortcut('configuration');
const deepProperties = createShortcut('deepProperties');
const staticDeepProperties = createShortcut('staticDeepProperties');
const deepConfiguration = createShortcut('deepConfiguration');
const initializers = createShortcut('initializers');
// TODO: Stamp's `ComposeMethod` should issue StampWithShortcuts
// TODO: Augment `Stamp` signature with `StampWithShortcuts`
/**
 *  TODO
 */
const Shortcut = (0, compose_1.default)({
    staticProperties: {
        methods: createShortcut('methods'),
        props: properties,
        properties,
        statics: staticProperties,
        staticProperties,
        conf: configuration,
        configuration,
        deepProps: deepProperties,
        deepProperties,
        deepStatics: staticDeepProperties,
        staticDeepProperties,
        deepConf: deepConfiguration,
        deepConfiguration,
        init: initializers,
        initializers,
        composers: createShortcut('composers'),
        propertyDescriptors: createShortcut('propertyDescriptors'),
        staticPropertyDescriptors: createShortcut('staticPropertyDescriptors'),
    },
});
exports.default = Shortcut;
// For CommonJS default export support
module.exports = Shortcut;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Shortcut });
