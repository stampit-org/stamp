var compose = require('@stamp/compose');

module.exports = compose({
  composers: [function (opts) {
    opts.stamp.constructor = opts.stamp;
  }]
});
