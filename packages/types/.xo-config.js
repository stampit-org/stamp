const baseConfig = require('../../.xo-config.json');

module.exports = {
  ...baseConfig,
  ...{
    ignores: ['**.js', '!**.d.ts', '**/__tests__', '**/check-compose'],
  },
};
