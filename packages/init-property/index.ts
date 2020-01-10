import compose, { ComposableFactoryParams, Descriptor, Initializer } from '@stamp/compose';
import { isStamp } from '@stamp/is';

const { get, ownKeys, set } = Reflect;

const initializer: Initializer = function initializer(options, context) {
  const contextArguments = context.args.slice();
  (ownKeys(this) as string[]).forEach((key) => {
    const stamp = get(this, key);
    if (isStamp(stamp)) {
      contextArguments[0] = options?.[key];
      set(this, key, stamp(...(contextArguments as ComposableFactoryParams)));
    }
  });
};

/**
 * TODO
 */
const InitProperty = compose({
  initializers: [initializer],
  composers: [
    (parameters): void => {
      const { initializers } = parameters.stamp.compose as Required<Descriptor>;
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.unshift(initializer);
    },
  ],
});

export default InitProperty;

// For CommonJS default export support
module.exports = InitProperty;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: InitProperty });
