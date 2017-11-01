var compose = require('@stamp/compose');

function createShortcut(propName) {
  return function (arg) {
    'use strict';
    var param = {};
    param[propName] = arg;
    return this && this.compose ? this.compose(param) : compose(param);
  };
}

var properties = createShortcut('properties');
var staticProperties = createShortcut('staticProperties');
var configuration = createShortcut('configuration');
var deepProperties = createShortcut('deepProperties');
var staticDeepProperties = createShortcut('staticDeepProperties');
var deepConfiguration = createShortcut('deepConfiguration');
var initializers = createShortcut('initializers');

module.exports = compose({
  staticProperties: {
    methods: createShortcut('methods'),

    props: properties,
    properties: properties,

    statics: staticProperties,
    staticProperties: staticProperties,

    conf: configuration,
    configuration: configuration,

    deepProps: deepProperties,
    deepProperties: deepProperties,

    deepStatics: staticDeepProperties,
    staticDeepProperties: staticDeepProperties,

    deepConf: deepConfiguration,
    deepConfiguration: deepConfiguration,

    init: initializers,
    initializers: initializers,

    composers: createShortcut('composers'),

    propertyDescriptors: createShortcut('propertyDescriptors'),

    staticPropertyDescriptors: createShortcut('staticPropertyDescriptors')
  }
});
