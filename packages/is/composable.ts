import { isObject } from './object';

/**
 * Checks if passed argument is considered as composable (i.e. stamp or descriptor).
 */
// More proper implementation would be
// isDescriptor(obj) || isStamp(obj)
// but there is no sense since stamp is function and function is object.
// TODO: finer type guard
export const isComposable = isObject;

export default isComposable;
