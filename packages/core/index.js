/* eslint-disable global-require */

'use strict';

module.exports = {
  assign: require('./assign'),
  merge: require('./merge'),
  /** @deprecated Use Reflect.ownKeys() instead */ getOwnPropertyKeys: require('./get-own-property-keys'),
};
