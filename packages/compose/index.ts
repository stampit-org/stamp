import { assign, merge } from '@stamp/core';
import { isArray, isComposable, isFunction, isObject, isStamp } from '@stamp/is';

const { defineProperties } = Object;
const { get, set } = Reflect;

export type PropertyMap = { [key: string]: unknown };

/**
 * A composable object - stamp or descriptor
 * @typedef {Stamp|Descriptor} Composable
 */
export type Composable = Stamp | Descriptor;

/**
 * @internal A composable factory function that returns object instances based on its **descriptor**
 */
export interface ComposableFactory {
  (options?: object, ...args: unknown[]): object;
}
export type ComposableFactoryParams = Parameters<ComposableFactory>;

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [arguments] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 */
interface ComposeMethod {
  (/* this: unknown, */ ...args: (Composable | undefined)[]): Stamp;
}

export type ComposeProperty = ComposeMethod & Descriptor;
/**
 * The Stamp factory function
 *
 * A factory function to create plain object instances.
 * It also has a `.compose()` method which is a copy of the `ComposeMethod` function and a `.compose` accessor to its `Descriptor`.
 * @typedef {Function} Stamp
 * @returns {*} Instantiated object
 * @property {Descriptor} compose - The Stamp descriptor and composition function
 * @template Obj The object type that the `Stamp` will create.
 */
export interface Stamp extends ComposableFactory {
  /**
   * A method which creates a new stamp from a list of `Composable`s.
   * @template Obj The type of the object instance being produced by the `Stamp`. or the type of the `Stamp` being created.
   */
  compose: ComposeProperty;
}

// /** @internal Signature common to every `Stamp`s. */
// type StampSignature = Stamp;

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
export interface Descriptor {
  /** A set of methods that will be added to the object's delegate prototype. */
  methods?: object;
  /** A set of properties that will be added to new object instances by assignment. */
  properties?: PropertyMap;
  /** A set of properties that will be added to new object instances by deep property merge. */
  deepProperties?: PropertyMap;
  /** A set of object property descriptors (`PropertyDescriptor`) used for fine-grained control over object property behaviors. */
  propertyDescriptors?: PropertyDescriptorMap;
  /** A set of static properties that will be copied by assignment to the `Stamp`. */
  staticProperties?: PropertyMap;
  /** A set of static properties that will be added to the `Stamp` by deep property merge. */
  staticDeepProperties?: PropertyMap;
  /** A set of object property descriptors (`PropertyDescriptor`) to apply to the `Stamp`. */
  staticPropertyDescriptors?: PropertyDescriptorMap;
  /** An array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
  initializers?: Initializer[];
  /** An array of functions that will run in sequence while creating a new `Stamp` from a list of `Composable`s. The resulting `Stamp` and the `Composable`s get passed to composers. */
  composers?: Composer[];
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  configuration?: PropertyMap;
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConfiguration?: PropertyMap;
}

/**
 * A function used as `.initializers` argument.
 * @template Obj The type of the object instance being produced by the `Stamp`.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` producing the instance.
 */
export interface Initializer {
  (this: object, options: PropertyMap, context: InitializerContext): object | void;
}

/**
 * The `Initializer` function context.
 * @template Obj The type of the object instance being produced by the `Stamp`.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` producing the instance.
 */
interface InitializerContext {
  /** The object instance being produced by the `Stamp`. If the initializer returns a value other than `undefined`, it replaces the instance. */
  instance: object;
  /** A reference to the `Stamp` producing the instance. */
  stamp: Stamp;
  /** An array of the arguments passed into the `Stamp`, including the options argument. */
  args: unknown[];
}

/**
 * A function used as `.composers` argument.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` produced by the `.compose()` method.
 */
export interface Composer {
  (parameters: ComposerParams): Stamp | void;
}

/**
 * The parameters received by the current `.composers` function.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` produced by the `.compose()` method.
 */
interface ComposerParams {
  /** The result of the `Composable`s composition. */
  stamp: Stamp;
  /** The list of composables the `Stamp` was just composed of. */
  composables: Composable[];
}

// ----- // ----- // ----- // ----- // ----- //

/**
 * Creates new factory instance.
 * @returns {Function} The new factory function.
 */
