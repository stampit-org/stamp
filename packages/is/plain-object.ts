export const isPlainObject = (value: unknown): value is {} =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  Boolean(value) && typeof value === 'object' && Reflect.getPrototypeOf(value!) === Object.prototype;
