"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const events_1 = require("events");
const listenerCount = (emitter, event) => emitter.listenerCount(event);
/**
 * TODO
 */
const EventEmittable = compose_1.default({
    staticProperties: {
        defaultMaxListeners: events_1.EventEmitter.defaultMaxListeners,
        listenerCount,
    },
    methods: events_1.EventEmitter.prototype,
});
exports.default = EventEmittable;
// For CommonJS default export support
module.exports = EventEmittable;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: EventEmittable });
