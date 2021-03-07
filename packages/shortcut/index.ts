import compose from '@stamp/compose';

import type { Composable, ComposeFunction, DefineStamp, Descriptor } from '@stamp/compose';

/** @internal */
interface ShortcutComposeFunction<Instance, FinalStamp, ComposingStamp>
  extends ComposeFunction<Instance, FinalStamp, ComposingStamp> {
  (
    this: void | DefineStamp<Instance, FinalStamp, ComposingStamp>,
    ...args: Array<Composable<Instance, FinalStamp, ComposingStamp> | undefined>
  ): ShortcutStamp<Instance, FinalStamp, ComposingStamp>;
}

/**
 * TODO
 */
export interface ShortcutComposeProperty<Instance, FinalStamp, ComposingStamp = FinalStamp>
  extends ShortcutComposeFunction<Instance, FinalStamp, ComposingStamp>,
    Descriptor<Instance, FinalStamp, ComposingStamp> {}

/**
 * Adds handy static methods for simpler Stamp composition
 *
 * @extends {Stamp}
 */
export interface ShortcutStamp<Instance, FinalStamp, ComposingStamp>
  extends DefineStamp<Instance, FinalStamp, ComposingStamp> {
  /** Static function to add a set of methods that will be added to the object's delegate prototype. */
  methods: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of properties that will be added to new object instances by assignment. */
  props: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of properties that will be added to new object instances by assignment. */
  properties: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add aStatic function to add a set of properties that will be added to new object instances by deep property merge. */
  deepProps: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of properties that will be added to new object instances by deep property merge. */
  deepProperties: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of object property descriptors (`PropertyDescriptor`) used for fine-grained control over object property behaviour. */
  propertyDescriptors: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of static properties that will be copied by assignment to the `Stamp`. */
  statics: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of static properties that will be copied by assignment to the `Stamp`. */
  staticProperties: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of static properties that will be added to the `Stamp` by deep property merge. */
  deepStatics: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of static properties that will be added to the `Stamp` by deep property merge. */
  staticDeepProperties: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of object property descriptors (`PropertyDescriptor`) to apply to the `Stamp`. */
  staticPropertyDescriptors: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add an array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
  init: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add an array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
  initializers: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add an array of functions that will run in sequence while creating a new `Stamp` from a list of `Composable`s. The resulting `Stamp` and the `Composable`s get passed to composers. */
  composers: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  conf: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  configuration: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConf: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  /** Static function to add a set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConfiguration: ShortcutMethod<Instance, FinalStamp, ComposingStamp>;
  compose: ShortcutComposeProperty<Instance, FinalStamp, ComposingStamp>;
}

/** @internal ShortcutMethod */
type ShortcutMethod<Instance, FinalStamp, ComposingStamp> = (
  this: ShortcutStamp<Instance, FinalStamp, ComposingStamp>,
  arg: unknown
) => ShortcutStamp<Instance, FinalStamp, ComposingStamp>;

/** @internal createShortcut */
const createShortcut = <Instance, FinalStamp, ComposingStamp>(
  propertyKey: PropertyKey
): ShortcutMethod<Instance, FinalStamp, ComposingStamp> => {
  return function (this: ShortcutStamp<Instance, FinalStamp, ComposingStamp>, argument: unknown) {
    const parameter = { [propertyKey]: argument };
    return this?.compose ? this.compose(parameter) : compose(parameter);
  };
};

const methods = createShortcut('methods');
const properties = createShortcut('properties');
const deepProperties = createShortcut('deepProperties');
const propertyDescriptors = createShortcut('propertyDescriptors');
const staticProperties = createShortcut('staticProperties');
const staticDeepProperties = createShortcut('staticDeepProperties');
const staticPropertyDescriptors = createShortcut('staticPropertyDescriptors');
const initializers = createShortcut('initializers');
const composers = createShortcut('composers');
const configuration = createShortcut('configuration');
const deepConfiguration = createShortcut('deepConfiguration');

/** @internal ShortcutSignature */
declare function ShortcutSignature<Instance, FinalStamp, ComposingStamp = FinalStamp>(
  this: void | ComposingStamp,
  ...arguments_: Array<Composable<Instance, FinalStamp>>
): ShortcutStamp<Instance, FinalStamp, ComposingStamp>;

/**
 *  Adds handy static methods for simpler Stamp composition
 */
const Shortcut = compose({
  staticProperties: {
    methods,
    props: properties,
    properties,
    deepProps: deepProperties,
    deepProperties,
    propertyDescriptors,
    statics: staticProperties,
    staticProperties,
    deepStatics: staticDeepProperties,
    staticDeepProperties,
    staticPropertyDescriptors,
    init: initializers,
    initializers,
    composers,

    conf: configuration,
    configuration,
    deepConf: deepConfiguration,
    deepConfiguration,
  },
  // ! type should be ShorcutStamp, renamed as Shortcut
}) as typeof ShortcutSignature;

export default Shortcut;

// For CommonJS default export support
module.exports = Shortcut;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Shortcut });
