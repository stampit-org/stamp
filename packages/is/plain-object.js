'use strict';

const isPlainObject = (value) =>
  // ??? purpose of Boolean(value)
  Boolean(value) && typeof value === 'object' && Reflect.getPrototypeOf(value) === Object.prototype;

module.exports = isPlainObject;
