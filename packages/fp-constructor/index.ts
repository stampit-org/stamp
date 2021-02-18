import compose from '@stamp/compose';

import type { Composer } from '@stamp/compose';

const { get } = Reflect;

/**
 * TODO
 */
const FpConstructor = compose({
  composers: [
    ((parameters) => {
      const parametersStamp = get(parameters, 'stamp');
      parametersStamp.of = parametersStamp;
      parametersStamp.constructor = parametersStamp;
      parametersStamp.compose.methods = parametersStamp.compose.methods ?? {};
      parametersStamp.compose.methods.constructor = parametersStamp;
    }) as Composer,
  ],
});

export default FpConstructor;

// For CommonJS default export support
module.exports = FpConstructor;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: FpConstructor });
