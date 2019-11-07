// 'use strict';

// TODO: make `convertClass()` compatible with strict mode

const compose = require('@stamp/compose');

const { prototype: functionPrototype } = Function;
const { construct, get, getPrototypeOf, ownKeys, set } = Reflect;

function classStaticProperties(ctor) {
  if (ctor === functionPrototype) return {};
  return ownKeys(ctor).reduce((statics, k) => {
    if (k !== 'length' && k !== 'name' && k !== 'prototype') {
      set(statics, k, get(ctor, k));
    }
    return statics;
  }, classStaticProperties(getPrototypeOf(ctor)));
}

const classMethods = (ctor) => {
  if (ctor === functionPrototype) return {};
  const ctorPrototype = ctor.prototype;
  return ownKeys(ctorPrototype).reduce((methods, k) => {
    if (k !== 'constructor') {
      set(methods, k, get(ctorPrototype, k));
    }
    return methods;
  }, classMethods(getPrototypeOf(ctor)));
};

const isClass = (v) => typeof v === 'function' && /^\s*class\s+/.test(v.toString());

const convertClass = (ctor) => {
  if (!isClass(ctor)) return compose();
  return compose({
    initializers: [
      // eslint-disable-next-line func-names,no-unused-vars
      function(_, { instance, args }) {
        Object.assign(this, construct(ctor, args));
      },
    ],

    methods: classMethods(ctor),

    staticProperties: classStaticProperties(ctor),

    staticPropertyDescriptors: {
      name: {
        value: ctor.name,
      },
    },
  });
};

module.exports = convertClass;
