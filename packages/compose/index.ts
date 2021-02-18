import { assign, merge } from '@stamp/core';
import { isArray, isComposable, isFunction, isObject, isStamp } from '@stamp/is';

import type {
  Composable,
  ComposeFunction,
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
  ComposerParameters as ComposerParams,
  Descriptor,
  Initializer,
  InitializerContext,
  PropertyMap,
  Stamp,
} from '@stamp/types';

const { defineProperties } = Object;
const { get, set } = Reflect;

/**
 * Creates new factory instance.
 * @returns {Function} The new factory function.
 */
type CreateFactory = () => Stamp;
const createFactory: CreateFactory = () => {
  return function Stamp(options: PropertyMap = {}, ...arguments_): ObjectInstance {
    const descriptor: Descriptor = (Stamp as Stamp).compose || {};
    const { methods, properties, deepProperties, propertyDescriptors, initializers } = descriptor;
    // Next line was optimized for most JS VMs. Please, be careful here!
    let instance: ObjectInstance = { __proto__: methods };
    // TODO: investigate code below
    // let obj = {};
    // if (methods) setPrototypeOf(obj, methods);

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
 * Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @param {ComposeFunction} composeFunction The "compose" function implementation.
 * @returns {Stamp}
 */
type CreateStamp = (descriptor: Descriptor, composeFunction: ComposeFunction) => Stamp;
const createStamp: CreateStamp = (descriptor, composeFunction) => {
  const Stamp = createFactory();

  const { staticDeepProperties, staticProperties, staticPropertyDescriptors } = descriptor;

  if (staticDeepProperties) merge(Stamp, staticDeepProperties);
  if (staticProperties) assign(Stamp, staticProperties);
  if (staticPropertyDescriptors) defineProperties(Stamp, staticPropertyDescriptors);

  const composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : composeFunction;
  Stamp.compose = function (this: Stamp | undefined, ...arguments_) {
    return composeImplementation.apply(this, arguments_);
  } as ComposeFunction;
  assign(Stamp.compose, descriptor);

  return Stamp;
};

// eslint-disable-next-line @typescript-eslint/ban-types
type ActionFunction = <T extends object = object>(dst: T, ...args: Array<object | undefined>) => T;

type ConcatAssignFunctions = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  dstObject: object,
  sourceArray: Array<Initializer | Composer> | undefined,
  propertyKey: PropertyKey
) => void;
const concatAssignFunctions: ConcatAssignFunctions = (dstObject, sourceArray, propertyKey) => {
  if (isArray(sourceArray)) {
    const deDuped = new Set(get(dstObject, propertyKey) || []);
    for (const fn of sourceArray) {
      if (isFunction(fn)) deDuped.add(fn);
    }

    set(dstObject, propertyKey, [...deDuped]);
  }
};

type CombineProperties = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  dstObject: object,
  // eslint-disable-next-line @typescript-eslint/ban-types
  sourceObject: object,
  propertyKey: PropertyKey,
  action: ActionFunction
) => void;
const combineProperties: CombineProperties = (dstObject, sourceObject, propertyKey, action) => {
  const sourceValue = get(sourceObject, propertyKey);
  if (isObject(sourceValue)) {
    if (!isObject(get(dstObject, propertyKey))) set(dstObject, propertyKey, {});
    action(get(dstObject, propertyKey), sourceValue);
  }
};

// eslint-disable-next-line @typescript-eslint/ban-types
type DeepMergeAssign = (dstObject: object, sourceObject: object, propertyKey: PropertyKey) => void;
const deepMergeAssign: DeepMergeAssign = (dstObject, sourceObject, propertyKey) => {
  combineProperties(dstObject, sourceObject, propertyKey, merge);
};

// eslint-disable-next-line @typescript-eslint/ban-types
type MergeAssign = (dstObject: object, sourceObject: object, propertyKey: PropertyKey) => void;
const mergeAssign: MergeAssign = (dstObject, sourceObject, propertyKey) => {
  combineProperties(dstObject, sourceObject, propertyKey, assign);
};

/**
 * Mutates the dstDescriptor by merging the sourceComposable data into it.
 * @param {Descriptor} dstDescriptor The descriptor object to merge into.
 * @param {Composable} [sourceComposable] The composable
 * (either descriptor or stamp) to merge data form.
 */
type MergeComposable = (dstDescriptor: Descriptor, sourceComposable: Composable) => void;
const mergeComposable: MergeComposable = (dstDescriptor, sourceComposable) => {
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
 * TODO
 */
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
