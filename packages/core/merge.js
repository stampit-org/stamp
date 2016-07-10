import mergeFew from './mergeFew';
import slice from './slice';

export default function merge(dst) {
  return mergeFew(dst, slice.call(arguments, 1), false);
}
