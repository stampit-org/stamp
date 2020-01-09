import compose from '@stamp/compose';

const { defineProperty, set } = Reflect;

const stampSymbol = Symbol.for('stamp');

interface Signature {
  [stampSymbol]: unknown;
}

/**
 * TODO
 */
const InstanceOf = compose({
  methods: {},
  composers: [
    ({ stamp }): void => {
      // Attaching to object prototype to save memory
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      set(stamp.compose.methods!, stampSymbol, stamp);

      defineProperty(stamp, Symbol.hasInstance, {
        value(obj: Signature | undefined) {
          return obj && obj[stampSymbol] === stamp;
        },
      });
    },
  ],
});

export default InstanceOf;

// For CommonJS default export support
module.exports = InstanceOf;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: InstanceOf });
