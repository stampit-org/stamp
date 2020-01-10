import compose, { ComposeProperty, Composer, Descriptor, Initializer, PropertyMap, Stamp } from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isString } from '@stamp/is';

const { get, ownKeys, set } = Reflect;

interface ArgOverPropDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { ArgOverProp: PropertyKey[] };
}

const initializer: Initializer = function initializer(options, context) {
  if (isObject(options)) {
    const { deepConfiguration } = context.stamp.compose as ArgOverPropDescriptor;
    const keysToAssign = deepConfiguration?.ArgOverProp;
    if (keysToAssign?.length) {
      keysToAssign.forEach((key) => {
        const incomingValue = get(options, key);
        if (incomingValue !== undefined) {
          set(this, key, incomingValue);
        }
      });
    }
  }
};

const deDupe = <T>(array: T[]): T[] => [...new Set(array)];

/**
 * TODO
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
const ArgOverProp = compose({
  staticProperties: {
    argOverProp(...arguments_: unknown[]): Stamp {
      let propertyKeys: PropertyKey[] = [];
      let defaultProperties: PropertyMap | undefined;
      arguments_.forEach((argument) => {
        if (isString(argument)) {
          propertyKeys.push(argument);
        } else if (isArray(argument)) {
          propertyKeys = [...propertyKeys, ...argument.filter(isString)];
        } else if (isObject(argument)) {
          defaultProperties = assign(defaultProperties || {}, argument);
          propertyKeys = [...propertyKeys, ...ownKeys(argument)];
        }
      });

      const localStamp = (this?.compose ? this : ArgOverProp) as Stamp;
      return localStamp.compose({
        deepConfiguration: { ArgOverProp: propertyKeys },
        properties: defaultProperties, // default property values
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (isArray(propertyNames)) deepConfiguration!.ArgOverProp = deDupe(propertyNames);
    }) as Composer,
  ],
});

export default ArgOverProp;

// For CommonJS default export support
module.exports = ArgOverProp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ArgOverProp });
