import isObject from './object';

import type { Descriptor } from '@stamp/types';

/**
 * Checks if passed argument is considered a descriptor.
 */
// ! weak types
const isDescriptor: (value: unknown) => value is Descriptor<unknown, unknown> = isObject;

export default isDescriptor;

// For CommonJS default export support
module.exports = isDescriptor;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isDescriptor });
