import compose, { Composer, Descriptor, Initializer, Stamp, PropertyMap } from '@stamp/compose';

const { defineProperty, get, ownKeys, set } = Reflect;

const stampSymbol = Symbol.for('stamp');

const privates = new WeakMap<object, object>(); // WeakMap works in IE11, node 0.12

const makeProxyFunction = function makeProxyFunction<T extends Function>(
  this: unknown,
  fn: T,
  name: PropertyKey
): (this: object, ...args: unknown[]) => unknown {
  function proxiedFn(this: object, ...args: unknown[]): unknown {
    return fn.apply(privates.get(this), args);
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

const initializer: Initializer = function initializer(_, opts) {
  const descriptor = opts.stamp.compose as PrivatizeDescriptor;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const privateMethodKeys = descriptor.deepConfiguration!.Privatize.methods;

  const newObject = {}; // our proxy object
  privates.set(newObject, this);

  const { methods } = descriptor;
  if (methods) {
    ownKeys(methods).forEach((name) => {
      if (privateMethodKeys.indexOf(name) < 0) {
        // not private, thus wrap
        set(newObject, name, makeProxyFunction(get(methods, name), name));
      }
    });

    // Integration with @stamp/instanceof
    if (get(methods, stampSymbol)) set(newObject, stampSymbol, opts.stamp);
  }

  return newObject;
};

export const Privatize = compose({
  initializers: [initializer],
  deepConfiguration: { Privatize: { methods: [] } },
  staticProperties: {
    privatizeMethods(this: Stamp | undefined, ...args: string[]): Stamp {
      const methodNames: string[] = [];
      args.forEach((arg) => {
        if (typeof arg === 'string' && arg.length > 0) {
          methodNames.push(arg);
        }
      });
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
    ((opts) => {
      const { initializers } = opts.stamp.compose as Required<Descriptor>;
      // Keep our initializer the last to return proxy object
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.push(initializer);
    }) as Composer,
  ],
});

export default Privatize;
