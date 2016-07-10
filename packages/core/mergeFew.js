import mergeOne from './mergeOne';

export default function mergeFew(dst, srcs, shallow) {
  return srcs.reduce((target, src) => mergeOne(target, src, shallow), dst);
}
