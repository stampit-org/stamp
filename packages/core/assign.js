const getOwnPropertyKeys = require('./get-own-property-keys');

const { defineProperty, getOwnPropertyDescriptor } = Reflect;

const assignOne = (dst, src) => {
  if (src != null) {
    // We need to copy regular properties, symbols, getters and setters.
    getOwnPropertyKeys(src).forEach((key) => defineProperty(dst, key, getOwnPropertyDescriptor(src, key)));
  }

  return dst;
};

const assign = (...args) => args.reduce((dst, arg) => assignOne(dst, arg));

module.exports = assign;
