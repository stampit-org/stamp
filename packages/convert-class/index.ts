import compose from '@stamp/compose';

import type { Initializer, PropertyMap, Stamp } from '@stamp/compose';

const { prototype: functionPrototype } = Function;
const { assign } = Object;
const { construct, get, getPrototypeOf, ownKeys, set } = Reflect;

/** @internal */
interface ObjectWithPrototype extends PropertyMap {
  prototype: any;
}

/** @internal */
const isObjectConstructor = (value: unknown): value is ObjectConstructor =>
  typeof value === 'function' && /^\s*class\s/.test(value.toString());

/** @internal */
const isFunctionPrototype = (value: unknown): unknown => value === functionPrototype;

/** @internal */
const copyPropertiesFrom = (sourceObject: any) => (destinationObject: PropertyMap, key: PropertyKey): PropertyMap => {
  if (key !== 'length' && key !== 'name' && key !== 'prototype') set(destinationObject, key, get(sourceObject, key));
  return destinationObject;
};

/** @internal */
const classStaticProperties = (ctor: ObjectConstructor | any): PropertyMap =>
  isFunctionPrototype(ctor)
    ? {}
    : ownKeys(ctor).reduce(copyPropertiesFrom(ctor), classStaticProperties(getPrototypeOf(ctor) as ObjectConstructor));

/** @internal */
const copyMethodsFrom = (sourceObject: any) => (destinationObject: any, key: PropertyKey): unknown => {
  if (key !== 'constructor') set(destinationObject, key, get(sourceObject, key));
  return destinationObject;
};

/** @internal */
const classMethods = (ctor: ObjectConstructor | ObjectWithPrototype): ObjectWithPrototype =>
  (isFunctionPrototype(ctor)
    ? {}
    : ownKeys(ctor.prototype).reduce(
        copyMethodsFrom(ctor.prototype),
        classMethods(getPrototypeOf(ctor) as ObjectWithPrototype)
      )) as ObjectWithPrototype;

/** @internal */
const initializerFactory = (ctor: ObjectConstructor): Initializer<unknown, unknown> =>
  function (_options, { args }) {
    if (this) assign(this, construct(ctor, args));
  } as Initializer<unknown, unknown>;

/**
 * Converts an ES6 class to a stamp respecting the class's inheritance chain. The prototype chain is squashed into the methods of a stamp
 */
// TODO: convertClass should support generics like <ObjectInstance, OriginalStamp>
// TODO: ObjectInstance = InstanceType<ObjectConstructor>
const convertClass = (ctor: ObjectConstructor): Stamp<unknown> =>
  isObjectConstructor(ctor)
    ? (compose({
        initializers: [initializerFactory(ctor)],
        methods: classMethods(ctor),
        staticProperties: classStaticProperties(ctor),
        staticPropertyDescriptors: { name: { value: ctor.name } },
      }) as Stamp<unknown>)
    : (compose() as Stamp<unknown>);

export default convertClass;

// For CommonJS default export support
module.exports = convertClass;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: convertClass });
