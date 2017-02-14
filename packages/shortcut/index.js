var compose = require('@stamp/compose');

function createShortcut(propName) {
  return function (arg) {
    var param = {};
    param[propName] = arg;
    return this.compose(param);
  };
}

module.exports = compose({
  staticProperties: {
    methods: createShortcut('methods'),

    props: createShortcut('properties'),
    statics: createShortcut('staticProperties'),
    conf: createShortcut('configuration'),

    deepProps: createShortcut('deepProperties'),
    deepStatics: createShortcut('staticDeepProperties'),
    deepConf: createShortcut('deepConfiguration'),

    init: createShortcut('initializers'),
    composers: createShortcut('composers')
  }
});
