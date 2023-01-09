"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = exports.isArray = exports.isPlainObject = exports.isObject = exports.isFunction = exports.isDescriptor = exports.isComposable = exports.isStamp = void 0;
// Public API
var stamp_1 = require("./stamp");
Object.defineProperty(exports, "isStamp", { enumerable: true, get: function () { return __importDefault(stamp_1).default; } });
var composable_1 = require("./composable");
Object.defineProperty(exports, "isComposable", { enumerable: true, get: function () { return __importDefault(composable_1).default; } });
var descriptor_1 = require("./descriptor");
Object.defineProperty(exports, "isDescriptor", { enumerable: true, get: function () { return __importDefault(descriptor_1).default; } });
// The below are private for @stamp.
var function_1 = require("./function");
Object.defineProperty(exports, "isFunction", { enumerable: true, get: function () { return __importDefault(function_1).default; } });
var object_1 = require("./object");
Object.defineProperty(exports, "isObject", { enumerable: true, get: function () { return __importDefault(object_1).default; } });
var plain_object_1 = require("./plain-object");
Object.defineProperty(exports, "isPlainObject", { enumerable: true, get: function () { return __importDefault(plain_object_1).default; } });
var array_1 = require("./array");
Object.defineProperty(exports, "isArray", { enumerable: true, get: function () { return __importDefault(array_1).default; } });
var string_1 = require("./string");
Object.defineProperty(exports, "isString", { enumerable: true, get: function () { return __importDefault(string_1).default; } });
