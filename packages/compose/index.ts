import { assign, merge } from '@stamp/core';
import { isArray, isComposable, isFunction, isObject, isStamp } from '@stamp/is';

import type {
  Composable,
  ComposeFunction,
  ComposeProperty,
  ComposeAttribute,
  Composer,
  Descriptor,
  Initializer,
  PropertyMap,
  Stamp,
} from '@stamp/types';

export type {
  Composable,
  ComposeFunction,
  ComposeProperty,
  Composer,
  ComposerParameters,
  DefineStamp,
  Descriptor,
  Initializer,
  PropertyMap,
  Stamp,
} from '@stamp/types';

const { defineProperties } = Object;
const { get, set } = Reflect;

/**
 * @internal Creates new factory instance.
 * @returns {Function} The new factory function.
 */
// ! weak types
const createFactory = (): Stamp<unknown> => {
  return function Stamp(options: PropertyMap = {}, ...arguments_): unknown {
    // ! weak types
    const descriptor = ((Stamp as Stamp<unknown>).compose || {}) as Descriptor<unknown, unknown>;
    const { methods, properties, deepProperties, propertyDescriptors, initializers } = descriptor;
    // Next line was optimized for most JS VMs. Please, be careful here!
    let instance: unknown = { __proto__: methods };

    if (deepProperties) merge<unknown>(instance, deepProperties);
    if (properties) assign<unknown>(instance, properties);
    if (propertyDescriptors) defineProperties(instance, propertyDescriptors);

    if (initializers && initializers.length > 0) {
      let returnedValue: void | unknown;
      const args = [options, ...arguments_];
      for (const initializer of initializers) {
        // ! weak types
        if (isFunction<Initializer<unknown, unknown>>(initializer)) {
          returnedValue = initializer.call(instance, options, {
            instance,
            // ! weak types
            stamp: Stamp as Stamp<unknown>,
            args,
          });
          if (returnedValue !== undefined) instance = returnedValue;
        }
      }
    }

    return instance;
    // ! weak types
  } as Stamp<unknown>;
};

/**
 * @internal Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @param {ComposeFunction} composeFunction The "compose" function implementation.
 * @returns {Stamp}
 */
const createStamp = <FinalStamp>(
  // ! weak types
  descriptor: Descriptor<unknown, unknown>,
  // ! weak types
  composeFunction: ComposeFunction<unknown, unknown>
): FinalStamp => {
  const Stamp = createFactory();

  const { staticDeepProperties, staticProperties, staticPropertyDescriptors } = descriptor;

  if (staticDeepProperties) merge<unknown>(Stamp, staticDeepProperties);
  if (staticProperties) assign<unknown>(Stamp, staticProperties);
  if (staticPropertyDescriptors) defineProperties(Stamp, staticPropertyDescriptors);

  const composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : composeFunction;
  // ! weak types
  ((Stamp as unknown) as ComposeAttribute<unknown, unknown>).compose = function (
    this: void | unknown,
    // ! weak types
    ...arguments_: Array<Composable<unknown, unknown>>
  ): FinalStamp {
    return composeImplementation.apply(this, arguments_) as FinalStamp;
    // ! weak types
  } as ComposeProperty<unknown, unknown>;

  assign<unknown>(Stamp.compose, descriptor);

  // ! weak types
  return (Stamp as unknown) as FinalStamp;
};

/** @internal concatAssignFunctions */
const concatAssignFunctions = (
  dstObject: any,
  // ! weak types
  sourceArray: Array<Initializer<unknown, unknown> | Composer<unknown, unknown>> | undefined,
  propertyKey: PropertyKey
): void => {
  if (isArray(sourceArray)) {
    const deDuped = new Set(get(dstObject, propertyKey) || []);
    for (const fn of sourceArray) {
      if (isFunction(fn)) deDuped.add(fn);
    }

    set(dstObject, propertyKey, [...deDuped]);
  }
};

