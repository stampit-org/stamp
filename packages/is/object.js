export default function isObject(arg) {
  const type = typeof arg;
  return Boolean(arg) && (type === 'object' || type === 'function');
}
