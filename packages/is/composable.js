'use strict';

// More proper implementation would be
// isDescriptor(obj) || isStamp(obj)
// but there is no sense since stamp is function and function is object.
const isComposable = require('./object');

module.exports = isComposable;
