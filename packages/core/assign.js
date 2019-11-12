'use strict';

const { defineProperty, getOwnPropertyDescriptor, ownKeys } = Reflect;

const assignOne = (dst, src) => {
  if (src != null) {
    // We need to copy regular properties, symbols, getters and setters.
    const keys = ownKeys(src);
    for (const key of keys) {
      defineProperty(dst, key, getOwnPropertyDescriptor(src, key));
    }
  }

  return dst;
};

const assign = (dst, ...args) => {
  for (const arg of args) {
    // eslint-disable-next-line no-param-reassign
    dst = assignOne(dst, arg);
  }
  return dst;
};

module.exports = assign;
