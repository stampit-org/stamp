import { compose, Stamp } from '@stamp/compose';

/**
 * @deprecated This feature is now available from the `@stamp/it` package which is prefered.
 */
export const Named = compose({
  staticProperties: {
    setName(this: Stamp, name: string): Stamp {
      return (this?.compose ? this : Named).compose({
        staticPropertyDescriptors: {
          name: { value: name },
        },
      });
    },
  },
});

export default Named;