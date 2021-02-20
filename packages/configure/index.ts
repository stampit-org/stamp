import compose from '@stamp/compose';
import Privatize from '@stamp/privatize';

import type { Composable, Initializer, ObjectInstance, PropertyMap, Stamp } from '@stamp/compose';

interface HasConfig extends ObjectInstance {
  config: PropertyMap;
}
const configure: Initializer<HasConfig> = function (_options, context) {
  const { configuration } = context.stamp.compose;
  const { deepConfiguration } = context.stamp.compose;
  this.config = Object.freeze({ ...deepConfiguration, ...configuration });
};

interface ConfigureStamp extends Stamp {
  noPrivatize: () => ConfigureStamp;
}
const ConfigurePublic: ConfigureStamp = compose(({
  initializers: [configure],
} as unknown) as Composable) as ConfigureStamp;

/**
 * TODO
 */
const ConfigurePrivate = ConfigurePublic.compose(Privatize) as ConfigureStamp;

ConfigurePrivate.noPrivatize = (): ConfigureStamp => ConfigurePublic;

export default ConfigurePrivate;

// For CommonJS default export support
module.exports = ConfigurePrivate;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: ConfigurePrivate });
