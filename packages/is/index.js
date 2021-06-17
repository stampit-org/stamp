"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Public API
var stamp_1 = require("./stamp");
Object.defineProperty(exports, "isStamp", { enumerable: true, get: function () { return stamp_1.default; } });
var composable_1 = require("./composable");
Object.defineProperty(exports, "isComposable", { enumerable: true, get: function () { return composable_1.default; } });
var descriptor_1 = require("./descriptor");
Object.defineProperty(exports, "isDescriptor", { enumerable: true, get: function () { return descriptor_1.default; } });
// The below are private for @stamp.
var function_1 = require("./function");
Object.defineProperty(exports, "isFunction", { enumerable: true, get: function () { return function_1.default; } });
var object_1 = require("./object");
Object.defineProperty(exports, "isObject", { enumerable: true, get: function () { return object_1.default; } });
var plain_object_1 = require("./plain-object");
Object.defineProperty(exports, "isPlainObject", { enumerable: true, get: function () { return plain_object_1.default; } });
var array_1 = require("./array");
Object.defineProperty(exports, "isArray", { enumerable: true, get: function () { return array_1.default; } });
var string_1 = require("./string");
Object.defineProperty(exports, "isString", { enumerable: true, get: function () { return string_1.default; } });
