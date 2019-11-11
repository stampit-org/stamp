'use strict';

const isObject = (value) => {
  const type = typeof value;
  return Boolean(value) && (type === 'object' || type === 'function');
};

module.exports = isObject;
