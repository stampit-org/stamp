'use strict';

const compose = require('@stamp/compose');
const isArray = require('@stamp/is/array');
const isObject = require('@stamp/is/object');
const isString = require('@stamp/is/string');
const assign = require('@stamp/core/assign');

const { get, ownKeys, set } = Reflect;

function initializer(opts, ref) {
  if (isObject(opts)) {
    const conf = ref.stamp.compose.deepConfiguration;
    const keysToAssign = conf && conf.ArgOverProp;
    if (keysToAssign && keysToAssign.length) {
      keysToAssign.forEach((key) => {
        const incomingValue = get(opts, key);
        if (incomingValue !== undefined) {
          set(this, key, incomingValue);
        }
      });
    }
  }
}

const dedupe = (array) => [...new Set(array)];

const ArgOverProp = compose({
  staticProperties: {
    argOverProp(...args) {
      let propNames = [];
      let defaultProps;
      args.forEach((arg) => {
        if (isString(arg)) {
          propNames.push(arg);
        } else if (isArray(arg)) {
          propNames = [...propNames, ...arg.filter(isString)];
        } else if (isObject(arg)) {
          defaultProps = assign(defaultProps || {}, arg);
          propNames = [...propNames, ...ownKeys(arg)];
        }
      });

      const Stamp = this && this.compose ? this : ArgOverProp;
      return Stamp.compose({
        deepConfiguration: { ArgOverProp: propNames },
        properties: defaultProps, // default property values
      });
    },
  },
  initializers: [initializer],
  composers: [
    (opts) => {
      const descriptor = opts.stamp.compose;
      const { initializers } = descriptor;
      // Always keep our initializer the first
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.unshift(initializer);

      const conf = descriptor.deepConfiguration;
      const propNames = conf && conf.ArgOverProp;
      if (isArray(propNames)) conf.ArgOverProp = dedupe(propNames);
    },
  ],
});

module.exports = ArgOverProp;
