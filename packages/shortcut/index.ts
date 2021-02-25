import compose from '@stamp/compose';

import type { Composable, ComposeFunction, Descriptor, Stamp } from '@stamp/compose';

/**
 * Adds handy static methods for simpler Stamp composition
 *
 * @extends {Stamp}
 */
// TODO: ShortcutStamp should support generics like <ObjectInstance, OriginalStamp>
export interface ShortcutStamp extends Stamp {
  /** Static function to add a set of methods that will be added to the object's delegate prototype. */
  methods: ShortcutMethod;
  /** Static function to add a set of properties that will be added to new object instances by assignment. */
  props: ShortcutMethod;
  /** Static function to add a set of properties that will be added to new object instances by assignment. */
  properties: ShortcutMethod;
  /** Static function to add aStatic function to add a set of properties that will be added to new object instances by deep property merge. */
  deepProps: ShortcutMethod;
  /** Static function to add a set of properties that will be added to new object instances by deep property merge. */
  deepProperties: ShortcutMethod;
  /** Static function to add a set of object property descriptors (`PropertyDescriptor`) used for fine-grained control over object property behaviour. */
  propertyDescriptors: ShortcutMethod;
  /** Static function to add a set of static properties that will be copied by assignment to the `Stamp`. */
  statics: ShortcutMethod;
  /** Static function to add a set of static properties that will be copied by assignment to the `Stamp`. */
  staticProperties: ShortcutMethod;
  /** Static function to add a set of static properties that will be added to the `Stamp` by deep property merge. */
  deepStatics: ShortcutMethod;
  /** Static function to add a set of static properties that will be added to the `Stamp` by deep property merge. */
  staticDeepProperties: ShortcutMethod;
  /** Static function to add a set of object property descriptors (`PropertyDescriptor`) to apply to the `Stamp`. */
  staticPropertyDescriptors: ShortcutMethod;
  /** Static function to add an array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
  init: ShortcutMethod;
  /** Static function to add an array of functions that will run in sequence while creating an object instance from a `Stamp`. `Stamp` details and arguments get passed to initializers. */
  initializers: ShortcutMethod;
  /** Static function to add an array of functions that will run in sequence while creating a new `Stamp` from a list of `Composable`s. The resulting `Stamp` and the `Composable`s get passed to composers. */
  composers: ShortcutMethod;
  /** Static function to add a set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  conf: ShortcutMethod;
  /** Static function to add a set of options made available to the `Stamp` and its initializers during object instance creation. These will be copied by assignment. */
  configuration: ShortcutMethod;
  /** Static function to add a set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConf: ShortcutMethod;
  /** Static function to add a set of options made available to the `Stamp` and its initializers during object instance creation. These will be deep merged. */
  deepConfiguration: ShortcutMethod;
  compose: ShortcutComposeProperty;
}

/** @internal */
interface ShortcutComposeMethod extends ComposeFunction {
  (this: Stamp | unknown, ...args: Array<Composable | undefined>): ShortcutStamp;
}

/** @internal */
// TODO: ShortcutComposeProperty should support generics like <ObjectInstance>
export interface ShortcutComposeProperty extends ShortcutComposeMethod, Descriptor {}

/** @internal ShortcutMethod */
// TODO: ShortcutMethod should support generics like <ObjectInstance>
type ShortcutMethod = (this: ShortcutStamp, arg: unknown) => ShortcutStamp;

/** @internal createShortcut */
// TODO: createShortcut should support generics like <ObjectInstance>
const createShortcut = (propertyKey: PropertyKey): ShortcutMethod => {
  return function (this: ShortcutStamp, argument: unknown) {
    const parameter = { [propertyKey]: argument };
    return this?.compose ? this.compose(parameter) : (compose(parameter) as ShortcutStamp);
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

/**
 *  Adds handy static methods for simpler Stamp composition
 */
// TODO: Shortcut should support generics like <ObjectInstance, OriginalStamp>
const Shortcut: ShortcutStamp = compose({
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
}) as ShortcutStamp;

export default Shortcut;

// For CommonJS default export support
module.exports = Shortcut;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Shortcut });
