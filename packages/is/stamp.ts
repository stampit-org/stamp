import { isFunction } from './function';

export const isStamp = (value: unknown): value is Stamp =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isFunction(value) && isFunction(((value as unknown) as any).compose);
