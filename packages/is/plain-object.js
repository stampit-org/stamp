'use strict';

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && Reflect.getPrototypeOf(value) === Object.prototype;

module.exports = isPlainObject;
