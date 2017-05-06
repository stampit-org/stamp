var compose = require('@stamp/compose');
var Privatize = require('@stamp/privatize');

function configure(_, options) {
  var configuration = options.stamp.compose.configuration;
  var deepConfiguration = options.stamp.compose.deepConfiguration;
  this.config = Object.freeze(
    Object.assign({}, configuration, deepConfiguration)
  );
}

var ConfigurePublic = compose({
  initializers: [configure]
});

var ConfigurePrivate = ConfigurePublic.compose(Privatize);

ConfigurePrivate.noPrivatize = function noPrivatize() {
  return ConfigurePublic;
};

module.exports = ConfigurePrivate;
