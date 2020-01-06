/**
 * @internal Checks if passed argument is considered a `string`.
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

export default isString;
