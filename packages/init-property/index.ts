import compose, { Descriptor, Initializer } from '@stamp/compose';
import { isStamp } from '@stamp/is';

const { get, ownKeys, set } = Reflect;

const initializer: Initializer = function(options, { args }) {
  const stampArgs = args.slice();
  (ownKeys(this) as string[]).forEach((key) => {
    const stamp = get(this, key);
    if (isStamp(stamp)) {
      stampArgs[0] = options?.[key];
      set(this, key, stamp(...stampArgs));
    }
  });
};

/**
 * TODO
 */
const InitProperty = compose({
  initializers: [initializer],
  composers: [
    ({ stamp }): void => {
      const initializers = (stamp.compose as Descriptor).initializers as Initializer[];
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.unshift(initializer);
    },
  ],
});

export default InitProperty;

// For CommonJS default export support
module.exports = InitProperty;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: InitProperty });
