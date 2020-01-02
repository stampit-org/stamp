'use strict';

import { isArray, isComposable, isFunction, isObject, isStamp } from '@stamp/is';
import { assign, merge } from '@stamp/core';

const { defineProperties } = Object;
const { get, set } = Reflect;
// const { get, set, setPrototypeOf } = Reflect;

/**
 * Creates new factory instance.
 * @returns {Function} The new factory function.
 */
const createFactory = <Obj extends object>(): StampType<Obj> => {
  return function Stamp(options: PropertyMap = {}, ...args: unknown[]): Obj {
    const descriptor: Descriptor<Obj> = (Stamp as any).compose ?? {};
    // Next line was optimized for most JS VMs. Please, be careful here!
    let obj = ({ __proto__: descriptor.methods } as unknown) as Obj;
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
            stamp: (Stamp as unknown) as StampType<Obj>,
            args: [options, ...args],
          });
          if (returnedValue !== undefined) obj = returnedValue;
        }
      }
    }

    return obj;
  } as StampType<Obj>;
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
const mergeComposable = <Obj>(dstDescriptor: Descriptor<Obj>, srcComposable: Composable): void => {
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
export function compose<Obj = any>(this: unknown, ...args: Composable[]): StampType<Obj> {
  const descriptor: Descriptor<Obj> = {};
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
      const returnedValue = composer({
        stamp,
        composables,
      });
      if (isStamp(returnedValue)) stamp = returnedValue;
    }
  }

  return stamp;
}

/**
 * A function which creates a new `Stamp`s from a list of `Composable`s.
 * @template Obj The type of the object instance being produced by the `Stamp` or the type of the `Stamp` being created (when extending a `Stamp`.)
 */
// function stampit<Obj = any>(...composables: Composable[]): StampType<Obj>
type ComposeMethod = typeof compose;

/**
 * @internal Base type for all `methods`-like metadata.
 * @template This The type to use for `this` within methods.
 */
interface MethodMap<This> {
  [s: string]: ((this: This, ...args: any[]) => any) | {};
}

/** @internal A plain old JavaScript object created by a `Stamp`. */
type Pojo = object; // { [s: string]: any; }

/** @internal Base type for all `properties`-like metadata. */
// TODO: discriminate Array
type PropertyMap = object; // { [s: string]: any; }

/** @internal Signature common to every `Stamp`s. */
interface StampSignature {
  (options?: PropertyMap, ...args: unknown[]): any;
  compose: ComposeMethod & Descriptor<any, any>;
}

/**
 * @internal Extracts the `Stamp` type.
 * @template Original The type to extract the `Stamp` type from.
 */
type StampType<Original> = Original extends /* disallowed types */ [] | bigint
  ? never
  : IsADescriptor<Original> extends true
  ? Original extends ExtendedDescriptor<infer Obj, infer Stamp>
    ? Stamp
    : never
  : unknown extends Original /* is any or unknown */
  ? Stamp<Original>
  : Original extends StampSignature
  ? Original
  : Original extends ExtendedDescriptor<infer Obj, any>
  ? Stamp<Obj>
  : Original extends Pojo
  ? Stamp<Original> /* assume it is the object from a stamp object */
  : never;

/**
 * @internal The type of the object produced by the `Stamp`.
 * @template Original The type (either a `Stamp` or a `ExtendedDescriptor`) to get the object type from.
 */
type StampObjectType<Original> = Original extends /* disallowed types */ bigint | boolean | number | string | symbol
  ? never
  : IsADescriptor<Original> extends true
  ? Original extends ExtendedDescriptor<infer Obj, any>
    ? Obj
    : never
  : unknown extends Original /* is any or unknown */
  ? Original
  : Original extends StampSignature
  ? Original extends Stamp<infer Obj> /* extended stamps may require infering twice */
    ? Obj extends Stamp<infer Obj>
      ? Obj
      : Obj
    : any
  : Original extends ExtendedDescriptor<infer Obj, any>
  ? Obj
  : Original extends Pojo
  ? Original
  : never;

/**
 * A factory function to create plain object instances.
 * @template Obj The object type that the `Stamp` will create.
 */
interface FactoryFunction<Obj> {
  (options?: PropertyMap, ...args: any[]): StampObjectType<Obj>;
}

/**
 * @internal Chainables `Stamp` additionnal methods
 * @template Obj The object type that the `Stamp` will create.
 */
type StampChainables<Obj> = Chainables<StampObjectType<Obj>, StampType<Obj>>;

/**
 * @internal Chainables `Stamp` additionnal methods
 * @template Obj The object type that the `Stamp` will create.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` (when extending a `Stamp`.)
 */
interface Chainables<Obj, S̤t̤a̤m̤p̤ extends StampSignature> {
  /**
   * Add methods to the methods prototype. Creates and returns new Stamp. **Chainable**.
   * @template This The type to use for `this` within methods.
   * @param methods Object(s) containing map of method names and bodies for delegation.
   */
  // tslint:disable-next-line: no-unnecessary-generics
  methods<This = Obj>(...methods: Array<MethodMap<This>>): S̤t̤a̤m̤p̤;

