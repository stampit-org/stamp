import isObject from './object';

import type { Composable } from '@stamp/types';

/**
 * Checks if passed argument is considered as composable (i.e. stamp or descriptor).
 */
// More proper implementation would be
// isDescriptor(obj) || isStamp(obj)
// but there is no sense since stamp is function and function is object.
const isComposable: (value: unknown) => value is Composable = isObject;

export default isComposable;

// For CommonJS default export support
module.exports = isComposable;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isComposable });