/** @internal combineProperties */
const combineProperties = (
  dstObject: any,
  sourceObject: any,
  propertyKey: PropertyKey,
  action: (dst: any, ...args: Array<any | undefined>) => unknown
): void => {
  const sourceValue = get(sourceObject, propertyKey);
  if (isObject(sourceValue)) {
    if (!isObject(get(dstObject, propertyKey))) set(dstObject, propertyKey, {});
    action(get(dstObject, propertyKey), sourceValue);
  }
};

/** @internal deepMergeAssign */
const deepMergeAssign = (dstObject: unknown, sourceObject: unknown, propertyKey: PropertyKey): void => {
  combineProperties(dstObject, sourceObject, propertyKey, merge);
};

/** @internal mergeAssign */
const mergeAssign = (dstObject: unknown, sourceObject: unknown, propertyKey: PropertyKey): void => {
  combineProperties(dstObject, sourceObject, propertyKey, assign);
};

/**
 * @internal Mutates the dstDescriptor by merging the sourceComposable data into it.
 * @param {Descriptor} dstDescriptor The descriptor object to merge into.
 * @param {Composable} [sourceComposable] The composable
 * (either descriptor or stamp) to merge data form.
 */
const mergeComposable = (
  // ! weak types
  dstDescriptor: Descriptor<unknown, unknown>,
  // ! weak types
  sourceComposable: Composable<unknown, unknown>
): void => {
  // ! weak types
  const sourceDescriptor = ((sourceComposable as Stamp<unknown>)?.compose || sourceComposable) as Descriptor<
    unknown,
    unknown
  >;

  mergeAssign(dstDescriptor, sourceDescriptor, 'methods');
  mergeAssign(dstDescriptor, sourceDescriptor, 'properties');
  deepMergeAssign(dstDescriptor, sourceDescriptor, 'deepProperties');
  mergeAssign(dstDescriptor, sourceDescriptor, 'propertyDescriptors');
  mergeAssign(dstDescriptor, sourceDescriptor, 'staticProperties');
  deepMergeAssign(dstDescriptor, sourceDescriptor, 'staticDeepProperties');
  mergeAssign(dstDescriptor, sourceDescriptor, 'staticPropertyDescriptors');
  mergeAssign(dstDescriptor, sourceDescriptor, 'configuration');
  deepMergeAssign(dstDescriptor, sourceDescriptor, 'deepConfiguration');
  concatAssignFunctions(dstDescriptor, sourceDescriptor.initializers, 'initializers');
  concatAssignFunctions(dstDescriptor, sourceDescriptor.composers, 'composers');
};

/**
 * Implementation of the stamp `compose` specification
 */
// const compose: ComposeFunction<unknown, unknown> = function compose<Instance, FinalStamp, ThisStamp = FinalStamp>(
function compose<Instance, FinalStamp, ComposingStamp = FinalStamp>(
  this: void | ComposingStamp,
  // ! weak types
  ...arguments_: Array<Composable<Instance, FinalStamp, ComposingStamp>>
): FinalStamp {
  // ! weak types
  const descriptor: Descriptor<unknown, unknown> = {};
  // ! weak types
  const composables: Array<Composable<unknown, unknown>> = [];

  if (isComposable(this)) {
    mergeComposable(descriptor, this);
    composables.push(this);
  }

  for (const argument of arguments_) {
    if (isComposable(argument)) {
      mergeComposable(descriptor, argument);
      composables.push(argument);
    }
  }

  // ! weak types
  let stamp = createStamp<FinalStamp>(descriptor, compose as ComposeFunction<unknown, unknown, unknown>);

  const { composers } = descriptor;
  if (isArray(composers) && composers.length > 0) {
    for (const composer of composers) {
      const returnedValue = composer({ stamp, composables }) as FinalStamp;
      if (isStamp(returnedValue)) stamp = returnedValue;
    }
  }

  return stamp;
}

export default compose;

// For CommonJS default export support
module.exports = compose;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: compose });
