import compose, { Composer, Stamp } from '@stamp/compose';

const { get } = Reflect;

/**
 * TODO
 */
const FpConstructor = compose({
  composers: [
    ((opts) => {
      const optsStamp = get(opts, 'stamp') as (Stamp & { of: Stamp });
      optsStamp.of = optsStamp;
      optsStamp.constructor = optsStamp;
      optsStamp.compose.methods = optsStamp.compose.methods ?? {};
      optsStamp.compose.methods.constructor = optsStamp;
    }) as Composer,
  ],
});

export default FpConstructor;

// For CommonJS default export support
module.exports = FpConstructor;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: FpConstructor });
