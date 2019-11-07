'use strict';

const compose = require('@stamp/compose');

const { defineProperty, get, ownKeys, set } = Reflect;

const stampSymbol = Symbol.for('stamp');

const privates = new WeakMap(); // WeakMap works in IE11, node 0.12

const makeProxyFunction = function(fn, name) {
  function proxiedFn(...args) {
    // 'use strict';

    return fn.apply(privates.get(this), args);
  }

  defineProperty(proxiedFn, 'name', {
    value: name,
    configurable: true,
  });

  return proxiedFn;
};

function initializer(_, opts) {
  const descriptor = opts.stamp.compose;
  const privateMethodNames = descriptor.deepConfiguration.Privatize.methods;

  const newObject = {}; // our proxy object
  privates.set(newObject, this);

  const { methods } = descriptor;
  if (methods) {
    ownKeys(methods).forEach((name) => {
      if (privateMethodNames.indexOf(name) < 0) {
        // not private, thus wrap
        set(newObject, name, makeProxyFunction(get(methods, name), name));
      }
    });

    // Integration with @stamp/instanceof
    if (get(methods, stampSymbol)) set(newObject, stampSymbol, opts.stamp);
  }

  return newObject;
}

const Privatize = compose({
  initializers: [initializer],
  deepConfiguration: { Privatize: { methods: [] } },
  staticProperties: {
    privatizeMethods(...args) {
      // 'use strict';

      const methodNames = [];
      args.forEach((arg) => {
        if (typeof arg === 'string' && arg.length > 0) {
          methodNames.push(arg);
        }
      });
      const Stamp = this && this.compose ? this : Privatize;
      return Stamp.compose({
        deepConfiguration: {
          Privatize: {
            methods: methodNames,
          },
        },
      });
    },
  },
  composers: [
    (opts) => {
      const { initializers } = opts.stamp.compose;
      // Keep our initializer the last to return proxy object
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.push(initializer);
    },
  ],
});

module.exports = Privatize;
