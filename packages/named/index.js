"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const is_1 = require("@stamp/is");
/**
 * @deprecated This feature is now available from the `@stamp/it` package which is prefered.
 */
const Named = compose_1.default({
    staticProperties: {
        setName(name) {
            return (is_1.isStamp(this) ? this : Named).compose({
                staticPropertyDescriptors: {
                    name: { value: name },
                },
            });
        },
    },
});
exports.default = Named;
// For CommonJS default export support
module.exports = Named;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Named });
