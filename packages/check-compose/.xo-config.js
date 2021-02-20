const baseConfig = require('../../.xo-config.json');

module.exports = {
  ...baseConfig,
  ...{
    ignores: ["**.js", '**/bin'],
  },
};
