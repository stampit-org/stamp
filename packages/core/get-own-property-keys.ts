const { ownKeys } = Reflect;

/** @deprecated Use Reflect.ownKeys() instead */
const getOwnPropertyKeys = ownKeys;

export default getOwnPropertyKeys;

// For CommonJS default export support
module.exports = getOwnPropertyKeys;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: getOwnPropertyKeys });
