'use strict';

const compose = require('@stamp/compose');

const { get } = Reflect;

const FpConstructor = compose({
  composers: [
    (opts) => {
      const optsStamp = get(opts, 'stamp');
      optsStamp.of = optsStamp;
      optsStamp.constructor = optsStamp;
      optsStamp.compose.methods = optsStamp.compose.methods || {};
      optsStamp.compose.methods.constructor = optsStamp;
    },
  ],
});

module.exports = FpConstructor;
