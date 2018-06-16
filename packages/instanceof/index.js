var compose = require('@stamp/compose');

module.exports = typeof Symbol === 'undefined' ? compose() : compose({
  methods: {},
  composers: [function (opts) {
    var stamp = opts.stamp;
    // Attaching to object prototype to save memory
    stamp.compose.methods[Symbol.for('stamp')] = stamp;

    Object.defineProperty(stamp, Symbol.hasInstance, {
      value: function value (obj) {
        return obj && obj[Symbol.for('stamp')] === stamp;
      }
    });
  }]
});
