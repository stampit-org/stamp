import { compose, Descriptor, Stamp } from '@stamp/compose';

interface ShortcutMethod {
  (this: StampWithShortcuts, arg: unknown): StampWithShortcuts;
}

interface CreateShortcut {
  (propName: string): ShortcutMethod;
}

const createShortcut: CreateShortcut = (propName) => {
  // eslint-disable-next-line func-names
  return function(arg) {
    const param = { [propName]: arg };
    return this?.compose ? this.compose(param) : compose(param);
  } as ShortcutMethod;
};

const properties = createShortcut('properties');
const staticProperties = createShortcut('staticProperties');
const configuration = createShortcut('configuration');
const deepProperties = createShortcut('deepProperties');
const staticDeepProperties = createShortcut('staticDeepProperties');
const deepConfiguration = createShortcut('deepConfiguration');
const initializers = createShortcut('initializers');

// TODO: enhance typing
export type Composable = Stamp | Descriptor;
interface ComposeMethod {
  (/* this: unknown, */ ...args: (Composable | undefined)[]): StampWithShortcuts;
}

export type ComposeProperty = ComposeMethod & Descriptor;
export interface StampWithShortcuts extends Stamp {
  methods: ShortcutMethod;
  props: ShortcutMethod;
  properties: ShortcutMethod;
  statics: ShortcutMethod;
  staticProperties: ShortcutMethod;
  conf: ShortcutMethod;
  configuration: ShortcutMethod;
  deepProps: ShortcutMethod;
  deepProperties: ShortcutMethod;
  deepStatics: ShortcutMethod;
  staticDeepProperties: ShortcutMethod;
  deepConf: ShortcutMethod;
  deepConfiguration: ShortcutMethod;
  init: ShortcutMethod;
  initializers: ShortcutMethod;
  composers: ShortcutMethod;
  propertyDescriptors: ShortcutMethod;
  staticPropertyDescriptors: ShortcutMethod;
  compose: ComposeProperty;
}

// TODO: Stamp's `ComposeMethod` should issue StampWithShortcuts
// TODO: Augment `Stamp` signature with `StampWithShortcuts`
export const Shortcut = compose({
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
}) as StampWithShortcuts;

export default Shortcut;
