'use strict';

const compose = require('@stamp/compose');

const createShortcut = (propName) => {
  // eslint-disable-next-line func-names
  return function(arg) {
    // 'use strict';

    const param = { [propName]: arg };
    return this && this.compose ? this.compose(param) : compose(param);
  };
};

const properties = createShortcut('properties');
const staticProperties = createShortcut('staticProperties');
const configuration = createShortcut('configuration');
const deepProperties = createShortcut('deepProperties');
const staticDeepProperties = createShortcut('staticDeepProperties');
const deepConfiguration = createShortcut('deepConfiguration');
const initializers = createShortcut('initializers');

const Shortcut = compose({
  staticProperties: {
    methods: createShortcut('methods'),

    props: properties,
    properties,

    statics: staticProperties,
    staticProperties,

    conf: configuration,
    configuration,

    deepProps: deepProperties,
    deepProperties,

    deepStatics: staticDeepProperties,
    staticDeepProperties,

    deepConf: deepConfiguration,
    deepConfiguration,

    init: initializers,
    initializers,

    composers: createShortcut('composers'),

    propertyDescriptors: createShortcut('propertyDescriptors'),

    staticPropertyDescriptors: createShortcut('staticPropertyDescriptors'),
  },
});

module.exports = Shortcut;