  /**
   * Take a variable number of objects and shallow assign them to any future created instance of the Stamp. Creates and returns new Stamp. **Chainable**.
   * @param objects Object(s) to shallow assign for each new object.
   */
  properties(...objects: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Take a variable number of objects and shallow assign them to any future created instance of the Stamp. Creates and returns new Stamp. **Chainable**.
   * @param objects Object(s) to shallow assign for each new object.
   */
  props(...objects: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Take a variable number of objects and deeply merge them to any future created instance of the Stamp. Creates and returns a new Stamp. **Chainable**.
   * @param deepObjects The object(s) to deeply merge for each new object.
   */
  deepProperties(...deepObjects: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Take a variable number of objects and deeply merge them to any future created instance of the Stamp. Creates and returns a new Stamp. **Chainable**.
   * @param deepObjects The object(s) to deeply merge for each new object.
   */
  deepProps(...deepObjects: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Take in a variable number of functions and add them to the initializers prototype as initializers. **Chainable**.
   * @param functions Initializer functions used to create private data and privileged methods.
   */
  initializers(...functions: Array<Initializer<Obj, S̤t̤a̤m̤p̤>>): S̤t̤a̤m̤p̤;
  initializers(functions: Array<Initializer<Obj, S̤t̤a̤m̤p̤>>): S̤t̤a̤m̤p̤;

  /**
   * Take in a variable number of functions and add them to the initializers prototype as initializers. **Chainable**.
   * @param functions Initializer functions used to create private data and privileged methods.
   */
  init(...functions: Array<Initializer<Obj, S̤t̤a̤m̤p̤>>): S̤t̤a̤m̤p̤;
  init(functions: Array<Initializer<Obj, S̤t̤a̤m̤p̤>>): S̤t̤a̤m̤p̤;

  /**
   * Take n objects and add them to a new stamp and any future stamp it composes with. Creates and returns new Stamp. **Chainable**.
   * @param statics Object(s) containing map of property names and values to mixin into each new stamp.
   */
  staticProperties(...statics: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Take n objects and add them to a new stamp and any future stamp it composes with. Creates and returns new Stamp. **Chainable**.
   * @param statics Object(s) containing map of property names and values to mixin into each new stamp.
   */
  statics(...statics: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Deeply merge a variable number of objects and add them to a new stamp and any future stamp it composes. Creates and returns a new Stamp. **Chainable**.
   * @param deepStatics The object(s) containing static properties to be merged.
   */
  staticDeepProperties(...deepStatics: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Deeply merge a variable number of objects and add them to a new stamp and any future stamp it composes. Creates and returns a new Stamp. **Chainable**.
   * @param deepStatics The object(s) containing static properties to be merged.
   */
  deepStatics(...deepStatics: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Take in a variable number of functions and add them to the composers prototype as composers. **Chainable**.
   * @param functions Composer functions that will run in sequence while creating a new stamp from a list of composables.  The resulting stamp and the composables get passed to composers.
   */
  composers(...functions: Array<Composer<S̤t̤a̤m̤p̤>>): S̤t̤a̤m̤p̤;
  composers(functions: Array<Composer<S̤t̤a̤m̤p̤>>): S̤t̤a̤m̤p̤;

  /**
   * Shallowly assign properties of Stamp arbitrary metadata and add them to a new stamp and any future Stamp it composes. Creates and returns a new Stamp. **Chainable**.
   * @param confs The object(s) containing metadata properties.
   */
  configuration(...confs: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Shallowly assign properties of Stamp arbitrary metadata and add them to a new stamp and any future Stamp it composes. Creates and returns a new Stamp. **Chainable**.
   * @param confs The object(s) containing metadata properties.
   */
  conf(...confs: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Deeply merge properties of Stamp arbitrary metadata and add them to a new Stamp and any future Stamp it composes. Creates and returns a new Stamp. **Chainable**.
   * @param deepConfs The object(s) containing metadata properties.
   */
  deepConfiguration(...deepConfs: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Deeply merge properties of Stamp arbitrary metadata and add them to a new Stamp and any future Stamp it composes. Creates and returns a new Stamp. **Chainable**.
   * @param deepConfs The object(s) containing metadata properties.
   */
  deepConf(...deepConfs: PropertyMap[]): S̤t̤a̤m̤p̤;

  /**
   * Apply ES5 property descriptors to object instances created by the new Stamp returned by the function and any future Stamp it composes. Creates and returns a new stamp. **Chainable**.
   * @param descriptors
   */
  propertyDescriptors(...descriptors: PropertyDescriptorMap[]): S̤t̤a̤m̤p̤;

  /**
   * Apply ES5 property descriptors to a Stamp and any future Stamp it composes. Creates and returns a new stamp. **Chainable**.
   * @param descriptors
   */
  staticPropertyDescriptors(...descriptors: PropertyDescriptorMap[]): S̤t̤a̤m̤p̤;
}

/** A composable object (either a `Stamp` or a `ExtendedDescriptor`.) */
type Composable = StampSignature | ExtendedDescriptor<any, any>;

/**
 * A `Stamp`'s metadata.
 * @template Obj The type of the object instance being produced by the `Stamp`.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` (when extending a `Stamp`.)
 */
interface Descriptor<Obj, S̤t̤a̤m̤p̤ extends StampSignature = Stamp<Obj>> {
  /** A set of methods that will be added to the object's delegate prototype. */
  methods?: MethodMap<Obj>;
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
  // initializers?: Initializer<Obj, S̤t̤a̤m̤p̤> | Array<Initializer<Obj, S̤t̤a̤m̤p̤>>;
  initializers?: Array<Initializer<Obj, S̤t̤a̤m̤p̤>>;
  /** An array of functions that will run in sequence while creating a new `Stamp` from a list of `Composable`s. The resulting `Stamp` and the `Composable`s get passed to composers. */
  composers?: Array<Composer<S̤t̤a̤m̤p̤>>;
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  configuration?: PropertyMap;
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConfiguration?: PropertyMap;
}

/**
 * A `stampit`'s metadata.
 * @template Obj The type of the object instance being produced by the `Stamp`.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` (when extending a `Stamp`.)
 */
interface ExtendedDescriptor<Obj, S̤t̤a̤m̤p̤ extends StampSignature = Stamp<Obj>> extends Descriptor<Obj, S̤t̤a̤m̤p̤> {
  /** A set of properties that will be added to new object instances by assignment. */
  props?: PropertyMap;
  /** A set of properties that will be added to new object instances by deep property merge. */
  deepProps?: PropertyMap;
  /** A set of static properties that will be copied by assignment to the `Stamp`. */
  statics?: PropertyMap;
  /** A set of static properties that will be added to the `Stamp` by deep property merge. */
  deepStatics?: PropertyMap;
  /** An array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
  init?: Initializer<Obj, S̤t̤a̤m̤p̤> | Array<Initializer<Obj, S̤t̤a̤m̤p̤>>;
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  conf?: PropertyMap;
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConf?: PropertyMap;
  // TODO: Add description
  name?: string;
}

/**
 * @internal Checks that a type is a ExtendedDescriptor (except `any` and `unknown`).
 * @template Type A type to check if a ExtendedDescriptor.
 */
// TODO: Improve test by checking the type of common keys
type IsADescriptor<Type> = unknown extends Type
  ? keyof Type extends never
    ? false
    : keyof Type extends infer K
    ? K extends keyof ExtendedDescriptor<unknown>
      ? true
      : false
    : false
  : false;

/**
 * A function used as `.initializers` argument.
 * @template Obj The type of the object instance being produced by the `Stamp`.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` producing the instance.
 */
interface Initializer<Obj, S̤t̤a̤m̤p̤ extends StampSignature> {
  (this: Obj, options: /* _propertyMap */ any, context: InitializerContext<Obj, S̤t̤a̤m̤p̤>): void | Obj;
}

/**
 * The `Initializer` function context.
 * @template Obj The type of the object instance being produced by the `Stamp`.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` producing the instance.
 */
interface InitializerContext<Obj, S̤t̤a̤m̤p̤ extends StampSignature> {
  /** The object instance being produced by the `Stamp`. If the initializer returns a value other than `undefined`, it replaces the instance. */
  instance: Obj;
  /** A reference to the `Stamp` producing the instance. */
  stamp: S̤t̤a̤m̤p̤;
  /** An array of the arguments passed into the `Stamp`, including the options argument. */
  // ! above description from the specification is obscure
  args: any[];
}

/**
 * A function used as `.composers` argument.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` produced by the `.compose()` method.
 */
interface Composer<S̤t̤a̤m̤p̤ extends StampSignature> {
  (parameters: ComposerParameters<S̤t̤a̤m̤p̤>): void | S̤t̤a̤m̤p̤;
}

/**
 * The parameters received by the current `.composers` function.
 * @template S̤t̤a̤m̤p̤ The type of the `Stamp` produced by the `.compose()` method.
 */
interface ComposerParameters<S̤t̤a̤m̤p̤ extends StampSignature> {
  /** The result of the `Composable`s composition. */
  stamp: S̤t̤a̤m̤p̤;
  /** The list of composables the `Stamp` was just composed of. */
  composables: Composable[];
}

/**
 * A factory function to create plain object instances.
 *
 * It also has a `.compose()` method which is a copy of the `ComposeMethod` function and a `.compose` accessor to its `Descriptor`.
 * @template Obj The object type that the `Stamp` will create.
 */
interface Stamp<Obj> extends FactoryFunction<Obj>, StampChainables<Obj>, StampSignature {
  /** Just like calling stamp(), stamp.create() invokes the stamp and returns a new instance. */
  create: FactoryFunction<Obj>;

  /**
   * A function which creates a new `Stamp`s from a list of `Composable`s.
   * @template Obj The type of the object instance being produced by the `Stamp`. or the type of the `Stamp` being created.
   */
  compose: ComposeMethod & Descriptor<StampObjectType<Obj>>;
}

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
