import compose from '@stamp/compose';
import Privatize from '@stamp/privatize';

import type { Composable, Initializer, ObjectInstance, PropertyMap, Stamp } from '@stamp/compose';

/** An object instance with `config` property */
// TODO: HasConfig should support generics like <ObjectInstance>
export interface HasConfig extends ObjectInstance {
  config: PropertyMap;
}

/** @internal `Configure` initializer function */
const initializer: Initializer<HasConfig> = function (_options, context) {
  const { configuration } = context.stamp.compose;
  const { deepConfiguration } = context.stamp.compose;
  this.config = Object.freeze({ ...deepConfiguration, ...configuration });
};

/**
 * A Stamp with the `noPrivatize` static method
 */
// TODO: ConfigureStamp should support generics like <ObjectInstance, OriginalStamp>
export interface ConfigureStamp extends Stamp {
  /**
   * Configure stamp without `@stamp/privatize`
   */
  noPrivatize: () => Stamp;
}

// TODO: ConfigurePublic should support generics like <ObjectInstance, OriginalStamp>
const ConfigurePublic: Stamp = compose(({ initializers: [initializer] } as unknown) as Composable);

/**
 * Access configuration of your stamps anywhere
 */
// TODO: Configure should support generics like <ObjectInstance, OriginalStamp>
const Configure = ConfigurePublic.compose(Privatize) as ConfigureStamp;
Configure.noPrivatize = () => ConfigurePublic;

export default Configure;

// For CommonJS default export support
module.exports = Configure;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Configure });
