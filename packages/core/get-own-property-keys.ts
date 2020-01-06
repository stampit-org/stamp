const { ownKeys } = Reflect;

/** @deprecated Use Reflect.ownKeys() instead */
export const getOwnPropertyKeys = ownKeys;

export default getOwnPropertyKeys;
