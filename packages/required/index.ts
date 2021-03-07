/* eslint @typescript-eslint/no-use-before-define: ["error", { "variables": false }] */
import compose from '@stamp/compose';
import { assign } from '@stamp/core';
import { isObject } from '@stamp/is';

import type { Composable, Descriptor, PropertyMap, Stamp } from '@stamp/compose';

const { freeze } = Object;
const { get, ownKeys } = Reflect;

/** @internal */
// ! weak types
interface OwnDescriptor extends Descriptor<unknown, unknown> {
  deepConfiguration?: PropertyMap & { Required: Descriptor<unknown, unknown> };
}

/** @internal */
// ! weak types
function required(this: Stamp<unknown> | undefined, settings: Composable<unknown, unknown>): Stamp<unknown> {
  const localStamp = this?.compose ? this : Required;
  const { deepConfiguration } = localStamp.compose as OwnDescriptor;
  // ! weak types
  const previousSettings = deepConfiguration?.Required as Composable<unknown, unknown>;

  // Filter out non stamp things
  // ! weak types
  const newSettings = assign<Descriptor<unknown, unknown>>(
    {},
    (compose(previousSettings, settings) as Stamp<unknown>).compose
  );

  return localStamp.compose({ deepConfiguration: { Required: newSettings } });
}

freeze(required);

/** @internal */
const checkDescriptorHaveThese = (
  descriptor: Descriptor<unknown, unknown>,
  settings: Descriptor<unknown, unknown> | undefined
): void => {
  /* eslint-disable max-depth */
  if (descriptor && settings) {
    // Traverse settings and find if there is anything required.
    for (const settingsKey of ownKeys(settings)) {
      const settingsValue = get(settings, settingsKey);
      if (isObject(settingsValue)) {
        for (const metadataKey of ownKeys(settingsValue)) {
          const metadataValue = get(settingsValue, metadataKey);
          if (metadataValue === Required || metadataValue === required) {
            // We found one thing which have to be provided. Let's check if it exists.
            const descValue = get(descriptor, settingsKey);
            if (!descValue || get(descValue, metadataKey) === undefined) {
              throw new Error(`Required: There must be ${String(metadataKey)} in this stamp ${String(settingsKey)}`);
            }
          }
        }
      }
    }
  }
  /* eslint-enable max-depth */
};

/**
 * Insist on a method/property/staticProperty/configuration presence
 */
// TODO: Required should support generics like <ObjectInstance, OriginalStamp>
const Required: Stamp<unknown> = compose({
  initializers: [
    (_, options): void => {
      const descriptor = options.stamp.compose as OwnDescriptor;
      const { deepConfiguration } = descriptor;
      const settings = deepConfiguration?.Required;
      checkDescriptorHaveThese(descriptor, settings);
    },
  ],
  staticProperties: {
    required,
  },
  // ! type should be RequiredStamp, renamed as Required
});

export default Required;

// For CommonJS default export support
module.exports = Required;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Required });

// Now is the time to freeze
freeze(Required);
