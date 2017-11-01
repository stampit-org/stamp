var compose = require('@stamp/compose');
var isArray = require('@stamp/is').isArray;
var isObject = require('@stamp/is').isObject;
var isString = require('@stamp/is').isString;
var assign = require('@stamp/core').assign;

function initializer(opts, ref) {
  var conf = ref.stamp.compose.deepConfiguration;
  var keysToAssign = conf && conf.ArgOverProp;
  if (!keysToAssign || !keysToAssign.length) return;
  for (var i = 0; i < keysToAssign.length; i++) {
    var key = keysToAssign[i], incomingValue = opts[key];
    if (incomingValue !== undefined) {
      this[key] = incomingValue;
    }
  }
}

function dedupe(array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    if (result.indexOf(item) < 0) result.push(item);
  }
  return result;
}

var ArgOverProp = compose({
  staticProperties: {
    argOverProp: function () {
      'use strict';
      var propNames = [], defaultProps;
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (isString(arg)) {
          propNames.push(arg);
        }
        else if (isArray(arg)) {
          propNames = propNames.concat(arg.filter(isString));
        } else if (isObject(arg)) {
          defaultProps = assign(defaultProps || {}, arg);
          propNames = propNames.concat(Object.keys(arg));
        }
      }

      var Stamp = this && this.compose ? this : ArgOverProp;
      return Stamp.compose({
        deepConfiguration: {ArgOverProp: propNames},
        properties: defaultProps // default property values
      });
    }
  },
  initializers: [initializer],
  composers: [function (opts) {
    var descriptor = opts.stamp.compose;
    var initializers = descriptor.initializers;
    // Always keep our initializer the first
    initializers.splice(initializers.indexOf(initializer), 1);
    initializers.unshift(initializer);

    var conf = descriptor.deepConfiguration;
    var propNames = conf && conf.ArgOverProp;
    if (!isArray(propNames)) return;
    conf.ArgOverProp = dedupe(propNames);
  }]
});

module.exports = ArgOverProp;
