import compose from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isString } from '@stamp/is';

import type {
  ComposerParameters,
  Composable,
  ComposeProperty,
  Composer,
  DefineStamp,
  Descriptor,
  Initializer,
  PropertyMap,
  Stamp,
} from '@stamp/compose';

const { get, ownKeys, set } = Reflect;

/** @internal Helper `Descriptor` type with `ArgOverProp` property */
// ! weak types
interface OwnDescriptor extends Descriptor<unknown, unknown> {
  deepConfiguration?: PropertyMap & { ArgOverProp: PropertyKey[] };
}

/** @internal `ArgOverProp` initializer function */
// ! weak types
const initializer: Initializer<unknown, DefineStamp<unknown, unknown>> = function (options, context) {
  if (isObject(options)) {
    const { deepConfiguration } = context.stamp.compose as OwnDescriptor;
    const keysToAssign = deepConfiguration?.ArgOverProp;
    if (keysToAssign?.length) {
      for (const key of keysToAssign) {
        const incomingValue = get(options, key);
        if (incomingValue !== undefined) {
          // ! weak types
          set(this as any, key, incomingValue);
        }
      }
    }
  }
};

/** @internal `ArgOverProp` composer function */
// ! weak types
const composer: Composer<unknown, DefineStamp<unknown, unknown>> = (parameters: ComposerParameters<unknown, any>) => {
  const descriptor = parameters.stamp.compose;
  // ! weak types
  const { initializers } = descriptor as Required<ComposeProperty<unknown, DefineStamp<unknown, unknown>>>;
  // Always keep our initializer the first
  initializers.splice(initializers.indexOf(initializer), 1);
  initializers.unshift(initializer);
  const { deepConfiguration } = descriptor as OwnDescriptor;
  const propertyNames = deepConfiguration?.ArgOverProp;
  if (isArray(propertyNames)) deepConfiguration!.ArgOverProp = [...new Set(propertyNames)];
};

/** @internal */
// ! weak types
function argOverProp(this: Stamp<unknown> | undefined, ...arguments_: unknown[]): ArgOverPropStamp<unknown, unknown> {
  let propertyKeys: PropertyKey[] = [];
  let defaultProperties: PropertyMap | undefined;
  for (const argument of arguments_) {
    if (isString(argument)) {
      propertyKeys.push(argument);
    } else if (isArray(argument)) {
      // eslint-disable-next-line unicorn/no-array-callback-reference
      propertyKeys = [...propertyKeys, ...argument.filter(isString)];
    } else if (isObject(argument)) {
      defaultProperties = assign<PropertyMap>(defaultProperties ?? {}, argument);
      propertyKeys = [...propertyKeys, ...ownKeys(argument)];
    }
  }

  const localStamp = this?.compose ? this : ArgOverProp;
  // ! weak types
  return (localStamp as any).compose({
    deepConfiguration: { ArgOverProp: propertyKeys },
    properties: defaultProperties, // Default property values
  }) as ArgOverPropStamp<unknown, unknown>;
}

/**
 * A Stamp with the `argOverProp` static method
 */
export interface ArgOverPropStamp<Instance, FinalStamp, ComposingStamp = FinalStamp>
  extends DefineStamp<Instance, FinalStamp, ComposingStamp> {
  /**
   * Assign properties passed to the stamp factory
   */
  argOverProp: typeof argOverProp;
}

/** @internal ArgOverPropSignature */
declare function ArgOverPropSignature<Instance, FinalStamp, ComposingStamp = FinalStamp>(
  this: void | ComposingStamp,
  ...arguments_: Array<Composable<Instance, FinalStamp>>
): ArgOverPropStamp<Instance, FinalStamp, ComposingStamp>;

/**
 * Assign properties passed to the stamp factory
 */
const ArgOverProp = compose({
  staticProperties: { argOverProp },
  initializers: [initializer],
  composers: [composer],
  // ! type should be ArgOverPropStamp, renamed as ArgOverProp
}) as typeof ArgOverPropSignature;

export default ArgOverProp;

// For CommonJS default export support
module.exports = ArgOverProp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ArgOverProp });
