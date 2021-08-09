import type { Stamp } from '@stamp/types';
import isFunction from './function';

/**
 * Checks if passed argument is a function and has a `.compose()` method.
 */
// ! weak types
const isStamp = <T extends Stamp<unknown> = Stamp<unknown>>(value: unknown): value is T =>
  isFunction(value) && isFunction(value.compose);

// For Typescript .d.ts
export default isStamp;

// For CommonJS default export support
module.exports = isStamp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isStamp });
