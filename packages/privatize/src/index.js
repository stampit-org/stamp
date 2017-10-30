var compose = require('@stamp/compose');
var privates = new WeakMap(); // WeakMap works in IE11, node 0.12

var makeProxyFunction = function (fn, name) {
  function proxiedFn() {
    'use strict';
    var fields = privates.get(this); // jshint ignore:line
    return fn.apply(fields, arguments);
  }

  Object.defineProperty(proxiedFn, 'name', {
    value: name,
    configurable: true
  });

  return proxiedFn;
};

function initializer(_, opts) {
  var descriptor = opts.stamp.compose;
  var privateMethodNames = descriptor.deepConfiguration.Privatize.methods;

  var newObject = {}; // our proxy object
  privates.set(newObject, this);

  var methods = descriptor.methods;
  if (!methods) {
    return newObject;
  }

  var methodNames = Object.keys(methods);
  for (var i = 0; i < methodNames.length; i++) {
    var name = methodNames[i];
    if (privateMethodNames.indexOf(name) < 0) { // not private, thus wrap
      newObject[name] = makeProxyFunction(methods[name], name);
    }
  }
  return newObject;
}

var Privatize = compose({
  initializers: [initializer],
  deepConfiguration: {Privatize: {methods: []}},
  staticProperties: {
    privatizeMethods: function () {
      'use strict';
      var methodNames = [];
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (typeof arg === 'string' && arg.length > 0) {
          methodNames.push(arg);
        }
      }
      var Stamp = this && this.compose ? this : Privatize;
      return Stamp.compose({
        deepConfiguration: {
          Privatize: {
            methods: methodNames
          }
        }
      });
    }
  },
  composers: [function (opts) {
    var initializers = opts.stamp.compose.initializers;
    // Keep our initializer the last to return proxy object
    initializers.splice(initializers.indexOf(initializer), 1);
    initializers.push(initializer);
  }]
});

module.exports = Privatize;
