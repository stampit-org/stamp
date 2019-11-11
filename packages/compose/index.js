'use strict';

const { isArray, isComposable, isFunction, isObject, isStamp } = require('@stamp/is');
const { assign, merge } = require('@stamp/core');

const { defineProperties } = Object;
const { get, set } = Reflect;
// const { get, set, setPrototypeOf } = Reflect;

/**
 * Creates new factory instance.
 * @returns {Function} The new factory function.
 */
const createFactory = () => {
  return function Stamp(options = {}, ...args) {
    const descriptor = Stamp.compose || {};
    // Next line was optimized for most JS VMs. Please, be careful here!
    let obj = { __proto__: descriptor.methods };
    // let obj = {};
    // if (descriptor.methods) setPrototypeOf(obj, descriptor.methods);

    merge(obj, descriptor.deepProperties);
    assign(obj, descriptor.properties);
    defineProperties(obj, descriptor.propertyDescriptors || {});

    // if (!descriptor.initializers || descriptor.initializers.length === 0) return obj;
    if (descriptor.initializers && descriptor.initializers.length > 0) {
      const inits = descriptor.initializers;
      for (const initializer of inits) {
        if (isFunction(initializer)) {
          const returnedValue = initializer.call(obj, options, {
            instance: obj,
            stamp: Stamp,
            args: [options, ...args],
          });
          if (returnedValue !== undefined) obj = returnedValue;
        }
      }
    }

    return obj;
  };
};

/**
 * Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @param {Compose} composeFunction The "compose" function implementation.
 * @returns {Stamp}
 */
const createStamp = (descriptor, composeFunction) => {
  const Stamp = createFactory();

  if (descriptor.staticDeepProperties) {
    merge(Stamp, descriptor.staticDeepProperties);
  }
  if (descriptor.staticProperties) {
    assign(Stamp, descriptor.staticProperties);
  }
  if (descriptor.staticPropertyDescriptors) {
    Object.defineProperties(Stamp, descriptor.staticPropertyDescriptors);
  }

  const composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : composeFunction;
  Stamp.compose = function _compose(...args) {
    return composeImplementation.apply(this, args);
  };
  assign(Stamp.compose, descriptor);

  return Stamp;
};

const concatAssignFunctions = (dstObject, srcArray, propName) => {
  if (isArray(srcArray)) {
    const deduped = new Set(get(dstObject, propName) || []);
    for (const fn of srcArray) {
      if (isFunction(fn)) deduped.add(fn);
    }
    set(dstObject, propName, [...deduped]);
  }
};

const combineProperties = (dstObject, srcObject, propName, action) => {
  const srcValue = get(srcObject, propName);
  if (isObject(srcValue)) {
    if (!isObject(get(dstObject, propName))) set(dstObject, propName, {});
    action(get(dstObject, propName), srcValue);
  }
};

const deepMergeAssign = (dstObject, srcObject, propName) => combineProperties(dstObject, srcObject, propName, merge);
const mergeAssign = (dstObject, srcObject, propName) => combineProperties(dstObject, srcObject, propName, assign);

/**
 * Mutates the dstDescriptor by merging the srcComposable data into it.
 * @param {Descriptor} dstDescriptor The descriptor object to merge into.
 * @param {Composable} [srcComposable] The composable
 * (either descriptor or stamp) to merge data form.
 */
const mergeComposable = (dstDescriptor, srcComposable) => {
  const srcDescriptor = (srcComposable && srcComposable.compose) || srcComposable;

  mergeAssign(dstDescriptor, srcDescriptor, 'methods');
  mergeAssign(dstDescriptor, srcDescriptor, 'properties');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'deepProperties');
  mergeAssign(dstDescriptor, srcDescriptor, 'propertyDescriptors');
  mergeAssign(dstDescriptor, srcDescriptor, 'staticProperties');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'staticDeepProperties');
  mergeAssign(dstDescriptor, srcDescriptor, 'staticPropertyDescriptors');
  mergeAssign(dstDescriptor, srcDescriptor, 'configuration');
  deepMergeAssign(dstDescriptor, srcDescriptor, 'deepConfiguration');
  concatAssignFunctions(dstDescriptor, srcDescriptor.initializers, 'initializers');
  concatAssignFunctions(dstDescriptor, srcDescriptor.composers, 'composers');
};

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [arguments] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 */
function compose(...args) {
  const descriptor = {};
  const composables = [];
  const add = (value) => {
    mergeComposable(descriptor, value);
    composables.push(value);
  };

  if (isComposable(this)) add(this);

  args.forEach((arg) => isComposable(arg) && add(arg));

  let stamp = createStamp(descriptor, compose);

  const { composers } = descriptor;
  if (isArray(composers) && composers.length > 0) {
    composers.forEach((composer) => {
      const returnedValue = composer({ stamp, composables });
      if (isStamp(returnedValue)) stamp = returnedValue;
    });
  }

  return stamp;
}

module.exports = compose;

/**
 * The Stamp Descriptor
 * @typedef {Function|Object} Descriptor
 * @returns {Stamp} A new stamp based on this Stamp
 * @property {Object} [methods] Methods or other data used as object instances' prototype
 * @property {Array<Function>} [initializers] List of initializers called for each object instance
 * @property {Array<Function>} [composers] List of callbacks called each time a composition happens
 * @property {Object} [properties] Shallow assigned properties of object instances
 * @property {Object} [deepProperties] Deeply merged properties of object instances
 * @property {Object} [staticProperties] Shallow assigned properties of Stamps
 * @property {Object} [staticDeepProperties] Deeply merged properties of Stamps
 * @property {Object} [configuration] Shallow assigned properties of Stamp arbitrary metadata
 * @property {Object} [deepConfiguration] Deeply merged properties of Stamp arbitrary metadata
 * @property {Object} [propertyDescriptors] ES5 Property Descriptors applied to object instances
 * @property {Object} [staticPropertyDescriptors] ES5 Property Descriptors applied to Stamps
 */

/**
 * The Stamp factory function
 * @typedef {Function} Stamp
 * @returns {*} Instantiated object
 * @property {Descriptor} compose - The Stamp descriptor and composition function
 */

/**
 * A composable object - stamp or descriptor
 * @typedef {Stamp|Descriptor} Composable
 */
