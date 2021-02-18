import compose from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isString } from '@stamp/is';

import type { ComposeProperty, Composer, Descriptor, Initializer, PropertyMap, Stamp } from '@stamp/compose';

const { get, ownKeys, set } = Reflect;

interface ArgOverPropDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { ArgOverProp: PropertyKey[] };
}

const initializer: Initializer = function (options, context) {
  if (isObject(options)) {
    const { deepConfiguration } = context.stamp.compose as ArgOverPropDescriptor;
    const keysToAssign = deepConfiguration?.ArgOverProp;
    if (keysToAssign?.length) {
      for (const key of keysToAssign) {
        const incomingValue = get(options, key);
        if (incomingValue !== undefined) {
          set(this, key, incomingValue);
        }
      }
    }
  }
};

const deDupe = <T>(array: T[]): T[] => [...new Set(array)];

/**
 * TODO
 */
const ArgOverProp = compose({
  staticProperties: {
    argOverProp(...arguments_: unknown[]): Stamp {
      let propertyKeys: PropertyKey[] = [];
      let defaultProperties: PropertyMap | undefined;
      for (const argument of arguments_) {
        if (isString(argument)) {
          propertyKeys.push(argument);
        } else if (isArray(argument)) {
          // eslint-disable-next-line unicorn/no-array-callback-reference
          propertyKeys = [...propertyKeys, ...argument.filter(isString)];
        } else if (isObject(argument)) {
          defaultProperties = assign(defaultProperties ?? {}, argument);
          propertyKeys = [...propertyKeys, ...ownKeys(argument)];
        }
      }

      const localStamp = ((this as Stamp | undefined)?.compose ? this : ArgOverProp) as Stamp;
      return localStamp.compose({
        deepConfiguration: { ArgOverProp: propertyKeys },
        properties: defaultProperties, // Default property values
      });
    },
  },
  initializers: [initializer],
  composers: [
    ((parameters) => {
      const descriptor = parameters.stamp.compose;
      const { initializers } = descriptor as Required<ComposeProperty>;
      // Always keep our initializer the first
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.unshift(initializer);

      const { deepConfiguration } = descriptor as ArgOverPropDescriptor;
      const propertyNames = deepConfiguration?.ArgOverProp;
      if (isArray(propertyNames)) deepConfiguration!.ArgOverProp = deDupe(propertyNames);
    }) as Composer,
  ],
});

export default ArgOverProp;

// For CommonJS default export support
module.exports = ArgOverProp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ArgOverProp });
