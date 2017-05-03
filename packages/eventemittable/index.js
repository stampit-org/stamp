var compose = require('@stamp/compose');
var EventEmitter = require('./node_modules/events').EventEmitter;

module.exports = compose({
  composers: [
    function (obj) {
      var stamp = obj.stamp;
      stamp.compose.methods = Object.assign(stamp.compose.methods || {}, {
        getMaxListeners: function () {
          return this._maxListeners || EventEmitter.defaultMaxListeners;
        }
      }, EventEmitter.prototype);
    }
  ]
});
