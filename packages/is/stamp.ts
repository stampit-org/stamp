import { Stamp } from '@stamp/types';

import isFunction from './function';

/**
 * Checks if passed argument is a function and has a `.compose()` property.
 */
// TODO: finer type guard
const isStamp = <T extends Stamp = Stamp>(value: unknown): value is T => isFunction(value) && isFunction(value.compose);

export default isStamp;

// For CommonJS default export support
module.exports = isStamp;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isStamp });
