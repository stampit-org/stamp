import compose from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isStamp } from '@stamp/is';

import type { ComposeProperty, Composer, ComposerParameters, Descriptor, PropertyMap, Stamp } from '@stamp/compose';

const { defineProperty, get, ownKeys, set } = Reflect;

/** @internal `Descriptor` type with `Collision` property */
interface CollisionDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { Collision: CollisionSettings };
}

/**
 * Settings for the `Collision` stamp
 */
export interface CollisionSettings {
  allow?: PropertyKey[];
  defer: PropertyKey[];
  forbid: PropertyKey[];
  forbidAll?: boolean;
}

/** @internal Helper function to retrieve the `Collision` setttings */
const getSettings = (descriptor: CollisionDescriptor) => descriptor?.deepConfiguration?.Collision;

/** @internal `Collision` settings property names */
type SettingsProperty = 'allow' | 'defer' | 'forbid';

type CheckIf = (descriptor: CollisionDescriptor, setting: SettingsProperty, methodName: PropertyKey) => boolean;
/** @internal Helper function to check a method against a `Collision` settting */
const checkIf: CheckIf = (descriptor, setting, methodName: PropertyKey) => {
  const settings = getSettings(descriptor);
  const methodNames: PropertyKey[] | undefined = settings && get(settings, setting);
  return isArray(methodNames) && methodNames.includes(methodName);
};

type IsHelper = (descriptor: CollisionDescriptor, methodName: PropertyKey) => boolean;

/** @internal Helper function to check if a method is forbidden */
const isForbidden: IsHelper = (descriptor, methodName) =>
  getSettings(descriptor)?.forbidAll
    ? !checkIf(descriptor, 'allow', methodName)
    : checkIf(descriptor, 'forbid', methodName);

/** @internal Helper function to check if a method is deferred */
const isDeferred: IsHelper = (descriptor, methodName) => checkIf(descriptor, 'defer', methodName);

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

/** @internal Helper function to remove duplicates from `Collision` settings */
const removeDuplicates = (settings: CollisionSettings) => {
  const { allow, defer, forbid } = settings;
  if (isArray(defer)) set(settings, 'defer', [...new Set(defer)]);
  if (isArray(forbid)) set(settings, 'forbid', [...new Set(forbid)]);
  if (isArray(allow)) set(settings, 'allow', [...new Set(allow)]);
};

/** @internal Helper function that throw on ambiguous `Collision` settings */
const throwIfAmbiguous = (settings: CollisionSettings) => {
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

/** @internal Helper function that throw on forbidden or ambiguous methods */
const throwIfForbiddenOrAmbiguous = (
  existingMetadata: unknown[],
  descriptor: CollisionDescriptor,
  composable: Required<CollisionDescriptor>,
  methodName: PropertyKey
) => {
  if (existingMetadata) {
    // Process Collision.forbid
    if (isForbidden(descriptor, methodName)) {
      throw new Error(`Collision of method \`${String(methodName)}\` is forbidden`);
    }

    // Process Collision.defer
    if (isDeferred(composable, methodName)) {
      if (!isArray(existingMetadata)) {
        throw new Error(`Ambiguous Collision settings. The \`${String(methodName)}\` is both deferred and regular`);
      }
      // Process no Collision settings
    } else if (isArray(existingMetadata)) {
      // TODO: update error message below
      throw new Error(`Ambiguous Collision settings. The \`${String(methodName)}\` is both deferred and regular`);
    }
  }
};

/** @internal `Collision` composer function */
const composer: Composer = (parameters) => {
  const descriptor = parameters.stamp.compose as CollisionDescriptor;
  const settings = getSettings(descriptor);

  if (isObject(settings)) {
    const { defer, forbid, forbidAll } = settings;
    // De-duplicating is an important part of the logic
    removeDuplicates(settings);

    // Make sure settings are not ambiguous
    throwIfAmbiguous(settings);

    if (forbidAll || (isArray(defer) && defer.length > 0) || (isArray(forbid) && forbid.length > 0)) {
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

function collisionSetup(this: CollisionStamp | undefined, settings: CollisionSettings | null): CollisionStamp {
  return (this?.compose ? this : Collision).compose({
    deepConfiguration: { Collision: settings },
  }) as CollisionStamp;
}

function collisionSettingsReset(this: CollisionStamp): CollisionStamp {
  return this.collisionSetup(null);
}

function collisionProtectAnyMethod(this: CollisionStamp, settings: CollisionSettings): CollisionStamp {
  return this.collisionSetup(
    assign<CollisionSettings>({}, settings, { forbidAll: true })
  );
}

/**
 * A stamp with the `Collision` behavior
 */
// TODO: CollisionStamp should support generics like <ObjectInstance, OriginalStamp>
export interface CollisionStamp extends Stamp {
  compose: ComposeProperty & CollisionDescriptor;
  /**
   * Forbid or Defer an exclusive method
   */
  collisionSetup: typeof collisionSetup;
  /**
   * Remove any Collision settings from the stamp
   */
  collisionSettingsReset: typeof collisionSettingsReset;
  /**
   * Forbid any collisions, excluding those allowed
   */
  collisionProtectAnyMethod: typeof collisionProtectAnyMethod;
}

/**
 * Controls collision behavior: forbid or defer
 *
 * This stamp (aka behavior) will check if there are any conflicts on every compose call. Throws an Error in case of a forbidden collision or ambiguous setup.
 */
// TODO: Collision should support generics like <ObjectInstance, OriginalStamp>
const Collision = compose({
  deepConfiguration: { Collision: { defer: [], forbid: [] } },
  staticProperties: { collisionSetup, collisionSettingsReset, collisionProtectAnyMethod },
  composers: [composer],
}) as CollisionStamp;

export default Collision;

// For CommonJS default export support
module.exports = Collision;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Collision });
