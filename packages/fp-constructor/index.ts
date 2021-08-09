import compose from '@stamp/compose';

import type { Composer, Stamp } from '@stamp/compose';

const { get } = Reflect;

export interface FpConstructorStamp extends Stamp<unknown> {
  of: Stamp<unknown>;
  constructor: Stamp<unknown>;
  // compose: {
  //   methods: {
  //     constructor: Stamp;
  //   };
  // };
}

export interface FpConstructorInstance {
  constructor: FpConstructorStamp;
}

const composer = ((parameters) => {
  const parametersStamp: Stamp<unknown> = get(parameters, 'stamp');
  (parametersStamp as FpConstructorStamp).of = parametersStamp;
  parametersStamp.constructor = parametersStamp;
  parametersStamp.compose.methods = parametersStamp.compose.methods ?? {};
  parametersStamp.compose.methods.constructor = parametersStamp;
}) as Composer<unknown, unknown>;

/**
 * - Adds the Stamp`.of` static property referencing Stamp itself
 * - Adds the instance`.constructor` property referencing Stamp itself
 */
const FpConstructor: Stamp<unknown> = compose({ composers: [composer] }) as Stamp<unknown>;

export default FpConstructor;

// For CommonJS default export support
module.exports = FpConstructor;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: FpConstructor });
