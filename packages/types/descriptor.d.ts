import type { Composer } from './composer';
import type { Initializer } from './initializer';
import type { MethodMap, PropertyMap } from './maps';

/**
 * Composable descriptor (or just descriptor) is a meta data object which contains the information necessary to create an object instance.
 *
 * The names and definitions of the fixed properties that form the stamp descriptor. The stamp descriptor properties are made available on each stamp as stamp.compose.*
 * - methods - A set of methods that will be added to the object's delegate prototype.
 * - properties - A set of properties that will be added to new object instances by assignment.
 * - deepProperties - A set of properties that will be added to new object instances by deep property merge.
 * - propertyDescriptors - A set of object property descriptors used for fine-grained control over object property behaviors.
 * - staticProperties - A set of static properties that will be copied by assignment to the stamp.
 * - staticDeepProperties - A set of static properties that will be added to the stamp by deep property merge.
 * - staticPropertyDescriptors - A set of object property descriptors to apply to the stamp.
 * - initializers - An array of functions that will run in sequence while creating an object instance from a stamp. Stamp details and arguments get passed to initializers.
 * - composers - An array of functions that will run in sequence while creating a new stamp from a list of composables. The resulting stamp and the composables get passed to composers.
 * - configuration - A set of options made available to the stamp and its initializers during object instance creation. These will be copied by assignment.
 * - deepConfiguration - A set of options made available to the stamp and its initializers during object instance creation. These will be deep merged.
 * @link https://github.com/stampit-org/stamp-specification#descriptor
 */
type Specification = never;

// TODO Descriptor should not require generic
// TODO investigate *Opaque* or nominal typing for Descriptors

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
export interface Descriptor<Instance, FinalStamp, ComposingStamp = FinalStamp> {
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
