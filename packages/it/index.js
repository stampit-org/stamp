const compose = require('@stamp/compose');
const Shortcut = require('@stamp/shortcut');
const isStamp = require('@stamp/is/stamp');
const isString = require('@stamp/is/string');
const isObject = require('@stamp/is/object');
const isFunction = require('@stamp/is/function');
const merge = require('@stamp/core/merge');
const assign = require('@stamp/core/assign');

const { concat } = Array.prototype;
const { get, set } = Reflect;

const extractFunctions = (...args) => {
  const fns = concat.apply([], args).filter(isFunction);
  return fns.length === 0 ? undefined : fns;
};

const standardiseDescriptor = (descr) => {
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

  const ii = extractFunctions(init, initializers);

  const cc = extractFunctions(composers);

  const descriptor = {};
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

function stampit() {
  // eslint-disable-next-line lines-around-directive,strict
  'use strict';

  // to make sure `this` is not pointing to `global` or `window`
  // eslint-disable-next-line prefer-rest-params
  const { length } = arguments;
  const args = [];
  for (let i = 0; i < length; i += 1) {
    // eslint-disable-next-line prefer-rest-params
    const arg = arguments[i];
    args.push(isStamp(arg) ? arg : standardiseDescriptor(arg));
  }

  // eslint-disable-next-line no-use-before-define
  return compose.apply(this || baseStampit, args); // jshint ignore:line
}

const baseStampit = Shortcut.compose({
  staticProperties: {
    create(...args) {
      return this.apply(this, args);
    },
    compose: stampit, // infecting
  },
});

const shortcuts = Shortcut.compose.staticProperties;
// eslint-disable-next-line guard-for-in,no-restricted-syntax
for (const prop in shortcuts) set(stampit, prop, get(shortcuts, prop).bind(baseStampit));
stampit.compose = stampit.bind();

module.exports = stampit;
