/* eslint-disable no-use-before-define */

'use strict';

const compose = require('@stamp/compose');
const assign = require('@stamp/core/assign');
const isObject = require('@stamp/is/object');

const { get, ownKeys } = Reflect;

function required(settings) {
  const Stamp = this && this.compose ? this : Required;
  const prevSettings = Stamp.compose.deepConfiguration && Stamp.compose.deepConfiguration.Required;

  // filter out non stamp things
  const newSettings = assign({}, compose(prevSettings, settings).compose);

  return Stamp.compose({ deepConfiguration: { Required: newSettings } });
}
Object.freeze(required);

const checkDescriptorHaveThese = (descriptor, settings) => {
  if (descriptor && settings) {
    // Traverse settings and find if there is anything required.
    const settingsKeys = ownKeys(settings);
    for (const settingsKey of settingsKeys) {
      const settingsValue = get(settings, settingsKey);
      if (isObject(settingsValue)) {
        const metadataKeys = ownKeys(settingsValue);
        for (const metadataKey of metadataKeys) {
          const metadataValue = get(settingsValue, metadataKey);
          if (metadataValue === Required || metadataValue === required) {
            // We found one thing which have to be provided. Let's check if it exists.
            const descValue = get(descriptor, settingsKey);
            if (!descValue || get(descValue, metadataKey) === undefined) {
              throw new Error(`Required: There must be ${metadataKey} in this stamp ${settingsKey}`);
            }
          }
        }
      }
    }
  }
};

const Required = compose({
  initializers: [
    (_, opts) => {
      const descriptor = opts.stamp.compose;
      const settings = descriptor.deepConfiguration && descriptor.deepConfiguration.Required;
      checkDescriptorHaveThese(descriptor, settings);
    },
  ],
  staticProperties: {
    required,
  },
});
Object.freeze(Required);

module.exports = Required;
