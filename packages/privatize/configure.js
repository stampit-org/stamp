var compose = require('@stamp/compose');

function initializer(_, opts) {
    this.stampConfiguration = opts.stamp.compose.configuration;
    this.stampDeepConfiguration = opts.stamp.compose.deepConfiguration;
}

module.exports = compose({
  initializers: [initializer]
});
