const compose = require('@stamp/compose');

const stampSymbol = Symbol.for('stamp');

module.exports = compose({
  methods: {},
  composers: [({ stamp }) => {
    // Attaching to object prototype to save memory
    stamp.compose.methods[stampSymbol] = stamp;

    Object.defineProperty(stamp, Symbol.hasInstance, {
      value (obj) {
        return obj && obj[stampSymbol] === stamp;
      }
    });
  }]
});
