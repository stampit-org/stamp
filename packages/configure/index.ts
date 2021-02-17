import compose, { Initializer, PropertyMap, Stamp } from '@stamp/compose';
import Privatize from '@stamp/privatize';

import { ObjectInstance } from '../is/node_modules/@stamp/types';

interface HasConfig extends ObjectInstance {
  config: PropertyMap;
}
const configure: Initializer = function(_options, context) {
  const { configuration } = context.stamp.compose;
  const { deepConfiguration } = context.stamp.compose;
  (this as HasConfig).config = Object.freeze({ ...deepConfiguration, ...configuration });
};

interface ConfigureStamp extends Stamp {
  noPrivatize: () => ConfigureStamp;
}
const ConfigurePublic: ConfigureStamp = compose({
  initializers: [configure],
}) as ConfigureStamp;

/**
 * TODO
 */
const ConfigurePrivate = ConfigurePublic.compose(Privatize) as ConfigureStamp;

ConfigurePrivate.noPrivatize = (): ConfigureStamp => ConfigurePublic;

export default ConfigurePrivate;

// For CommonJS default export support
module.exports = ConfigurePrivate;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ConfigurePrivate });
