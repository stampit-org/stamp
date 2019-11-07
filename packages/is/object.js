'use strict';

const isObject = (value) => {
  const type = typeof value;
  // ??? purpose of Boolean(value)
  return Boolean(value) && (type === 'object' || type === 'function');
};

module.exports = isObject;
