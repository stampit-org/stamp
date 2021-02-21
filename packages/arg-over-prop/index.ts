import compose from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isString } from '@stamp/is';

import type {
  ComposerParameters,
  ComposeProperty,
  Composer,
  Descriptor,
  Initializer,
  PropertyMap,
  Stamp,
} from '@stamp/compose';

const { get, ownKeys, set } = Reflect;

/** @internal Helper `Descriptor` type with `ArgOverProp` property */
interface AOP_Descriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { ArgOverProp: PropertyKey[] };
}

/** @internal `ArgOverProp` initializer function */
const initializer: Initializer = function (options, context) {
  if (isObject(options)) {
    const { deepConfiguration } = context.stamp.compose as AOP_Descriptor;
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

/** @internal `ArgOverProp` composer function */
const composer: Composer = (parameters: ComposerParameters) => {
  const descriptor = parameters.stamp.compose;
  const { initializers } = descriptor as Required<ComposeProperty>;
  // Always keep our initializer the first
  initializers.splice(initializers.indexOf(initializer), 1);
  initializers.unshift(initializer);
  const { deepConfiguration } = descriptor as AOP_Descriptor;
  const propertyNames = deepConfiguration?.ArgOverProp;
  if (isArray(propertyNames)) deepConfiguration!.ArgOverProp = [...new Set(propertyNames)];
};

// TODO: argOverProp should support generics like <ObjectInstance, OriginalStamp>
function argOverProp(this: Stamp | undefined, ...arguments_: unknown[]): ArgOverPropStamp {
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
  return localStamp.compose({
    deepConfiguration: { ArgOverProp: propertyKeys },
    properties: defaultProperties, // Default property values
  }) as ArgOverPropStamp;
}

/**
 * A Stamp with the `argOverProp` static method
 */
// TODO: ArgOverPropStamp should support generics like <ObjectInstance, OriginalStamp>
export interface ArgOverPropStamp extends Stamp {
  /**
   * Assign properties passed to the stamp factory
   */
  argOverProp: typeof argOverProp;
}

/**
 * Assign properties passed to the stamp factory
 */
// TODO: ArgOverProp should support generics like <ObjectInstance, OriginalStamp>
const ArgOverProp = compose({
  staticProperties: { argOverProp },
  initializers: [initializer],
  composers: [composer],
}) as ArgOverPropStamp;

export default ArgOverProp;

// For CommonJS default export support
module.exports = ArgOverProp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ArgOverProp });
