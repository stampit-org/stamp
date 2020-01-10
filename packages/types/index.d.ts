// export as namespace StampSpecificationV16;

/**
 * TODO
 */
type PropertyMap = { [key: string]: unknown };

/**
 * A composable object - stamp or descriptor
 * @typedef {Stamp|Descriptor} Composable
 */
type Composable = Stamp | Descriptor;

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

/**
 * TODO
 */
export interface ComposeProperty extends ComposeMethod, Descriptor {}

/**
 * Given the list of composables (stamp descriptors and stamps) returns
 * a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [arguments] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 */
interface ComposeMethod {
  (this: Stamp | unknown, ...args: (Composable | undefined)[]): Stamp;
}

/**
 * @internal A composable factory function that returns object instances based on its **descriptor**
 */
export interface ComposableFactory {
  (options?: object, ...args: unknown[]): object;
}

export type ComposableFactoryParams = Parameters<ComposableFactory>;

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
interface Descriptor {
  /** A set of methods that will be added to the object's delegate prototype. */
  methods?: PropertyMap;
  /** A set of properties that will be added to new object instances by assignment. */
  properties?: PropertyMap;
  /** A set of properties that will be added to new object instances by deep property merge. */
  deepProperties?: PropertyMap;
  /** A set of object property descriptors (`PropertyDescriptor`) used for fine-grained control over object property behaviour. */
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
interface Initializer {
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
interface Composer {
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
