import compose from '@stamp/compose';

import type { Composer, Descriptor, Initializer, PropertyMap, Stamp } from '@stamp/compose';

/** Workaround for `object` type */
type anyObject = Record<string, unknown>;

const { defineProperty, get, ownKeys, set } = Reflect;

const stampSymbol = Symbol.for('stamp');

// ! weak types
const privates = new WeakMap<any, unknown>(); // WeakMap works in IE11, node 0.12

/** @internal */
const makeProxyFunction = function <T extends (this: unknown, ...args: any) => any>(
  this: unknown,
  fn: T,
  name: PropertyKey
  // ! weak types
): (this: any, ...args: any) => ReturnType<T> {
  function proxiedFn(this: anyObject, ...arguments_: any): ReturnType<T> {
    return fn.apply(privates.get(this), arguments_);
  }

  defineProperty(proxiedFn, 'name', {
    value: name,
    configurable: true,
  });

  return proxiedFn;
};

/** @internal */
// ! weak types
interface OwnDescriptor extends Descriptor<unknown, unknown> {
  deepConfiguration?: PropertyMap & { Privatize: { methods: PropertyKey[] } };
}

/** @internal */
const initializer = function (_options, context) {
  const descriptor = (context.stamp as Stamp<unknown>).compose as OwnDescriptor;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  // ! weak types
} as Initializer<unknown, unknown>;

/**
 * TODO
 */
// TODO: Privatize should support generics like <ObjectInstance, OriginalStamp>
const Privatize = compose({
  initializers: [initializer],
  deepConfiguration: { Privatize: { methods: [] } },
  staticProperties: {
    // ! weak types
    privatizeMethods(this: Stamp<unknown> | undefined, ...arguments_: string[]): Stamp<unknown> {
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
      // ! weak types
      const { initializers } = (parameters.stamp as Stamp<unknown>).compose as Required<Descriptor<unknown, unknown>>;
      // Keep our initializer the last to return proxy object
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.push(initializer);
      // ! weak types
    }) as Composer<unknown, unknown>,
  ],
  // ! type should be PrivatizeStamp, renamed as Privatize
}) as Stamp<unknown>;

export default Privatize;

// For CommonJS default export support
module.exports = Privatize;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Privatize });
