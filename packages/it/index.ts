/* eslint @typescript-eslint/no-use-before-define: ["error", { "variables": false }] */
import compose from '@stamp/compose';
import { assign, merge } from '@stamp/core';
import { isFunction, isObject, isStamp, isString } from '@stamp/is';
import Shortcut from '@stamp/shortcut';

import type { Composable, Composer, Descriptor, Initializer } from '@stamp/compose';
import type { ShortcutComposeProperty, ShortcutStamp } from '@stamp/shortcut';

/** Workaround for `object` type */
type anyObject = Record<string, unknown>;

const { concat } = Array.prototype;
const { get, ownKeys, set } = Reflect;

type ExtractFunctions = (...args: unknown[]) => Composer[] | Initializer[] | undefined;
const extractFunctions: ExtractFunctions = (...arguments_) => {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  const fns = concat.apply([], [...arguments_]).filter(isFunction) as Composer[] | Initializer[];
  return fns.length === 0 ? undefined : fns;
};

interface ExtendedDescriptor extends Descriptor {
  props?: Descriptor['properties'];
  init?: Descriptor['initializers'];
  deepProps?: Descriptor['deepProperties'];
  statics?: Descriptor['staticProperties'];
  deepStatics?: Descriptor['staticDeepProperties'];
  conf?: Descriptor['configuration'];
  deepConf?: Descriptor['deepConfiguration'];
  name?: string;
}

type StandardiseDescriptor = (descriptor: ExtendedDescriptor | undefined) => Descriptor | undefined;
/* eslint-disable complexity */
const standardiseDescriptor: StandardiseDescriptor = (descriptor) => {
  if (!isObject(descriptor)) return descriptor;

  const {
    methods,
    properties,
    props,
    initializers,
    init,
    composers,
    deepProperties,
    deepProps,
    propertyDescriptors,
    staticProperties,
    statics,
    staticDeepProperties,
    deepStatics,
    configuration,
    conf,
    deepConfiguration,
    deepConf,
    name,
  } = descriptor;

  const p = isObject(props) || isObject(properties) ? assign({}, props, properties) : undefined;
  const dp = isObject(deepProps) || isObject(deepProperties) ? merge({}, deepProps, deepProperties) : undefined;
  const sp = isObject(statics) || isObject(staticProperties) ? assign({}, statics, staticProperties) : undefined;
  const sdp =
    isObject(deepStatics) || isObject(staticDeepProperties) ? merge({}, deepStatics, staticDeepProperties) : undefined;

  let { staticPropertyDescriptors: spd } = descriptor;
  if (isString(name)) spd = assign({}, spd ?? {}, { name: { value: name } });

  const c = isObject(conf) || isObject(configuration) ? assign({}, conf, configuration) : undefined;
  const dc = isObject(deepConf) || isObject(deepConfiguration) ? merge({}, deepConf, deepConfiguration) : undefined;
  const ii = extractFunctions(init, initializers) as Initializer[] | undefined;
  const cc = extractFunctions(composers) as Composer[] | undefined;

  const standardDescriptor: Descriptor = {};
  if (methods) standardDescriptor.methods = methods;
  if (p) standardDescriptor.properties = p;
  if (ii) standardDescriptor.initializers = ii;
  if (cc) standardDescriptor.composers = cc;
  if (dp) standardDescriptor.deepProperties = dp;
  if (sp) standardDescriptor.staticProperties = sp;
  if (sdp) standardDescriptor.staticDeepProperties = sdp;
  if (propertyDescriptors) standardDescriptor.propertyDescriptors = propertyDescriptors;
  if (spd) standardDescriptor.staticPropertyDescriptors = spd;
  if (c) standardDescriptor.configuration = c;
  if (dc) standardDescriptor.deepConfiguration = dc;

  return standardDescriptor;
};
/* eslint-enable complexity */

/**
 * TODO
 *
 * @interface StampIt
 * @extends {ShortcutStamp}
 */
interface StampIt extends ShortcutStamp {
  (this: unknown, ...args: Array<ExtendedDescriptor | ShortcutStamp>): ShortcutStamp;
}
// { (...args: any[]): StampWithShortcuts; compose: ComposeMethod & Descriptor; }
const stampit = function (this: StampIt, ...arguments_: Array<Composable | undefined>) {
  return compose.apply(
    this || baseStampit,
    arguments_.map((argument) => (isStamp(argument) ? argument : standardiseDescriptor(argument)!))
  );
} as StampIt;

const baseStampit = Shortcut.compose({
  staticProperties: {
    create(this: ShortcutStamp, ...arguments_: [(anyObject | undefined)?, ...unknown[]]): anyObject {
      return this.apply(this, arguments_);
    },
    compose: stampit, // Infecting
  },
});

const shortcuts = Shortcut.compose.staticProperties!;
for (const property of ownKeys(shortcuts)) {
  set(stampit, property, get(shortcuts, property).bind(baseStampit));
}

stampit.compose = (stampit.bind(undefined) as unknown) as ShortcutComposeProperty;

export default stampit;

// For CommonJS default export support
module.exports = stampit;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: stampit });
