import { isObject } from './object';

/**
 * Checks if passed argument is considered a descriptor.
 */
// TODO: finer type guard
export const isDescriptor = isObject;

export default isDescriptor;
