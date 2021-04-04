import compose, { Stamp } from '@stamp/compose';
import { isStamp } from '@stamp/is';

/**
 * @deprecated This feature is now available from the `@stamp/it` package which is prefered.
 */
const Named = compose({
  staticProperties: {
    setName(this: Stamp, name: string): Stamp {
      return (isStamp(this) ? this : Named).compose({
        staticPropertyDescriptors: {
          name: { value: name },
        },
      });
    },
  },
});

export default Named;

// For CommonJS default export support
module.exports = Named;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Named });
