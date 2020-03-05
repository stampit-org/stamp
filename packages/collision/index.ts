import compose, { ComposeProperty, Composer, ComposerParams, Descriptor, PropertyMap, Stamp } from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isStamp } from '@stamp/is';

const { defineProperty, get, ownKeys, set } = Reflect;

const deDupe = <T>(array: T[]): T[] => [...new Set(array)];

type MakeProxyFunction = (
  functions: Array<(arg0: any[]) => any>,
  name: string | number | symbol
) => (this: object, ...args: unknown[]) => unknown[];
const makeProxyFunction: MakeProxyFunction = (functions, name) => {
  function deferredFn(this: object, ...arguments_: unknown[]): unknown[] {
    return [...functions.map((func) => Reflect.apply(func, this, [...arguments_]))];
  }

  defineProperty(deferredFn, 'name', { value: name, configurable: true });

  return deferredFn;
};

interface CollisionSettings {
  allow?: PropertyKey[];
  defer: PropertyKey[];
  forbid: PropertyKey[];
  forbidAll?: boolean;
}

interface CollisionDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { Collision: CollisionSettings };
}

interface CollisionStamp extends Stamp {
  compose: ComposeProperty & CollisionDescriptor;
  collisionSetup(this: CollisionStamp | undefined, opts: CollisionSettings | null | undefined): CollisionStamp;
}

type GetSettings = (descriptor: CollisionDescriptor) => CollisionSettings | undefined;
const getSettings: GetSettings = (descriptor) => descriptor?.deepConfiguration?.Collision;

type CheckIf = (descriptor: CollisionDescriptor, setting: PropertyKey, methodName: PropertyKey) => boolean;
const checkIf: CheckIf = (descriptor, setting, methodName: PropertyKey) => {
  const settings = getSettings(descriptor);
  const settingsFor = settings && get(settings, setting);
  return isArray(settingsFor) && settingsFor.includes(methodName);
};

type IsForbidden = (descriptor: CollisionDescriptor, methodName: PropertyKey) => boolean;
const isForbidden: IsForbidden = (descriptor, methodName) =>
  getSettings(descriptor)?.forbidAll
    ? !checkIf(descriptor, 'allow', methodName)
    : checkIf(descriptor, 'forbid', methodName);

type IsDeferred = (descriptor: CollisionDescriptor, methodName: PropertyKey) => boolean;
const isDeferred: IsDeferred = (descriptor, methodName) => checkIf(descriptor, 'defer', methodName);

type SetMethodsMetadata = (opts: ComposerParams, methodsMetadata: PropertyMap) => void;
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
    // const value =
    //   isArray(metadata)
    //     ? metadata.length === 1
    //       ? // Some collisions aggregated to a single method
    //         // Mutating the resulting stamp
    //         metadata[0]
    //       : makeProxyFunction(metadata, key)
    //     : metadata;

    set(methods, key, value);
  };

  ownKeys(methodsMetadata).forEach(setMethodCallback);
};

type RemoveDuplicates = (settings: CollisionSettings) => void;
const removeDuplicates: RemoveDuplicates = (settings) => {
  if (isArray(settings.defer)) set(settings, 'defer', deDupe(settings.defer));
  if (isArray(settings.forbid)) set(settings, 'forbid', deDupe(settings.forbid));
  if (isArray(settings.allow)) set(settings, 'allow', deDupe(settings.allow));
};

type ThrowIfAmbiguous = (settings: CollisionSettings) => void;
const throwIfAmbiguous: ThrowIfAmbiguous = (settings) => {
  if (isArray(settings.forbid)) {
    const intersect = (value: PropertyKey): boolean => settings.forbid.includes(value);
    const deferredAndForbidden = isArray(settings.defer) ? settings.defer.filter(intersect) : [];
    if (deferredAndForbidden.length > 0) {
      throw new Error(`Ambiguous Collision settings. [${deferredAndForbidden.join(', ')}] both deferred and forbidden`);
    }

    const allowedAndForbidden = isArray(settings.allow) ? settings.allow.filter(intersect) : [];
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
const throwIfForbiddenOrAmbiguous: ThrowIfForbiddenOrAmbiguous = (
  existingMetadata,
  descriptor,
  composable,
  methodName
) => {
  // Process Collision.forbid
  if (existingMetadata && isForbidden(descriptor, methodName)) {
    throw new Error(`Collision of method \`${String(methodName)}\` is forbidden`);
  }

  // Process Collision.defer
  if (isDeferred(composable, methodName)) {
    if (existingMetadata && !isArray(existingMetadata)) {
      throw new Error(`Ambiguous Collision settings. The \`${String(methodName)}\` is both deferred and regular`);
    }
    // Process no Collision settings
  } else if (isArray(existingMetadata)) {
    // TODO: update error message below
    throw new Error(`Ambiguous Collision settings. The \`${String(methodName)}\` is both deferred and regular`);
  }
};

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

      parameters.composables
        .map((composable) => (isStamp(composable) ? composable.compose : composable))
        .filter((composable) => isObject(composable.methods))
        .forEach((composable) => {
          const { methods } = composable as Required<Descriptor>;
          const setMethodCallback = getCallbackFor(composable as Required<CollisionDescriptor>);
          ownKeys(methods)
            .filter((methodName) => {
              const method = get(methods, methodName);
              const existingMetadata = get(methodsMetadata, methodName);
              // Checking by reference if the method is already present
              return (
                method !== undefined &&
                (existingMetadata === undefined ||
                  (existingMetadata !== method && (!isArray(existingMetadata) || !existingMetadata.includes(method))))
              );
            })
            .forEach(setMethodCallback);
        });

      setMethodsMetadata(parameters, methodsMetadata);
    }
  }
};

/**
 * TODO
 */
const Collision = compose({
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
      return this.collisionSetup(assign({}, settings, { forbidAll: true }) as CollisionSettings);
    },
  },
  composers: [composer],
});

export default Collision;

// For CommonJS default export support
module.exports = Collision;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Collision });
