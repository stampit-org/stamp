import compose from '@stamp/compose';
import { isStamp } from '@stamp/is';

import type { Descriptor, Initializer, Stamp } from '@stamp/compose';

type AnObject = Record<string, unknown>;

const { get, ownKeys, set } = Reflect;

const initializer: Initializer<AnObject, unknown> = function (options, { args }) {
  const stampArgs = [...args] as Array<AnObject | undefined>;
  for (const key of ownKeys(this) as string[]) {
    const stamp = get(this, key);
    if (isStamp(stamp)) {
      stampArgs[0] = options?.[key] as AnObject;
      set(this, key, stamp(...stampArgs));
    }
  }
};

/**
 * TODO
 */
const InitProperty: Stamp<unknown> = compose({
  initializers: [initializer],
  composers: [
    ({ stamp }): void => {
      const { initializers } = ((stamp as unknown) as Stamp<unknown>).compose as Required<Descriptor<unknown, unknown>>;
      initializers.splice(initializers.indexOf(initializer as Initializer<unknown, unknown>), 1);
      initializers.unshift(initializer as Initializer<unknown, unknown>);
    },
  ],
}) as Stamp<unknown>;

export default InitProperty;

// For CommonJS default export support
module.exports = InitProperty;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: InitProperty });
