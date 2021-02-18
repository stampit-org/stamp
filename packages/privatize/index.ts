import compose from '@stamp/compose';

import type { Composer, Descriptor, Initializer, PropertyMap, Stamp } from '@stamp/compose';

const { defineProperty, get, ownKeys, set } = Reflect;

const stampSymbol = Symbol.for('stamp');

// eslint-disable-next-line @typescript-eslint/ban-types
const privates = new WeakMap<object, object>(); // WeakMap works in IE11, node 0.12

const makeProxyFunction = function <T extends (this: unknown, ...args: any) => any>(
  this: unknown,
  fn: T,
  name: PropertyKey
  // eslint-disable-next-line @typescript-eslint/ban-types
): (this: object, ...args: any) => ReturnType<T> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  function proxiedFn(this: object, ...arguments_: any): ReturnType<T> {
    return fn.apply(privates.get(this), arguments_);
  }

  defineProperty(proxiedFn, 'name', {
    value: name,
    configurable: true,
  });

  return proxiedFn;
};

interface PrivatizeDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { Privatize: { methods: PropertyKey[] } };
}

const initializer: Initializer = function (_options, context) {
  const descriptor = context.stamp.compose as PrivatizeDescriptor;
  const privateMethodKeys = descriptor.deepConfiguration!.Privatize.methods;

  const newObject = {}; // Our proxy object
  privates.set(newObject, this);

  const { methods } = descriptor;
  if (methods) {
    for (const name of ownKeys(methods)) {
      if (!privateMethodKeys.includes(name)) {
        // Not private, thus wrap
        set(newObject, name, makeProxyFunction(get(methods, name), name));
      }
    }

    // Integration with @stamp/instanceof
    if (get(methods, stampSymbol)) set(newObject, stampSymbol, context.stamp);
  }

  return newObject;
};

/**
 * TODO
 */
const Privatize = compose({
  initializers: [initializer],
  deepConfiguration: { Privatize: { methods: [] } },
  staticProperties: {
    privatizeMethods(this: Stamp | undefined, ...arguments_: string[]): Stamp {
      const methodNames: string[] = [];
      for (const argument of arguments_) {
        if (typeof argument === 'string' && argument.length > 0) {
          methodNames.push(argument);
        }
      }

      return (this?.compose ? this : Privatize).compose({
        deepConfiguration: {
          Privatize: {
            methods: methodNames,
          },
        },
      });
    },
  },
  composers: [
    ((parameters) => {
      const { initializers } = parameters.stamp.compose as Required<Descriptor>;
      // Keep our initializer the last to return proxy object
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.push(initializer);
    }) as Composer,
  ],
});

export default Privatize;

// For CommonJS default export support
module.exports = Privatize;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Privatize });
