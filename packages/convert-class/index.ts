import compose from '@stamp/compose';

import type { Initializer, PropertyMap, Stamp } from '@stamp/compose';

type FunctionPrototype = typeof Function.prototype;
type ObjectPrototype = typeof Object.prototype;

const { assign } = Object;
const { construct, get, getPrototypeOf, ownKeys, set } = Reflect;

/** @internal */
interface ObjectWithPrototype extends PropertyMap {
  prototype: ObjectPrototype;
}

/** @internal is an object constructor */
const isClass = (value: unknown): value is ObjectConstructor =>
  typeof value === 'function' && /^\s*class\s/.test(value.toString());

/** @internal is a function */
const isFunction = (value: unknown): value is FunctionPrototype => value === Function.prototype;

/** @internal factory for a reducer */
const copyPropertiesFrom = (sourceObject: ObjectPrototype) => (
  previousValue: PropertyMap,
  currentValue: PropertyKey
): PropertyMap => {
  if (currentValue !== 'length' && currentValue !== 'name' && currentValue !== 'prototype') {
    set(previousValue, currentValue, get(sourceObject, currentValue));
  }

  return previousValue;
};

/** @internal */
const classStaticProperties = (ctor: ObjectConstructor | any): PropertyMap =>
  isFunction(ctor)
    ? {}
    : ownKeys(ctor as ObjectConstructor).reduce(
        copyPropertiesFrom(ctor as ObjectConstructor),
        classStaticProperties(getPrototypeOf(ctor as ObjectConstructor) as ObjectConstructor)
      );

/** @internal factory for a reducer */
const copyMethodsFrom = (sourceObject: ObjectPrototype) => (
  previousValue: ObjectPrototype,
  currentValue: PropertyKey
): ObjectPrototype => {
  if (currentValue !== 'constructor') set(previousValue, currentValue, get(sourceObject, currentValue));
  return previousValue;
};

/** @internal */
const classMethods = (ctor: FunctionPrototype | ObjectWithPrototype): ObjectPrototype =>
  ((isFunction(ctor)
    ? {}
    : ownKeys(ctor.prototype).reduce<ObjectPrototype>(
        copyMethodsFrom(ctor.prototype),
        classMethods(getPrototypeOf(ctor) as ObjectWithPrototype)
      )) as unknown) as ObjectConstructor;

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
  isClass(ctor)
    ? (compose({
        initializers: [initializerFactory(ctor)],
        methods: (classMethods(ctor) as unknown) as Record<string, unknown>,
        staticProperties: classStaticProperties(ctor),
        staticPropertyDescriptors: { name: { value: ctor.name } },
      }) as Stamp<unknown>)
    : compose();

export default convertClass;

// For CommonJS default export support
module.exports = convertClass;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: convertClass });
