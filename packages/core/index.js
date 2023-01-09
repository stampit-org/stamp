"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnPropertyKeys = exports.merge = exports.assign = void 0;
var assign_1 = require("./assign");
Object.defineProperty(exports, "assign", { enumerable: true, get: function () { return __importDefault(assign_1).default; } });
var merge_1 = require("./merge");
Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return __importDefault(merge_1).default; } });
/** @deprecated Use Reflect.ownKeys() instead */
var get_own_property_keys_1 = require("./get-own-property-keys");
Object.defineProperty(exports, "getOwnPropertyKeys", { enumerable: true, get: function () { return __importDefault(get_own_property_keys_1).default; } });
