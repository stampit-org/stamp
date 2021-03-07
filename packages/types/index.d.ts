/**
 * @internal Generic signature for a factory function
 * @template Product The object type that the `Stamp` will create.
 */
type FactoryFunction<Product> = (options?: unknown, ...args: unknown[]) => Product;

/**
 * @internal Utility type to cast a type into a factory
 * @template Factory The type of the `Stamp` producing the instance.
 * @template Product The object type that the `Stamp` will create.
 */
type AsFactory<Factory, Product> = Factory extends FactoryFunction<Product>
  ? Factory
  : Factory & FactoryFunction<Product>;

/**
 * @internal
 * @template Factory The type of the `Stamp` producing the instance.
 * @template Product The object type that the `Stamp` will create.
 */
type IsFactory<Factory, Product> = Factory extends FactoryFunction<Product> ? Factory : never;

/**
 * @internal Generic signature for a method
 * @template Bound The object type bound to the method.
 */
type anyMethod<Bound> = (this: void | Bound, ...args: any[]) => any;

/**
 * An object containing a set of metthods and properties
 * @template Bound The object type bound to the methods.
 */
export type MethodMap<Bound> = Record<string, anyMethod<Bound> | unknown>;

/**
 * An object containing a set of properties
 */
export type PropertyMap = Record<string, unknown>;

/**
 * A composable object (i.e. a stamp or a descriptor)
 * @typedef {Stamp|Descriptor} Composable
 * @template Instance The object type that the `Stamp` will create.
 * @template Stamp The type of the `Stamp` producing the instance.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export type Composable<Instance, Stamp, Context = Stamp> =
  | DefineStamp<Instance, Stamp, Context>
  | Descriptor<Instance, Stamp, Context>;

/**
 * An object with the `compose` property
 * @template Instance The object type that the `Stamp` will create.
 * @template Stamp The type of the `Stamp` producing the instance.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export interface HasComposeProperty<Instance, Stamp, Context = Stamp> {
  /**
   * A method which creates a new stamp from a list of `Composable`s.
   * @template Instance The object type that the `Stamp` will create.
   * @template Stamp The type of the `Stamp` producing the instance.
   * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
   */
  compose: ComposeProperty<Instance, Stamp, Context>;
}

/**
 * @internal Utility type to cast a type into an object with the `compose` property
 * @template Stamp The type of the `Stamp` producing the instance.
 * @template Instance The object type that the `Stamp` will create.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
type AsHasComposeProperty<Stamp, Instance, Context = Stamp> = Stamp extends HasComposeProperty<Instance, Stamp, Context>
  ? Stamp
  : Stamp & HasComposeProperty<Instance, Stamp>;

/**
 * @internal
 * @template Stamp The type of the `Stamp` producing the instance.
 * @template Instance The object type that the `Stamp` will create.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
type IsHasComposeProperty<Stamp, Instance, Context = Stamp> = Stamp extends HasComposeProperty<Instance, Stamp, Context>
  ? Stamp
  : never;

/**
 * The Stamp factory function
 *
 * A factory function to create plain object instances.
 * It also has a `.compose()` method which is a copy of the `ComposeMethod` function and a `.compose` accessor to its `Descriptor`.
 * @typedef {Function} Stamp
 * @returns {*} Instantiated object
 * @property {Descriptor} compose - The Stamp descriptor and composition function
 * @template Instance The object type that the `Stamp` will create.
 */
export interface Stamp<Instance> extends FactoryFunction<Instance>, HasComposeProperty<Instance, Stamp<Instance>> {}

