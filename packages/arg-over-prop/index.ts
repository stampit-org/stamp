import compose, { ComposeProperty, Composer, Descriptor, Initializer, PropertyMap, Stamp } from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isString } from '@stamp/is';

const { get, ownKeys, set } = Reflect;

interface ArgOverPropDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { ArgOverProp: PropertyKey[] };
}

const initializer: Initializer = function initializer(opts, ref) {
  if (isObject(opts)) {
    const { deepConfiguration } = ref.stamp.compose as ArgOverPropDescriptor;
    const keysToAssign = deepConfiguration?.ArgOverProp;
    if (keysToAssign?.length) {
      keysToAssign.forEach((key) => {
        const incomingValue = get(opts, key);
        if (incomingValue !== undefined) {
          set(this, key, incomingValue);
        }
      });
    }
  }
};

const dedupe = <T>(array: T[]): T[] => [...new Set(array)];

/**
 * TODO
 */
const ArgOverProp = compose({
  staticProperties: {
    argOverProp(...args: unknown[]): Stamp {
      let propNames: PropertyKey[] = [];
      let defaultProps: PropertyMap | undefined;
      args.forEach((arg) => {
        if (isString(arg)) {
          propNames.push(arg);
        } else if (isArray(arg)) {
          propNames = [...propNames, ...arg.filter(isString)];
        } else if (isObject(arg)) {
          defaultProps = assign(defaultProps || {}, arg);
          propNames = [...propNames, ...ownKeys(arg)];
        }
      });

      const localStamp = (this?.compose ? this : ArgOverProp) as Stamp;
      return localStamp.compose({
        deepConfiguration: { ArgOverProp: propNames },
        properties: defaultProps, // default property values
      });
    },
  },
  initializers: [initializer],
  composers: [
    ((opts) => {
      const descriptor = opts.stamp.compose;
      const { initializers } = descriptor as Required<ComposeProperty>;
      // Always keep our initializer the first
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.unshift(initializer);

      const { deepConfiguration } = descriptor as ArgOverPropDescriptor;
      const propNames = deepConfiguration?.ArgOverProp;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (isArray(propNames)) deepConfiguration!.ArgOverProp = dedupe(propNames);
    }) as Composer,
  ],
});

export default ArgOverProp;

// For CommonJS default export support
module.exports = ArgOverProp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ArgOverProp });
