import compose, { ComposeProperty, Composer, ComposerParams, Descriptor, PropertyMap, Stamp } from '@stamp/compose';
import { assign } from '@stamp/core';
import { isArray, isObject, isStamp } from '@stamp/is';

const { defineProperty, get, ownKeys, set } = Reflect;

const dedupe = <T>(array: T[]): T[] => [...new Set(array)];

interface MakeProxyFunction {
  (functions: Function[], name: string | number | symbol): (this: object, ...args: unknown[]) => unknown[];
}
const makeProxyFunction: MakeProxyFunction = (functions, name) => {
  function deferredFn(this: object, ...args: unknown[]): unknown[] {
    return [...functions.map((func) => func.apply(this, [...args]))];
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
  collisionSetup(this: CollisionStamp | undefined, opts: CollisionSettings | null | undefined): CollisionStamp;
  compose: ComposeProperty & CollisionDescriptor;
}

interface GetSettings {
  (descriptor: CollisionDescriptor): CollisionSettings | undefined;
}
const getSettings: GetSettings = (descriptor) => descriptor?.deepConfiguration?.Collision;

interface CheckIf {
  (descriptor: CollisionDescriptor, setting: PropertyKey, methodName: PropertyKey): boolean;
}
const checkIf: CheckIf = (descriptor, setting, methodName: PropertyKey) => {
  const settings = getSettings(descriptor);
  const settingsFor = settings && get(settings, setting);
  return isArray(settingsFor) && settingsFor.indexOf(methodName) >= 0;
};

interface IsForbidden {
  (descriptor: CollisionDescriptor, methodName: PropertyKey): boolean;
}
const isForbidden: IsForbidden = (descriptor, methodName) =>
  getSettings(descriptor)?.forbidAll
    ? !checkIf(descriptor, 'allow', methodName)
    : checkIf(descriptor, 'forbid', methodName);

interface IsDeferred {
  (descriptor: CollisionDescriptor, methodName: PropertyKey): boolean;
}
const isDeferred: IsDeferred = (descriptor, methodName) => checkIf(descriptor, 'defer', methodName);

interface SetMethodsMetadata {
  (opts: ComposerParams, methodsMetadata: PropertyMap): void;
}
const setMethodsMetadata: SetMethodsMetadata = (opts, methodsMetadata) => {
  const { methods } = opts.stamp.compose as Required<Descriptor>;

  const setMethodCallback = (key: PropertyKey): void => {
    const metadata = get(methodsMetadata, key);
    const value =
      // eslint-disable-next-line no-nested-ternary
      isArray(metadata)
        ? metadata.length === 1
          ? // Some collisions aggregated to a single method
            // Mutating the resulting stamp
            metadata[0]
          : makeProxyFunction(metadata, key)
        : metadata;

    set(methods, key, value);
  };

  ownKeys(methodsMetadata).forEach(setMethodCallback);
};

interface RemoveDuplicates {
  (settings: CollisionSettings): void;
}
const removeDuplicates: RemoveDuplicates = (settings) => {
  if (isArray(settings.defer)) set(settings, 'defer', dedupe(settings.defer));
  if (isArray(settings.forbid)) set(settings, 'forbid', dedupe(settings.forbid));
  if (isArray(settings.allow)) set(settings, 'allow', dedupe(settings.allow));
};

interface ThrowIfAmbiguous {
  (settings: CollisionSettings): void;
}
const throwIfAmbiguous: ThrowIfAmbiguous = (settings) => {
  if (isArray(settings.forbid)) {
    const intersect = (value: PropertyKey): boolean => settings.forbid.indexOf(value) >= 0;
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

interface ThrowIfForbiddenOrAmbiguous {
  (
    existingMetadata: unknown[],
    descriptor: CollisionDescriptor,
    composable: Required<CollisionDescriptor>,
    methodName: PropertyKey
  ): void;
}
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

const composer: Composer = (opts) => {
  const descriptor = opts.stamp.compose as CollisionDescriptor;
  const settings = getSettings(descriptor);

  if (isObject(settings)) {
    // Deduping is an important part of the logic
    removeDuplicates(settings);

    // Make sure settings are not ambiguous
    throwIfAmbiguous(settings);

    if (
      settings.forbidAll ||
      (isArray(settings.defer) && settings.defer.length > 0) ||
      (isArray(settings.forbid) && settings.forbid.length > 0)
    ) {
      const methodsMetadata: PropertyMap = {}; // methods aggregation

      const getCallbackFor = (composable: Required<CollisionDescriptor>) => (methodName: PropertyKey): void => {
        const method = get(composable.methods, methodName);
        const existingMetadata = get(methodsMetadata, methodName);

        throwIfForbiddenOrAmbiguous(existingMetadata, descriptor, composable, methodName);

        let value = method;

        // Process Collision.defer
        if (isDeferred(composable, methodName)) {
          const arr = existingMetadata || [];
          arr.push(method);

          value = arr;
        }

        set(methodsMetadata, methodName, value);
      };

      opts.composables
        .map((composable) => (isStamp<Stamp>(composable) ? composable.compose : composable))
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
                  (existingMetadata !== method &&
                    (!isArray(existingMetadata) || existingMetadata.indexOf(method) === -1)))
              );
            })
            .forEach(setMethodCallback);
        });

      setMethodsMetadata(opts, methodsMetadata);
    }
  }
};

/**
 * TODO
 */
const Collision = compose({
  deepConfiguration: { Collision: { defer: [], forbid: [] } },
  staticProperties: {
    collisionSetup(this: Stamp | undefined, opts: CollisionSettings): CollisionStamp {
      return (this?.compose ? this : Collision).compose({
        deepConfiguration: { Collision: opts },
      }) as CollisionStamp;
    },
    collisionSettingsReset(this: CollisionStamp): CollisionStamp {
      return this.collisionSetup(null);
    },
    collisionProtectAnyMethod(this: CollisionStamp, opts: CollisionSettings): CollisionStamp {
      return this.collisionSetup(assign({}, opts, { forbidAll: true }) as CollisionSettings);
    },
  },
  composers: [composer],
});

export default Collision;

// For CommonJS default export support
module.exports = Collision;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Collision });
