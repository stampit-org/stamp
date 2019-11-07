'use strict';

const isFunction = require('./function');

const isStamp = (value) => isFunction(value) && isFunction(value.compose);

module.exports = isStamp;
