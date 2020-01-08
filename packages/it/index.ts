/* eslint @typescript-eslint/no-use-before-define: ["error", { "variables": false }] */
import { Composable, compose, Composer, Descriptor, Initializer, PropertyMap } from '@stamp/compose';
import { assign, merge } from '@stamp/core';
import { isFunction, isObject, isStamp, isString } from '@stamp/is';
import { ComposeProperty, Shortcut, StampWithShortcuts } from '@stamp/shortcut';

const { concat } = Array.prototype;
const { get, ownKeys, set } = Reflect;

interface ExtractFunctions {
  (...args: unknown[]): Composer[] | Initializer[] | undefined;
}
const extractFunctions: ExtractFunctions = (...args) => {
  const fns = concat.apply([], [...args]).filter(isFunction) as Composer[] | Initializer[];
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

interface StandardiseDescriptor {
  (descr: ExtendedDescriptor | undefined): Descriptor | undefined;
}
const standardiseDescriptor: StandardiseDescriptor = (descr) => {
  if (!isObject(descr)) return descr;

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
  } = descr;

  const p = isObject(props) || isObject(properties) ? assign({}, props, properties) : undefined;
  const dp = isObject(deepProps) || isObject(deepProperties) ? merge({}, deepProps, deepProperties) : undefined;
  const sp = isObject(statics) || isObject(staticProperties) ? assign({}, statics, staticProperties) : undefined;
  const sdp =
    isObject(deepStatics) || isObject(staticDeepProperties) ? merge({}, deepStatics, staticDeepProperties) : undefined;

  let spd = descr.staticPropertyDescriptors;
  if (isString(descr.name)) spd = assign({}, spd || {}, { name: { value: descr.name } });

  const c = isObject(conf) || isObject(configuration) ? assign({}, conf, configuration) : undefined;
  const dc = isObject(deepConf) || isObject(deepConfiguration) ? merge({}, deepConf, deepConfiguration) : undefined;
  const ii = extractFunctions(init, initializers) as Initializer[] | undefined;
  const cc = extractFunctions(composers) as Composer[] | undefined;

  const descriptor: Descriptor = {};
  if (methods) descriptor.methods = methods;
  if (p) descriptor.properties = p;
  if (ii) descriptor.initializers = ii;
  if (cc) descriptor.composers = cc;
  if (dp) descriptor.deepProperties = dp;
  if (sp) descriptor.staticProperties = sp;
  if (sdp) descriptor.staticDeepProperties = sdp;
  if (propertyDescriptors) descriptor.propertyDescriptors = propertyDescriptors;
  if (spd) descriptor.staticPropertyDescriptors = spd;
  if (c) descriptor.configuration = c;
  if (dc) descriptor.deepConfiguration = dc;

  return descriptor;
};

interface StampIt extends StampWithShortcuts {
  (this: unknown, ...args: (ExtendedDescriptor | StampWithShortcuts)[]): StampWithShortcuts;
}
// { (...args: any[]): StampWithShortcuts; compose: ComposeMethod & Descriptor; }
export const stampit = function stampit(this: StampIt, ...args: (Composable | undefined)[]) {
  return compose.apply(
    this || baseStampit,
    args.map((arg) => (isStamp(arg) ? arg : standardiseDescriptor(arg)))
  );
} as StampIt;

const baseStampit = Shortcut.compose({
  staticProperties: {
    create(this: StampWithShortcuts, ...args: [(object | undefined)?, ...unknown[]]): object {
      return this.apply(this, args);
    },
    compose: stampit, // infecting
  },
});

const shortcuts = Shortcut.compose.staticProperties as PropertyMap;
ownKeys(shortcuts).forEach((prop) => set(stampit, prop, get(shortcuts, prop).bind(baseStampit)));
stampit.compose = (stampit.bind(undefined) as unknown) as ComposeProperty;

export default stampit;
