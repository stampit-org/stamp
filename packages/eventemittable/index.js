'use strict';

const compose = require('@stamp/compose');
const { EventEmitter } = require('events');

// EventEmitter.listenerCount - Deprecated since: v4.0.0
const listenerCount = (emitter, eventName) => emitter.listenerCount(eventName);

const EventEmittable = compose({
  staticProperties: {
    defaultMaxListeners: EventEmitter.defaultMaxListeners,
    listenerCount,
  },
  methods: EventEmitter.prototype,
});

module.exports = EventEmittable;
