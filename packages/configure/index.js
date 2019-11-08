'use strict';

const compose = require('@stamp/compose');
const Privatize = require('@stamp/privatize');

function configure(_, options) {
  const { configuration } = options.stamp.compose;
  const { deepConfiguration } = options.stamp.compose;
  this.config = Object.freeze(Object.assign({}, deepConfiguration, configuration));
}

const ConfigurePublic = compose({
  initializers: [configure],
});

const ConfigurePrivate = ConfigurePublic.compose(Privatize);

ConfigurePrivate.noPrivatize = function noPrivatize() {
  return ConfigurePublic;
};

module.exports = ConfigurePrivate;
