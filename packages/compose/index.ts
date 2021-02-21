import { assign, merge } from '@stamp/core';
import { isArray, isComposable, isFunction, isObject, isStamp } from '@stamp/is';

import type {
  Composable,
  ComposeFunction,
  ComposeProperty,
  Composer,
  Descriptor,
  Initializer,
  ObjectInstance,
  PropertyMap,
  Stamp,
} from '@stamp/types';

export type {
  Composable,
  ComposeFunction,
  ComposeProperty,
  Composer,
  ComposerParameters,
  Descriptor,
  Initializer,
  InitializerContext,
  ObjectInstance,
  PropertyMap,
  Stamp,
  StaticPropertyMap,
} from '@stamp/types';

const { defineProperties } = Object;
const { get, set } = Reflect;

/**
 * @internal Creates new factory instance.
 * @returns {Function} The new factory function.
 */
// TODO: createFactory should support generics like <ObjectInstance, Stamp>
const createFactory = (): Stamp => {
  return function Stamp(options: PropertyMap = {}, ...arguments_): ObjectInstance {
    const descriptor: Descriptor = (Stamp as Stamp).compose || {};
    const { methods, properties, deepProperties, propertyDescriptors, initializers } = descriptor;
    // Next line was optimized for most JS VMs. Please, be careful here!
    let instance: ObjectInstance = { __proto__: methods };

    if (deepProperties) merge(instance, deepProperties);
    if (properties) assign(instance, properties);
    if (propertyDescriptors) defineProperties(instance, propertyDescriptors);

    if (initializers && initializers.length > 0) {
      let returnedValue: ObjectInstance | void;
      const args = [options, ...arguments_];
      for (const initializer of initializers) {
        if (isFunction<Initializer>(initializer)) {
          returnedValue = initializer.call(instance, options, {
            instance,
            stamp: Stamp as Stamp,
            args,
          });
          if (returnedValue !== undefined) instance = returnedValue;
        }
      }
    }

    return instance;
  } as Stamp;
};

/**
 * @internal Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @param {ComposeFunction} composeFunction The "compose" function implementation.
 * @returns {Stamp}
 */
// TODO: createStamp should support generics like <Stamp>
const createStamp = (descriptor: Descriptor, composeFunction: ComposeFunction): Stamp => {
  const Stamp = createFactory();

  const { staticDeepProperties, staticProperties, staticPropertyDescriptors } = descriptor;

  if (staticDeepProperties) merge(Stamp, staticDeepProperties);
  if (staticProperties) assign(Stamp, staticProperties);
  if (staticPropertyDescriptors) defineProperties(Stamp, staticPropertyDescriptors);

  const composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : composeFunction;
  Stamp.compose = function (this: Stamp | undefined, ...arguments_) {
    return composeImplementation.apply(this, arguments_);
  } as ComposeProperty;
  assign(Stamp.compose, descriptor);

  return Stamp;
};

/** @internal concatAssignFunctions */
const concatAssignFunctions = (
  dstObject: any,
  sourceArray: Array<Initializer | Composer> | undefined,
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
const mergeComposable = (dstDescriptor: Descriptor, sourceComposable: Composable): void => {
  const sourceDescriptor: Descriptor = (sourceComposable as Stamp)?.compose || sourceComposable;

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
// TODO: compose should support generics like <ObjectInstance, Stamp>
const compose: ComposeFunction = function compose(...arguments_) {
  const descriptor: Descriptor = {};
  const composables: Composable[] = [];

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

  let stamp = createStamp(descriptor, compose);

  const { composers } = descriptor;
  if (isArray(composers) && composers.length > 0) {
    for (const composer of composers) {
      const returnedValue = composer({ stamp, composables });
      if (isStamp(returnedValue)) stamp = returnedValue;
    }
  }

  return stamp;
};

export default compose;

// For CommonJS default export support
module.exports = compose;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: compose });
