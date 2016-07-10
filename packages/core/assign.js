import mergeFew from './mergeFew';
import slice from './slice';

export default function assign(dst) {
  return mergeFew(dst, slice.call(arguments, 1), true);
}
