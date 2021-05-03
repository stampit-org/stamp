import compose from '@stamp/compose';
import Privatize from '@stamp/privatize';

import type { Composable, Initializer, PropertyMap, Stamp } from '@stamp/compose';

/** An object instance with `config` property */
// TODO: HasConfig should support generics like <ObjectInstance>
export interface HasConfig {
  config: PropertyMap;
}

/** @internal `Configure` initializer function */
// ! weak types
const initializer: Initializer<HasConfig, any> = function (_options, context) {
  const { configuration } = context.stamp.compose;
  const { deepConfiguration } = context.stamp.compose;
  this.config = Object.freeze({ ...deepConfiguration, ...configuration });
};

/**
 * A Stamp with the `noPrivatize` static method
 */
// TODO: ConfigureStamp should support generics like <ObjectInstance, OriginalStamp>
export interface ConfigureStamp extends Stamp<unknown> {
  /**
   * Configure stamp without `@stamp/privatize`
   */
  // ! weak types
  noPrivatize: () => Stamp<unknown>;
}

/**
 * Access configuration of your stamps anywhere
 */
// TODO: ConfigurePublic should support generics like <ObjectInstance, OriginalStamp>
// ! weak types
const ConfigurePublic: Stamp<unknown> = compose(({ initializers: [initializer] } as unknown) as Composable<
  unknown,
  unknown
  // ! weak types
>) as Stamp<unknown>;

/**
 * Access configuration of your stamps anywhere
 */
// TODO: Configure should support generics like <ObjectInstance, OriginalStamp>
const Configure = ConfigurePublic.compose(Privatize) as ConfigureStamp;
// ! type should be ConfigureStamp, renamed as Configure
Configure.noPrivatize = () => ConfigurePublic;

export default Configure;

// For CommonJS default export support
module.exports = Configure;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Configure });
