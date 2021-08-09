import compose from '@stamp/compose';

import type { Stamp } from '@stamp/compose';

/**
 * @deprecated This feature is now available from the `@stamp/it` package which is preferred.
 */
// TODO: Named should support generics like <ObjectInstance, OriginalStamp>
// ! weak types
const Named: Stamp<unknown> = compose({
  staticProperties: {
    setName(this: Stamp<unknown> | undefined, name: string): Stamp<unknown> {
      return (this?.compose ? this : Named).compose({
        staticPropertyDescriptors: {
          name: { value: name },
        },
      });
    },
  },
  // ! type should be NamedStamp, renamed as Named
});

export default Named;

// For CommonJS default export support
module.exports = Named;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Named });
