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
const InstanceOf = compose<unknown, unknown>({
  methods: {},
  composers: [
    ({ stamp }): void => {
      // Attaching to object prototype to save memory
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      set((stamp as Stamp<unknown>).compose.methods!, stampSymbol, stamp);

      defineProperty(stamp as Stamp<unknown>, Symbol.hasInstance, {
        value(instance: Signature | undefined) {
          return instance && instance[stampSymbol] === stamp;
        },
      });
    },
  ],
}) as Stamp<unknown>;

export default InstanceOf;

// For CommonJS default export support
module.exports = InstanceOf;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: InstanceOf });
