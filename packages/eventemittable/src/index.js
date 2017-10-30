var compose = require('@stamp/compose');
var EventEmitter = require('events').EventEmitter;

module.exports = compose({
  staticProperties: {
    defaultMaxListeners: EventEmitter.defaultMaxListeners,
    listenerCount: EventEmitter.listenerCount
  },
  methods: EventEmitter.prototype
});
