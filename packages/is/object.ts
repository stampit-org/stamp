/**
 * @internal Checks if passed argument is considered an `object`.
 */
export const isObject = (value: unknown): value is object => {
  const type = typeof value;
  return !!value && (type === 'object' || type === 'function');
};

export default isObject;
