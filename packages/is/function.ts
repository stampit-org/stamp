// export const isFunction = (value: unknown): value is () => unknown => typeof value === 'function';
export const isFunction = (value: unknown): boolean => typeof value === 'function';
