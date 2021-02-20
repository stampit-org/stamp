import compose from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isStamp } from '@stamp/is';

import type { ComposeProperty, Composer, ComposerParameters, Descriptor, PropertyMap, Stamp } from '@stamp/compose';

const { defineProperty, get, ownKeys, set } = Reflect;

/** @internal Helper function to de-dupe an array */
const deDupe = <T>(array: T[]): T[] => [...new Set(array)];

type MakeProxyFunction = (
  functions: Array<(...args: unknown[]) => unknown>,
  name: PropertyKey
) => (this: unknown, ...args: unknown[]) => unknown[];
/** @internal Helper function to defer functions */
const makeProxyFunction: MakeProxyFunction = (functions, name) => {
  function deferredFunction(this: any, ...arguments_: unknown[]): unknown[] {
    return [...functions.map((func) => Reflect.apply(func, this, [...arguments_]))];
  }

  defineProperty(deferredFunction, 'name', { value: name, configurable: true });
  return deferredFunction;
};

/** @internal `Collision` settings property names */
type SettingsProperty = 'allow' | 'defer' | 'forbid';

/**
 * Settings for the `Collision` stamp
 */
export interface CollisionSettings {
  allow?: PropertyKey[];
  defer: PropertyKey[];
  forbid: PropertyKey[];
  forbidAll?: boolean;
}

/** @internal `Descriptor` type with `Collision` property */
interface CollisionDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { Collision: CollisionSettings };
}

/** A stamp with the `Collision` behavior */
// TODO: CollisionStamp should support generics like <ObjectInstance, OriginalStamp>
interface CollisionStamp extends Stamp {
  compose: ComposeProperty & CollisionDescriptor;
  collisionSetup(this: CollisionStamp | undefined, options: CollisionSettings | null | undefined): CollisionStamp;
}

type GetSettings = (descriptor: CollisionDescriptor) => CollisionSettings | undefined;
/** @internal Helper function to retrieve the `Collision` setttings */
const getSettings: GetSettings = (descriptor) => descriptor?.deepConfiguration?.Collision;

type CheckIf = (descriptor: CollisionDescriptor, setting: SettingsProperty, methodName: PropertyKey) => boolean;
/** @internal Helper function to check a method against a `Collision` settting */
const checkIf: CheckIf = (descriptor, setting, methodName: PropertyKey) => {
  const settings = getSettings(descriptor);
  const methodNames: PropertyKey[] | undefined = settings && get(settings, setting);
  return isArray(methodNames) && methodNames.includes(methodName);
};

type IsForbidden = (descriptor: CollisionDescriptor, methodName: PropertyKey) => boolean;
/** @internal Helper function to check if a method is forbidden */
const isForbidden: IsForbidden = (descriptor, methodName) =>
  getSettings(descriptor)?.forbidAll
    ? !checkIf(descriptor, 'allow', methodName)
    : checkIf(descriptor, 'forbid', methodName);

type IsDeferred = (descriptor: CollisionDescriptor, methodName: PropertyKey) => boolean;
/** @internal Helper function to check if a method is deferred */
const isDeferred: IsDeferred = (descriptor, methodName) => checkIf(descriptor, 'defer', methodName);

type SetMethodsMetadata = (options: ComposerParameters, methodsMetadata: PropertyMap) => void;
/** @internal Helper function to set methods metadata */
const setMethodsMetadata: SetMethodsMetadata = (options, methodsMetadata) => {
  const { methods } = options.stamp.compose as Required<Descriptor>;

  const setMethodCallback = (key: PropertyKey): void => {
    const metadata = get(methodsMetadata, key);
    let value: unknown;
    if (isArray(metadata)) {
      // Some collisions aggregated to a single method
      value = metadata.length === 1 ? metadata[0] : makeProxyFunction(metadata, key);
    } else {
      value = metadata;
    }

    set(methods, key, value);
  };

  for (const name of ownKeys(methodsMetadata)) {
    setMethodCallback(name);
  }
};

type RemoveDuplicates = (settings: CollisionSettings) => void;
/** @internal Helper function to remove duplicates from `Collision` settings */
const removeDuplicates: RemoveDuplicates = (settings) => {
  if (isArray(settings.defer)) set(settings, 'defer', deDupe(settings.defer));
  if (isArray(settings.forbid)) set(settings, 'forbid', deDupe(settings.forbid));
  if (isArray(settings.allow)) set(settings, 'allow', deDupe(settings.allow));
};

