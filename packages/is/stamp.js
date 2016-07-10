import isFunction from './function';

export default function isStamp(arg) {
  return isFunction(arg) && isFunction(arg.compose);
}
