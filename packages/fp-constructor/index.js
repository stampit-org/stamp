/* eslint-disable no-param-reassign */

const compose = require('@stamp/compose');

const FpConstructor = compose({
  composers: [
    (opts) => {
      opts.stamp.of = opts.stamp;
      opts.stamp.constructor = opts.stamp;
      opts.stamp.compose.methods = opts.stamp.compose.methods || {};
      opts.stamp.compose.methods.constructor = opts.stamp;
    },
  ],
});

module.exports = FpConstructor;
