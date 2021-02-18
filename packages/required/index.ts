/* eslint @typescript-eslint/no-use-before-define: ["error", { "variables": false }] */
import compose from '@stamp/compose';
import { assign } from '@stamp/core';
import { isObject } from '@stamp/is';

import type { Composable, Descriptor, PropertyMap, Stamp } from '@stamp/compose';

const { freeze } = Object;
const { get, ownKeys } = Reflect;

interface RequiredDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { Required: Descriptor };
}

type StampMethodRequired = (this: Stamp | undefined, settings: Composable) => Stamp;
export const required: StampMethodRequired = function (settings): Stamp {
  const localStamp = this?.compose ? this : Required;
  const { deepConfiguration } = localStamp.compose as RequiredDescriptor;
  const previousSettings = deepConfiguration?.Required as Composable;

  // Filter out non stamp things
  const newSettings = assign<Descriptor>({}, compose(previousSettings, settings).compose);

  return localStamp.compose({ deepConfiguration: { Required: newSettings } });
};

freeze(required);

type CheckDescriptorHaveThese = (descriptor: Descriptor, settings: Descriptor | undefined) => void;
const checkDescriptorHaveThese: CheckDescriptorHaveThese = (descriptor, settings) => {
  if (descriptor && settings) {
    // Traverse settings and find if there is anything required.
    const settingsKeys = ownKeys(settings);
    for (const settingsKey of settingsKeys) {
      const settingsValue = get(settings, settingsKey);
      if (isObject(settingsValue)) {
        const metadataKeys = ownKeys(settingsValue);
        for (const metadataKey of metadataKeys) {
          const metadataValue = get(settingsValue, metadataKey);
          // eslint-disable-next-line max-depth
          if (metadataValue === Required || metadataValue === required) {
            // We found one thing which have to be provided. Let's check if it exists.
            const descValue = get(descriptor, settingsKey);
            // eslint-disable-next-line max-depth
            if (!descValue || get(descValue, metadataKey) === undefined) {
              throw new Error(`Required: There must be ${String(metadataKey)} in this stamp ${String(settingsKey)}`);
            }
          }
        }
      }
    }
  }
};

/**
 * TODO
 */
const Required = compose({
  initializers: [
    (_, options): void => {
      const descriptor = options.stamp.compose as RequiredDescriptor;
      const { deepConfiguration } = descriptor;
      const settings = deepConfiguration?.Required;
      checkDescriptorHaveThese(descriptor, settings);
    },
  ],
  staticProperties: {
    required,
  },
});

export default Required;

// For CommonJS default export support
module.exports = Required;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Required });

// Now is the time to freeze
freeze(Required);
