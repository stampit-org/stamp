'use strict';

/**
 * @deprecated Use Reflect.ownKeys() instead
 */

const { ownKeys: getOwnPropertyKeys } = Reflect;

module.exports = getOwnPropertyKeys;