type ThrowIfAmbiguous = (settings: CollisionSettings) => void;
/** @internal Helper function that throw on ambiguous `Collision` settings */
const throwIfAmbiguous: ThrowIfAmbiguous = (settings) => {
  const { allow, defer, forbid } = settings;
  if (isArray(forbid)) {
    const isForbidden = (value: PropertyKey): boolean => forbid.includes(value);

    // eslint-disable-next-line unicorn/no-array-callback-reference
    const deferredAndForbidden = isArray(defer) ? defer.filter(isForbidden) : [];
    if (deferredAndForbidden.length > 0) {
      throw new Error(`Ambiguous Collision settings. [${deferredAndForbidden.join(', ')}] both deferred and forbidden`);
    }

    // eslint-disable-next-line unicorn/no-array-callback-reference
    const allowedAndForbidden = isArray(allow) ? allow.filter(isForbidden) : [];
    if (allowedAndForbidden.length > 0) {
      throw new Error(`Ambiguous Collision settings. [${allowedAndForbidden.join(', ')}] both allowed and forbidden`);
    }
  }
};

type ThrowIfForbiddenOrAmbiguous = (
  existingMetadata: unknown[],
  descriptor: CollisionDescriptor,
  composable: Required<CollisionDescriptor>,
  methodName: PropertyKey
) => void;
/** @internal Helper function that throw on forbidden or ambiguous methods */
const throwIfForbiddenOrAmbiguous: ThrowIfForbiddenOrAmbiguous = (
  existingMetadata,
  descriptor,
  composable,
  methodName
) => {
  if (existingMetadata) {
    // Process Collision.forbid
    if (isForbidden(descriptor, methodName)) {
      throw new Error(`Collision of method \`${String(methodName)}\` is forbidden`);
    }

    // Process Collision.defer
    if (isDeferred(composable, methodName)) {
      // Process no Collision settings
      if (isArray(existingMetadata)) {
        // TODO: update error message below
        throw new Error(`Ambiguous Collision settings. The \`${String(methodName)}\` is both deferred and regular`);
      }

      throw new Error(`Ambiguous Collision settings. The \`${String(methodName)}\` is both deferred and regular`);
    }
  }
};

/** @internal `Collision` composer function */
const composer: Composer = (parameters) => {
  const descriptor = parameters.stamp.compose as CollisionDescriptor;
  const settings = getSettings(descriptor);

  if (isObject(settings)) {
    // De-duplicating is an important part of the logic
    removeDuplicates(settings);

    // Make sure settings are not ambiguous
    throwIfAmbiguous(settings);

    if (
      settings.forbidAll ||
      (isArray(settings.defer) && settings.defer.length > 0) ||
      (isArray(settings.forbid) && settings.forbid.length > 0)
    ) {
      const methodsMetadata: PropertyMap = {}; // Methods aggregation

      const getCallbackFor = (composable: Required<CollisionDescriptor>) => (methodName: PropertyKey): void => {
        const method = get(composable.methods, methodName);
        const existingMetadata = get(methodsMetadata, methodName);

        throwIfForbiddenOrAmbiguous(existingMetadata, descriptor, composable, methodName);

        let value = method;

        // Process Collision.defer
        if (isDeferred(composable, methodName)) {
          const array = existingMetadata || [];
          array.push(method);

          value = array;
        }

        set(methodsMetadata, methodName, value);
      };

      for (const composable of parameters.composables
        .map((composable) => (isStamp(composable) ? composable.compose : composable))
        .filter((composable) => isObject(composable.methods))) {
        const { methods } = composable as Required<Descriptor>;
        const setMethodCallback = getCallbackFor(composable as Required<CollisionDescriptor>);
        for (const name of ownKeys(methods).filter((methodName) => {
          const method = get(methods, methodName);
          const existingMetadata = get(methodsMetadata, methodName);
          // Checking by reference if the method is already present
          return (
            method !== undefined &&
            (existingMetadata === undefined ||
              (existingMetadata !== method && (!isArray(existingMetadata) || !existingMetadata.includes(method))))
          );
        })) {
          setMethodCallback(name);
        }
      }

      setMethodsMetadata(parameters, methodsMetadata);
    }
  }
};

/**
 * Controls collision behavior: forbid or defer
 *
 * This stamp (aka behavior) will check if there are any conflicts on every compose call. Throws an Error in case of a forbidden collision or ambiguous setup.
 */
// TODO: Collision should support generics like <ObjectInstance, OriginalStamp>
const Collision: Stamp = compose({
  deepConfiguration: { Collision: { defer: [], forbid: [] } },
  staticProperties: {
    collisionSetup(this: Stamp | undefined, settings: CollisionSettings): CollisionStamp {
      return (this?.compose ? this : Collision).compose({
        deepConfiguration: { Collision: settings },
      }) as CollisionStamp;
    },
    collisionSettingsReset(this: CollisionStamp): CollisionStamp {
      return this.collisionSetup(null);
    },
    collisionProtectAnyMethod(this: CollisionStamp, settings: CollisionSettings): CollisionStamp {
      return this.collisionSetup(
        assign<CollisionSettings>({}, settings, { forbidAll: true })
      );
    },
  },
  composers: [composer],
});

export default Collision;

// For CommonJS default export support
module.exports = Collision;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Collision });
