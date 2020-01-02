const { defineProperty, getOwnPropertyDescriptor, ownKeys } = Reflect;

const assignOne = (dst: object, src: object | undefined): object => {
  if (src != null) {
    // We need to copy regular properties, symbols, getters and setters.
    const keys = ownKeys(src);
    for (const key of keys) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      defineProperty(dst, key, getOwnPropertyDescriptor(src, key)!);
    }
  }

  return dst;
};

export const assign = <T extends object = object>(dst: T, ...args: (object | undefined)[]): T => {
  for (const arg of args) {
    // eslint-disable-next-line no-param-reassign
    dst = assignOne(dst, arg) as T;
  }
  return dst;
};
