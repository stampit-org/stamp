import compose from '@stamp/compose';

import type { Stamp } from '@stamp/compose';

const { defineProperty, set } = Reflect;

const stampSymbol = Symbol.for('stamp');

interface Signature {
  [stampSymbol]: unknown;
}

/**
 * TODO
 */
const InstanceOf: Stamp = compose({
  methods: {},
  composers: [
    ({ stamp }): void => {
      // Attaching to object prototype to save memory
      set(stamp.compose.methods!, stampSymbol, stamp);

      defineProperty(stamp, Symbol.hasInstance, {
        value(instance: Signature | undefined) {
          return instance && instance[stampSymbol] === stamp;
        },
      });
    },
  ],
});

export default InstanceOf;

// For CommonJS default export support
module.exports = InstanceOf;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: InstanceOf });
