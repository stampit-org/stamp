module.exports = {
  // Public API
  isStamp: require('./stamp'),
  isComposable: require('./composable'),
  isDescriptor: require('./descriptor'),

  // The below are private for @stamp.
  isFunction: require('./function'),
  isObject: require('./object'),
  isPlainObject: require('./plain-object'),
  isArray: require('./array'),
  isString: require('./string')
};