interface CreateFactory {
  // (): ComposableFactory;
  (): Stamp;
}
const createFactory: CreateFactory = () => {
  return function Stamp(options: PropertyMap = {}, ...moreArgs): object {
    const descriptor: Descriptor = (Stamp as Stamp).compose || {};
    const { methods, properties, deepProperties, propertyDescriptors, initializers } = descriptor;
    // Next line was optimized for most JS VMs. Please, be careful here!
    let instance: object = { __proto__: methods };
    // let obj = {};
    // if (methods) setPrototypeOf(obj, methods);

    merge(instance, deepProperties);
    assign(instance, properties);
    defineProperties(instance, propertyDescriptors || {});

    // if (!initializers || initializers.length === 0) return obj;
    if (initializers && initializers.length > 0) {
      const args = [options, ...moreArgs];
      for (const initializer of initializers) {
        if (isFunction<Initializer>(initializer)) {
          instance = (initializer.call(instance, options, { instance, stamp: Stamp as Stamp, args }) ??
            instance) as object;
        }
      }
    }

    return instance;
  } as Stamp;
};

/**
 * Returns a new stamp given a descriptor and a compose function implementation.
 * @param {Descriptor} [descriptor={}] The information about the object the stamp will be creating.
 * @param {ComposeMethod} composeFunction The "compose" function implementation.
 * @returns {Stamp}
 */
interface CreateStamp {
  (descriptor: Descriptor, composeFunction: ComposeMethod): Stamp;
}
const createStamp: CreateStamp = (descriptor, composeFunction) => {
  const Stamp = createFactory();

  const { staticDeepProperties, staticProperties, staticPropertyDescriptors } = descriptor;

  if (staticDeepProperties) merge(Stamp, staticDeepProperties);
  if (staticProperties) assign(Stamp, staticProperties);
  if (staticPropertyDescriptors) defineProperties(Stamp, staticPropertyDescriptors);

  const composeImplementation = isFunction(Stamp.compose) ? Stamp.compose : composeFunction;
  Stamp.compose = function _compose(this: unknown, ...args) {
    return composeImplementation.apply(this, args);
  } as ComposeMethod;
  assign(Stamp.compose, descriptor);

  return Stamp;
};

interface ActionFunction {
  <T extends object = object>(dst: T, ...args: (object | undefined)[]): T;
}

interface ConcatAssignFunctions {
  (dstObject: object, srcArray: (Initializer | Composer)[] | undefined, propName: PropertyKey): void;
}
const concatAssignFunctions: ConcatAssignFunctions = (dstObject, srcArray, propName) => {
  if (isArray(srcArray)) {
    const deduped = new Set(get(dstObject, propName) || []);
    for (const fn of srcArray) {
      if (isFunction(fn)) deduped.add(fn);
    }
    set(dstObject, propName, [...deduped]);
  }
};

interface CombineProperties {
  (dstObject: object, srcObject: object, propName: PropertyKey, action: ActionFunction): void;
}
const combineProperties: CombineProperties = (dstObject, srcObject, propName, action) => {
  const srcValue = get(srcObject, propName);
  if (isObject(srcValue)) {
    if (!isObject(get(dstObject, propName))) set(dstObject, propName, {});
    action(get(dstObject, propName), srcValue);
  }
};

interface DeepMergeAssign {
  (dstObject: object, srcObject: object, propName: PropertyKey): void;
}
const deepMergeAssign: DeepMergeAssign = (dstObject, srcObject, propName) =>
  combineProperties(dstObject, srcObject, propName, merge);

interface MergeAssign {
  (dstObject: object, srcObject: object, propName: PropertyKey): void;
}
const mergeAssign: MergeAssign = (dstObject, srcObject, propName) =>
  combineProperties(dstObject, srcObject, propName, assign);

/**
 * Mutates the dstDescriptor by merging the srcComposable data into it.
 * @param {Descriptor} dstDescriptor The descriptor object to merge into.
 * @param {Composable} [srcComposable] The composable
 * (either descriptor or stamp) to merge data form.
 */
interface MergeComposable {
  (dstDescriptor: Descriptor, srcComposable: Composable): void;
}
const mergeComposable: MergeComposable = (dstDescriptor, srcComposable) => {
  const srcDescriptor: Descriptor = (srcComposable && (srcComposable as Stamp).compose) || srcComposable;

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

export const compose: ComposeMethod = function compose(this: unknown, ...args) {
  const descriptor: Descriptor = {};
  const composables: Composable[] = [];

  if (isComposable(this)) {
    mergeComposable(descriptor, this);
    composables.push(this);
  }

  for (const arg of args) {
    if (isComposable(arg)) {
      mergeComposable(descriptor, arg);
      composables.push(arg);
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
