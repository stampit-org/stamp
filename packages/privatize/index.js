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
  var methods = descriptor.methods;
  var methodNames = Object.keys(methods);
  var newObject = {};
  for (var i = 0; i < methodNames.length; i++) {
    var name = methodNames[i];
    if (privateMethodNames.indexOf(name) < 0) { // not private, thus wrap
      newObject[name] = makeProxyFunction(methods[name], name);
    }
  }
  privates.set(newObject, this);
  return newObject;
}

module.exports = compose({
  initializers: [initializer],
  deepConfiguration: {Privatize: {methods: []}},
  staticProperties: {
    privatizeMethods: function () {
      var methodNames = [];
      for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === 'string' && arguments[i].length > 0) {
          methodNames.push(arguments[i]);
        }
      }
      return this.compose({
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
    initializers.splice(initializers.indexOf(initializer), 1);
    initializers.push(initializer);
  }]
});
