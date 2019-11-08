'use strict';

const compose = require('@stamp/compose');

const { prototype: functionPrototype } = Function;
const { assign } = Object;
const { construct, get, getPrototypeOf, ownKeys, set } = Reflect;

const isClass = (value) => typeof value === 'function' && /^\s*class\s/.test(value.toString());
const isFunction = (value) => value === functionPrototype;

const copyPropertiesFrom = (srcObj) => (destObj, key) => {
  if (key !== 'length' && key !== 'name' && key !== 'prototype') set(destObj, key, get(srcObj, key));
  return destObj;
};

const classStaticProperties = (ctor) =>
  isFunction(ctor) ? {} : ownKeys(ctor).reduce(copyPropertiesFrom(ctor), classStaticProperties(getPrototypeOf(ctor)));

const copyMethodsFrom = (srcObj) => (destObj, key) => {
  if (key !== 'constructor') set(destObj, key, get(srcObj, key));
  return destObj;
};

const classMethods = (ctor) =>
  isFunction(ctor)
    ? {}
    : ownKeys(ctor.prototype).reduce(copyMethodsFrom(ctor.prototype), classMethods(getPrototypeOf(ctor)));

const init = (ctor) =>
  // eslint-disable-next-line func-names,no-unused-vars
  function(_, { instance, args }) {
    if (this) assign(this, construct(ctor, args));
  };

const convertClass = (ctor) =>
  isClass(ctor)
    ? compose({
        initializers: [init(ctor)],
        methods: classMethods(ctor),
        staticProperties: classStaticProperties(ctor),
        staticPropertyDescriptors: { name: { value: ctor.name } },
      })
    : compose();

module.exports = convertClass;
