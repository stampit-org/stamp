'use strict';

const compose = require('@stamp/compose');

const { defineProperty, set } = Reflect;

const stampSymbol = Symbol.for('stamp');

const InstanceOf = compose({
  methods: {},
  composers: [
    ({ stamp }) => {
      // Attaching to object prototype to save memory
      set(stamp.compose.methods, stampSymbol, stamp);

      defineProperty(stamp, Symbol.hasInstance, {
        value(obj) {
          return obj && obj[stampSymbol] === stamp;
        },
      });
    },
  ],
});

module.exports = InstanceOf;
