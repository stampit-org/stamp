import { ComposableFactoryParams, compose, Descriptor, Initializer, Stamp } from '@stamp/compose';
import { isStamp } from '@stamp/is';

const { get, ownKeys, set } = Reflect;

const initializer: Initializer = function initializer(opts, ref) {
  const args = ref.args.slice();
  (ownKeys(this) as string[]).forEach((key) => {
    const stamp = get(this, key);
    if (isStamp<Stamp>(stamp)) {
      args[0] = opts?.[key];
      set(this, key, stamp(...(args as ComposableFactoryParams)));
    }
  });
};

/**
 * TODO
 */
export const InitProperty = compose({
  initializers: [initializer],
  composers: [
    (opts): void => {
      const { initializers } = opts.stamp.compose as Required<Descriptor>;
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.unshift(initializer);
    },
  ],
});

export default InitProperty;
