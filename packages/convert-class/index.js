const compose = require('@stamp/compose');

function classStaticProperties(ctor) {
  if (ctor === Function.prototype) return {};
  return Reflect.ownKeys(ctor)
  .reduce((statics, k) => {
    if (k !== 'length' && k !== 'name' && k !== 'prototype') {
      statics[k] = ctor[k];
    }
    return statics;
  }, classStaticProperties(ctor.__proto__));
}

function classMethods(ctor) {
  if (ctor === Function.prototype) return {};
  return Reflect.ownKeys(ctor.prototype).reduce((methods, k) => {
    if (k !== 'constructor') {
      methods[k] = ctor.prototype[k];
    }
    return methods;
  }, classMethods(ctor.__proto__))
}

function isClass(v) {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

module.exports = function convertClass(ctor) {
  if (!isClass(ctor)) return compose();
  return compose({
    initializers: [function (_, {instance, args},) {
      Object.assign(this, Reflect.construct(ctor, args));
    }],

    methods: classMethods(ctor),

    staticProperties: classStaticProperties(ctor),

    staticPropertyDescriptors: {
      name: {
        value: ctor.name
      }
    }
  });
};
