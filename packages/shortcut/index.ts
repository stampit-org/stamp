import compose from '@stamp/compose';

import type { Composable, ComposeFunction, Descriptor, Stamp } from '@stamp/compose';

/**
 *TODO: Doc
 *
 * @extends {Stamp}
 */
export interface ShortcutStamp extends Stamp {
  /** TODO: Doc */
  methods: ShortcutMethod;
  /** TODO: Doc */
  props: ShortcutMethod;
  /** TODO: Doc */
  properties: ShortcutMethod;
  /** TODO: Doc */
  statics: ShortcutMethod;
  /** TODO: Doc */
  staticProperties: ShortcutMethod;
  /** TODO: Doc */
  conf: ShortcutMethod;
  /** TODO: Doc */
  configuration: ShortcutMethod;
  /** TODO: Doc */
  deepProps: ShortcutMethod;
  /** TODO: Doc */
  deepProperties: ShortcutMethod;
  /** TODO: Doc */
  deepStatics: ShortcutMethod;
  /** TODO: Doc */
  staticDeepProperties: ShortcutMethod;
  /** TODO: Doc */
  deepConf: ShortcutMethod;
  /** TODO: Doc */
  deepConfiguration: ShortcutMethod;
  /** TODO: Doc */
  init: ShortcutMethod;
  /** TODO: Doc */
  initializers: ShortcutMethod;
  /** TODO: Doc */
  composers: ShortcutMethod;
  /** TODO: Doc */
  propertyDescriptors: ShortcutMethod;
  /** TODO: Doc */
  staticPropertyDescriptors: ShortcutMethod;
  compose: ShortcutComposeProperty;
}

/**
 * TODO: Doc
 */
export interface ShortcutComposeProperty extends ShortcutComposeMethod, Descriptor {}

/** @internal */
interface ShortcutComposeMethod extends ComposeFunction {
  (this: Stamp | unknown, ...args: Array<Composable | undefined>): ShortcutStamp;
}

/** @internal */
type ShortcutMethod = (this: ShortcutStamp, arg: unknown) => ShortcutStamp;

/**
 * @internal
 */
type ShortcutMethodFactory = (propertyKey: PropertyKey) => ShortcutMethod;
const createShortcut: ShortcutMethodFactory = (propertyKey) => {
  return function (argument) {
    const parameter = { [propertyKey]: argument };
    return this?.compose ? this.compose(parameter) : compose(parameter);
  } as ShortcutMethod;
};

const properties = createShortcut('properties');
const staticProperties = createShortcut('staticProperties');
const configuration = createShortcut('configuration');
const deepProperties = createShortcut('deepProperties');
const staticDeepProperties = createShortcut('staticDeepProperties');
const deepConfiguration = createShortcut('deepConfiguration');
const initializers = createShortcut('initializers');

/**
 *  TODO: Doc
 */
const Shortcut = compose({
  staticProperties: {
    methods: createShortcut('methods'),
    props: properties,
    properties,
    statics: staticProperties,
    staticProperties,
    conf: configuration,
    configuration,
    deepProps: deepProperties,
    deepProperties,
    deepStatics: staticDeepProperties,
    staticDeepProperties,
    deepConf: deepConfiguration,
    deepConfiguration,
    init: initializers,
    initializers,
    composers: createShortcut('composers'),
    propertyDescriptors: createShortcut('propertyDescriptors'),
    staticPropertyDescriptors: createShortcut('staticPropertyDescriptors'),
  },
}) as ShortcutStamp;

export default Shortcut;

// For CommonJS default export support
module.exports = Shortcut;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Shortcut });
