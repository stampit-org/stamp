var compose = require('@stamp/compose');

module.exports = compose({
  staticProperties: {
    setName: function (name) {
      return this.compose({
        configuration: {Named: {name: name}}
      });
    }
  },
  composers: [function (opts) {
    var conf = opts.stamp.compose.configuration;
    var name = conf && conf.name;
    if (!name) return;

    // TODO: Reimplement using staticPropertyDescriptors

    Object.defineProperty(opts.stamp, 'name', {
      value: name,
      configurable: true
    });
  }]
});
