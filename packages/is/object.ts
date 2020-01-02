export const isObject = (value: unknown): value is {} => {
  const type = typeof value;
  return Boolean(value) && (type === 'object' || type === 'function');
};
