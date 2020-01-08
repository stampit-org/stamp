import { compose, Stamp, Initializer, PropertyMap } from '@stamp/compose';
import { Privatize } from '@stamp/privatize';

interface HasConfig {
  config: PropertyMap;
}
const configure: Initializer = function configure(_, options) {
  const { configuration } = options.stamp.compose;
  const { deepConfiguration } = options.stamp.compose;
  (this as HasConfig).config = Object.freeze({ ...deepConfiguration, ...configuration });
};

interface ConfigureStamp extends Stamp {
  noPrivatize: () => ConfigureStamp;
}
const ConfigurePublic: ConfigureStamp = compose({
  initializers: [configure],
}) as ConfigureStamp;

export const ConfigurePrivate = ConfigurePublic.compose(Privatize) as ConfigureStamp;

ConfigurePrivate.noPrivatize = (): ConfigureStamp => ConfigurePublic;

export default ConfigurePrivate;
