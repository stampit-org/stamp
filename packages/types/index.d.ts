/** Workaround for `Function` type */
type anyFunction = (...args: any[]) => any;
/** Workaround for `object` type */
type anyObject = Record<string, unknown>;

/**
 * A function or method which returns a Stamp
 */
export type CompositionStaticMethod = <T extends Stamp = Stamp>(this: Stamp | void, ...args: unknown[]) => T;

/**
 * An object containing a set of properties
 */
export type PropertyMap = Record<string, unknown>;

/**
 *
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type DeepPropertyMap = { [key: string]: DeepPropertyMap | unknown };
export type StaticPropertyMap = Record<string, CompositionStaticMethod | unknown>;
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type StaticDeepPropertyMap = { [key: string]: StaticDeepPropertyMap | unknown };
export type MethodMap = Record<string, anyFunction | unknown>;

export interface ObjectInstance extends PropertyMap, DeepPropertyMap, MethodMap {}

/**
 * A composable object - stamp or descriptor
 * @typedef {Stamp|Descriptor} Composable
 */
export type Composable = Stamp | Descriptor;

/**
 * The Stamp factory function
 *
 * A factory function to create plain object instances.
 * It also has a `.compose()` method which is a copy of the `ComposeMethod` function and a `.compose` accessor to its `Descriptor`.
 * @typedef {Function} Stamp
 * @returns {*} Instantiated object
 * @property {Descriptor} compose - The Stamp descriptor and composition function
 * @template O The object type that the `Stamp` will create.
 */
export interface Stamp<O extends ObjectInstance = ObjectInstance>
  extends StaticPropertyMap,
    StaticDeepPropertyMap /* extends ComposableFactory */ {
  /**
   * A method which creates a new stamp from a list of `Composable`s.
   * @template O The type of the object instance being produced by the `Stamp`. or the type of the `Stamp` being created.
   */
  compose: ComposeProperty;
  (options?: anyObject | unknown, ...args: unknown[]): O;
}

/**
 * TODO
 */
export interface ComposeProperty extends ComposeFunction, Descriptor {}

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [arguments] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 */
export type ComposeFunction<T extends Stamp = Stamp> = (this: Stamp | void, ...args: Composable[]) => T;

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
export interface Descriptor extends anyObject {
  /** A set of methods that will be added to the object's delegate prototype. */
  methods?: MethodMap;
  /** A set of properties that will be added to new object instances by assignment. */
  properties?: PropertyMap;
  /** A set of properties that will be added to new object instances by deep property merge. */
  deepProperties?: DeepPropertyMap;
  /** A set of object property descriptors (`PropertyDescriptor`) used for fine-grained control over object property behaviour. */
  propertyDescriptors?: PropertyDescriptorMap;
  /** A set of static properties that will be copied by assignment to the `Stamp`. */
  staticProperties?: StaticPropertyMap;
  /** A set of static properties that will be added to the `Stamp` by deep property merge. */
  staticDeepProperties?: StaticDeepPropertyMap;
  /** A set of object property descriptors (`PropertyDescriptor`) to apply to the `Stamp`. */
  staticPropertyDescriptors?: PropertyDescriptorMap;
  /** An array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
  initializers?: Initializer[];
  /** An array of functions that will run in sequence while creating a new `Stamp` from a list of `Composable`s. The resulting `Stamp` and the `Composable`s get passed to composers. */
  composers?: Composer[];
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  configuration?: PropertyMap;
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConfiguration?: DeepPropertyMap;
}

/**
 * A function used as `.initializers` argument.
 * @template O The type of the object instance being produced by the `Stamp`.
 * @template T The type of the `Stamp` producing the instance.
 */
export type Initializer<O extends ObjectInstance = ObjectInstance, T extends Stamp = Stamp> = (
  this: O,
  options: PropertyMap,
  context: InitializerContext<O, T>
) => O | void;

/**
 * The `Initializer` function context.
 * @template O The type of the object instance being produced by the `Stamp`.
 * @template T The type of the `Stamp` producing the instance.
 */
export interface InitializerContext<O extends ObjectInstance = ObjectInstance, T extends Stamp = Stamp> {
  /** The object instance being produced by the `Stamp`. If the initializer returns a value other than `undefined`, it replaces the instance. */
  instance: O;
  /** A reference to the `Stamp` producing the instance. */
  stamp: T;
  /** An array of the arguments passed into the `Stamp`, including the options argument. */
  args: unknown[];
}

/**
 * A function used as `.composers` argument.
 * @template T The type of the `Stamp` produced by the `.compose()` method.
 */
export type Composer<T extends Stamp = Stamp> = (this: void, parameters: ComposerParameters) => T | void;

/**
 * The parameters received by the current `.composers` function.
 * @template T The type of the `Stamp` produced by the `.compose()` method.
 */
export interface ComposerParameters<T extends Stamp = Stamp> {
  /** The result of the `Composable`s composition. */
  stamp: T;
  /** The list of composables the `Stamp` was just composed of. */
  composables: Composable[];
}
