/* eslint @typescript-eslint/no-use-before-define: ["error", { "variables": false }] */
import compose from '@stamp/compose';
import { assign, merge } from '@stamp/core';
import { isFunction, isObject, isStamp, isString } from '@stamp/is';
import Shortcut from '@stamp/shortcut';

import type { Composable, Composer, Descriptor, Initializer, PropertyMap, Stamp } from '@stamp/compose';
import type { ShortcutComposeProperty, ShortcutStamp } from '@stamp/shortcut';

const { concat } = Array.prototype;
const { get, ownKeys, set } = Reflect;

type ExtractFunctions = (
  ...args: unknown[]
) => Array<Composer<unknown, unknown>> | Array<Initializer<unknown, unknown>> | undefined;
const extractFunctions: ExtractFunctions = (...arguments_) => {
  // eslint-disable-next-line unicorn/no-array-callback-reference
  const fns = concat.apply([], [...arguments_]).filter(isFunction) as
    | Array<Composer<unknown, unknown>>
    | Array<Initializer<unknown, unknown>>;
  return fns.length === 0 ? undefined : fns;
};

interface ExtendedDescriptor extends Descriptor<unknown, unknown> {
  props?: Descriptor<unknown, unknown>['properties'];
  init?: Descriptor<unknown, unknown>['initializers'];
  deepProps?: Descriptor<unknown, unknown>['deepProperties'];
  statics?: Descriptor<unknown, unknown>['staticProperties'];
  deepStatics?: Descriptor<unknown, unknown>['staticDeepProperties'];
  conf?: Descriptor<unknown, unknown>['configuration'];
  deepConf?: Descriptor<unknown, unknown>['deepConfiguration'];
  name?: string;
}

type StandardiseDescriptor = (descriptor: ExtendedDescriptor | undefined) => Descriptor<unknown, unknown> | undefined;
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

  const p = isObject(props) || isObject(properties) ? assign<PropertyMap>({}, props, properties) : undefined;
  const dp = isObject(deepProps) || isObject(deepProperties) ? merge({}, deepProps, deepProperties) : undefined;
  const sp =
    isObject(statics) || isObject(staticProperties) ? assign<PropertyMap>({}, statics, staticProperties) : undefined;
  const sdp =
    isObject(deepStatics) || isObject(staticDeepProperties) ? merge({}, deepStatics, staticDeepProperties) : undefined;

  let { staticPropertyDescriptors: spd } = descriptor;
  if (isString(name)) spd = assign<PropertyDescriptorMap>({}, spd ?? {}, { name: { value: name } });

  const c = isObject(conf) || isObject(configuration) ? assign<PropertyMap>({}, conf, configuration) : undefined;
  const dc = isObject(deepConf) || isObject(deepConfiguration) ? merge({}, deepConf, deepConfiguration) : undefined;
  const ii = extractFunctions(init, initializers) as Array<Initializer<unknown, unknown>> | undefined;
  const cc = extractFunctions(composers) as Array<Composer<unknown, unknown>> | undefined;

  const standardDescriptor: Descriptor<unknown, unknown> = {};
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
interface StampIt extends ShortcutStamp<unknown, unknown, unknown> {
  (this: unknown, ...args: Array<ExtendedDescriptor | ShortcutStamp<unknown, unknown, unknown>>): ShortcutStamp<
    unknown,
    unknown,
    unknown
  >;
}
// { (...args: any[]): StampWithShortcuts; compose: ComposeMethod & Descriptor; }
// const stampit = function (this: StampIt, ...arguments_: Array<Composable<unknown, unknown> | undefined>) {
const stampit = function (this: StampIt, ...arguments_: Array<Composable<unknown, any> | undefined>) {
  return compose.apply(
    this || baseStampit,
    arguments_.map(
      (argument) =>
        ((isStamp(argument)
          ? argument
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            standardiseDescriptor(argument as ExtendedDescriptor)!) as unknown) as Composable<unknown, unknown, unknown>
    )
  );
} as StampIt;

const baseStampit = (Shortcut as Stamp<unknown>).compose({
  staticProperties: {
    create(this: ShortcutStamp<unknown, unknown, unknown>, ...arguments_: [(any | undefined)?, ...unknown[]]): any {
      return this.apply(this, arguments_);
    },
    compose: stampit, // Infecting
  },
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const shortcuts = (Shortcut as Stamp<unknown>).compose.staticProperties!;
for (const property of ownKeys(shortcuts)) {
  set(stampit, property, get(shortcuts, property).bind(baseStampit));
}

stampit.compose = (stampit.bind(undefined) as unknown) as ShortcutComposeProperty<unknown, unknown>;

export default stampit;

// For CommonJS default export support
module.exports = stampit;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: stampit });
