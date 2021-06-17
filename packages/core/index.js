"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assign_1 = require("./assign");
Object.defineProperty(exports, "assign", { enumerable: true, get: function () { return assign_1.default; } });
var merge_1 = require("./merge");
Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return merge_1.default; } });
/** @deprecated Use Reflect.ownKeys() instead */
var get_own_property_keys_1 = require("./get-own-property-keys");
Object.defineProperty(exports, "getOwnPropertyKeys", { enumerable: true, get: function () { return get_own_property_keys_1.default; } });
