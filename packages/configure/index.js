"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const privatize_1 = __importDefault(require("@stamp/privatize"));
const configure = function configure(_, options) {
    const { configuration } = options.stamp.compose;
    const { deepConfiguration } = options.stamp.compose;
    this.config = Object.freeze(Object.assign(Object.assign({}, deepConfiguration), configuration));
};
const ConfigurePublic = (0, compose_1.default)({
    initializers: [configure],
});
/**
 * TODO
 */
const ConfigurePrivate = ConfigurePublic.compose(privatize_1.default);
ConfigurePrivate.noPrivatize = () => ConfigurePublic;
exports.default = ConfigurePrivate;
// For CommonJS default export support
module.exports = ConfigurePrivate;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ConfigurePrivate });