/**
 * Utility type to declare a stamp signature
 * @template Instance The object type that the `Stamp` will create.
 * @template Stamp The type of the `Stamp` producing the instance.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export interface DefineStamp<Instance, Stamp, Context = Stamp>
  extends FactoryFunction<Instance>,
    HasComposeProperty<Instance, Stamp, Context> {}

/**
 * @internal Utility type to cast a type into an object with the `compose` property
 * @template Instance The object type that the `Stamp` will create.
 * @template Stamp The type of the `Stamp` producing the instance.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
type AsStamp<
  Instance,
  Stamp,
  Context = Stamp,
  ContextStamp = AsFactory<Context, Instance> & AsHasComposeProperty<Context, Instance, Context>
> = AsFactory<Stamp, Instance> & AsHasComposeProperty<Stamp, Instance, ContextStamp>;

/**
 * @internal Utility type to cast a type into an object with the `compose` property
 * @template Instance The object type that the `Stamp` will create.
 * @template Stamp The type of the `Stamp` producing the instance.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
type IsStamp<
  Instance,
  Stamp,
  Context = Stamp,
  ContextStamp = IsFactory<Context, Instance> & IsHasComposeProperty<Context, Instance, Context>
> = IsFactory<Stamp, Instance> & IsHasComposeProperty<Stamp, Instance, ContextStamp>;

/**
 * TODO
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 * @template ComposingStamp (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export interface ComposeProperty<Instance, FinalStamp, ComposingStamp = FinalStamp>
  extends ComposeFunction<Instance, FinalStamp, ComposingStamp>,
    Descriptor<Instance, FinalStamp, ComposingStamp> {}

/**
 * Given the list of composables (stamp descriptors and stamps) returns a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [arguments] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 * @template ComposingStamp (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export type ComposeFunction<Instance, FinalStamp, ComposingStamp = FinalStamp> = (
  this: void | ComposingStamp,
  ...args: Array<Composable<Instance, FinalStamp, ComposingStamp> | undefined>
) => FinalStamp;

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
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 * @template ComposingStamp (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export interface Descriptor<Instance, FinalStamp, ComposingStamp = FinalStamp> extends Record<string, unknown> {
  /** A set of methods that will be added to the object's delegate prototype. */
  methods?: MethodMap<Instance>;
  /** A set of properties that will be added to new object instances by assignment. */
  properties?: MethodMap<Instance>;
  /** A set of properties that will be added to new object instances by deep property merge. */
  deepProperties?: MethodMap<Instance>;
  /** A set of object property descriptors (`PropertyDescriptor`) used for fine-grained control over object property behaviour. */
  propertyDescriptors?: PropertyDescriptorMap;
  /** A set of static properties that will be copied by assignment to the `Stamp`. */
  staticProperties?: MethodMap<FinalStamp>;
  /** A set of static properties that will be added to the `Stamp` by deep property merge. */
  staticDeepProperties?: MethodMap<FinalStamp>;
  /** A set of object property descriptors (`PropertyDescriptor`) to apply to the `Stamp`. */
  staticPropertyDescriptors?: PropertyDescriptorMap;
  /** An array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
  initializers?: Array<Initializer<Instance, FinalStamp>>;
  /** An array of functions that will run in sequence while creating a new `Stamp` from a list of `Composable`s. The resulting `Stamp` and the `Composable`s get passed to composers. */
  composers?: Array<Composer<Instance, FinalStamp, ComposingStamp>>;
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  configuration?: PropertyMap;
  /** A set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConfiguration?: PropertyMap;
}

/**
 * A function used as `.initializers` argument.
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 */
export type Initializer<Instance, FinalStamp> = (
  this: Instance,
  options: PropertyMap,
  context: InitializerContext<Instance, FinalStamp>
) => Instance | void;

/**
 * The `Initializer` function context.
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 */
export interface InitializerContext<Instance, FinalStamp> {
  /** The object instance being produced by the `Stamp`. If the initializer returns a value other than `undefined`, it replaces the instance. */
  instance: Instance;
  /** A reference to the `Stamp` producing the instance. */
  stamp: FinalStamp;
  /** An array of the arguments passed into the `Stamp`, including the options argument. */
  args: unknown[];
}

/**
 * A function used as `.composers` argument.
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` produced by the `.compose()` method.
 * @template ComposingStamp (optional) The type of the `Stamp` produced by the `.compose()` method.
 */
export type Composer<Instance, FinalStamp, ComposingStamp = FinalStamp> = (
  this: void,
  parameters: ComposerParameters<Instance, ComposingStamp>
) => void | FinalStamp;

/**
 * The parameters received by the current `.composers` function.
 * @template Instance The object type that the `Stamp` will create.
 * @template ComposingStamp The type of the `Stamp` produced by the `.compose()` method.
 */
export interface ComposerParameters<Instance, ComposingStamp> {
  /** The result of the `Composable`s composition. */
  stamp: ComposingStamp;
  /** The list of composables the `Stamp` was just composed of. */
  composables: Array<Composable<Instance, ComposingStamp>>;
}
