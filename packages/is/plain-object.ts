const { prototype } = Object;
const { getPrototypeOf } = Reflect;

/**
 * @internal Checks if passed argument is a plain old javascrip object (POJO).
 */
export const isPlainObject = (value: unknown): value is {} =>
  !!value && typeof value === 'object' && getPrototypeOf(value as {}) === prototype;

export default isPlainObject;
