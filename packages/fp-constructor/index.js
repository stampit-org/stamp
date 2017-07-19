var compose = require('@stamp/compose');

module.exports = compose({
  composers: [function (opts) {
    opts.stamp.of = opts.stamp;
    opts.stamp.constructor = opts.stamp;
    opts.stamp.compose.methods = Object.assign({}, opts.stamp.compose.methods, {
      constructor: opts.stamp
    });
  }]
});
