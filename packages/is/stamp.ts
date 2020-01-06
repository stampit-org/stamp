import { isFunction } from './function';

/**
 * Checks if passed argument is a function and has a `.compose()` property.
 */
// TODO: finer type guard
export const isStamp = <T extends object = object>(value: unknown): value is T =>
  isFunction(value) && isFunction(value.compose);

export default isStamp;
