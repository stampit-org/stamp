import isFunction from './function';

import type { Stamp } from '@stamp/types';

/**
 * Checks if passed argument is a function and has a `.compose()` method.
 */
// TODO: finer type guard
const isStamp = <T extends Stamp = Stamp>(value: unknown): value is T => isFunction(value) && isFunction(value.compose);

// For Typescript .d.ts
export default isStamp;

// For CommonJS default export support
module.exports = isStamp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isStamp });
