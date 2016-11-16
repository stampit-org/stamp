import {isObject} from '@stamp/is';

export default function mergeOne(dst, src, shallow) {
  if (src === undefined) return dst;
  const srcIdObject = isObject(src);
  if (!srcIdObject) return src; // not a POJO, array, or function

  const dstIsArray = Array.isArray(dst);
  const srcIsArray = Array.isArray(src);
  if (srcIsArray) return (dstIsArray ? dst : []).concat(src);

  if (shallow === undefined) shallow = false;
  if (dstIsArray) return mergeOne({}, src, shallow);

  const keys = Object.keys(src);
  if (!dst) dst = {};

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const srcValue = src[key];
    if (srcValue !== undefined) {
      dst[key] = shallow ? src[key] : mergeOne(dst[key], srcValue, shallow);
    }
  }

  return dst;
}
