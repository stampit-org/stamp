import { compose, Composer } from '@stamp/compose';

const { get } = Reflect;

export const FpConstructor = compose({
  composers: [
    ((opts) => {
      const optsStamp = get(opts, 'stamp');
      optsStamp.of = optsStamp;
      optsStamp.constructor = optsStamp;
      optsStamp.compose.methods = optsStamp.compose.methods ?? {};
      optsStamp.compose.methods.constructor = optsStamp;
    }) as Composer,
  ],
});

export default FpConstructor;
