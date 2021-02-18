import compose from '@stamp/compose';

import type { Initializer, PropertyMap, Stamp } from '@stamp/compose';

/** Workaround for `object` type */
type anyObject = Record<string, unknown>;

const { prototype: functionPrototype } = Function;
const { assign } = Object;
const { construct, get, getPrototypeOf, ownKeys, set } = Reflect;

const isClass = (value: unknown): unknown => typeof value === 'function' && /^\s*class\s/.test(value.toString());

const isFunction = (value: unknown): value is () => void => value === functionPrototype;

const copyPropertiesFrom = (sourceObject: anyObject) => (
  destinationObject: PropertyMap,
  key: PropertyKey
): PropertyMap => {
  if (key !== 'length' && key !== 'name' && key !== 'prototype') set(destinationObject, key, get(sourceObject, key));
  return destinationObject;
};

const classStaticProperties = (ctor: ObjectConstructor | anyObject): PropertyMap =>
  isFunction(ctor)
    ? {}
    : ownKeys(ctor).reduce(copyPropertiesFrom(ctor), classStaticProperties(getPrototypeOf(ctor) as ObjectConstructor));

interface ObjectWithPrototype extends PropertyMap {
  prototype: anyObject;
}
const copyMethodsFrom = (sourceObject: anyObject) => (destinationObject: anyObject, key: PropertyKey): anyObject => {
  if (key !== 'constructor') set(destinationObject, key, get(sourceObject, key));
  return destinationObject;
};

const classMethods = (ctor: ObjectConstructor | ObjectWithPrototype): ObjectWithPrototype =>
  (isFunction(ctor)
    ? {}
    : ownKeys(ctor.prototype).reduce(
        copyMethodsFrom(ctor.prototype),
        classMethods(getPrototypeOf(ctor) as ObjectWithPrototype)
      )) as ObjectWithPrototype;

const initializerFactory = (ctor: ObjectConstructor): Initializer =>
  function (_options, { args }) {
    if (this) assign(this, construct(ctor, args));
  } as Initializer;

/**
 * TODO
 */
const convertClass = (ctor: ObjectConstructor): Stamp =>
  isClass(ctor)
    ? compose({
        initializers: [initializerFactory(ctor)],
        methods: classMethods(ctor),
        staticProperties: classStaticProperties(ctor),
        staticPropertyDescriptors: { name: { value: ctor.name } },
      })
    : compose();

export default convertClass;

// For CommonJS default export support
module.exports = convertClass;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: convertClass });
