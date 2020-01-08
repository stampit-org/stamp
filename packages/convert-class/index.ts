import { compose, Initializer, PropertyMap, Stamp } from '@stamp/compose';

const { prototype: functionPrototype } = Function;
const { assign } = Object;
const { construct, get, getPrototypeOf, ownKeys, set } = Reflect;

const isClass = (value: unknown): unknown => typeof value === 'function' && /^\s*class\s/.test(value.toString());

const isFunction = (value: unknown): value is Function => value === functionPrototype;

const copyPropertiesFrom = (srcObj: object) => (destObj: PropertyMap, key: PropertyKey): PropertyMap => {
  if (key !== 'length' && key !== 'name' && key !== 'prototype') set(destObj, key, get(srcObj, key));
  return destObj;
};

const classStaticProperties = (ctor: object): PropertyMap =>
  isFunction(ctor) ? {} : ownKeys(ctor).reduce(copyPropertiesFrom(ctor), classStaticProperties(getPrototypeOf(ctor)));

interface ObjectWithPrototype extends PropertyMap {
  prototype: object;
}
const copyMethodsFrom = (srcObj: object) => (destObj: object, key: PropertyKey): object => {
  if (key !== 'constructor') set(destObj, key, get(srcObj, key));
  return destObj;
};

const classMethods = (ctor: ObjectConstructor | ObjectWithPrototype): ObjectWithPrototype =>
  (isFunction(ctor)
    ? {}
    : ownKeys(ctor.prototype).reduce(
        copyMethodsFrom(ctor.prototype),
        classMethods(getPrototypeOf(ctor) as ObjectWithPrototype)
      )) as ObjectWithPrototype;

const init = (ctor: ObjectConstructor): Initializer =>
  // eslint-disable-next-line func-names,,@typescript-eslint/no-unused-vars
  function(_, { instance, args }) {
    if (this) assign(this, construct(ctor, args));
  } as Initializer;

export const convertClass = (ctor: ObjectConstructor): Stamp =>
  isClass(ctor)
    ? compose({
        initializers: [init(ctor)],
        methods: classMethods(ctor),
        staticProperties: classStaticProperties(ctor),
        staticPropertyDescriptors: { name: { value: ctor.name } },
      })
    : compose();

export default convertClass;
