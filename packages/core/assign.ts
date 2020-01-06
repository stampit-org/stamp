const { defineProperty, getOwnPropertyDescriptor, ownKeys } = Reflect;

const assignOne = (dst: object, src: object | undefined): object => {
  if (src != null) {
    // We need to copy regular properties, symbols, getters and setters.
    const keys = ownKeys(src);
    for (const key of keys) {
      defineProperty(dst, key, getOwnPropertyDescriptor(src, key) as PropertyDescriptor);
    }
  }

  return dst;
};

/**
 * Mutates destination object with shallow assign of passed source objects. Returns destination object.
 */
export const assign = <T extends object = object>(dst: T, ...args: (object | undefined)[]): T => {
  for (const arg of args) {
    // eslint-disable-next-line no-param-reassign
    dst = assignOne(dst, arg) as T;
  }
  return dst;
};

export default assign;
