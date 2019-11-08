'use strict';

const compose = require('@stamp/compose');
const assign = require('@stamp/core/assign');
const isStamp = require('@stamp/is/stamp');
const isObject = require('@stamp/is/object');
const isArray = require('@stamp/is/array');

const { defineProperty, get, ownKeys, set } = Reflect;

const dedupe = (array) => [...new Set(array)];

const makeProxyFunction = (functions, name) => {
  function deferredFn(...args) {
    return [...functions.map((func) => func.apply(this, args.slice()))];
  }

  defineProperty(deferredFn, 'name', { value: name, configurable: true });

  return deferredFn;
};

const getSettings = (descriptor) =>
  descriptor && descriptor.deepConfiguration && descriptor.deepConfiguration.Collision;

const checkIf = (descriptor, setting, methodName) => {
  const settings = getSettings(descriptor);
  const settingsFor = settings && get(settings, setting);
  return isArray(settingsFor) && settingsFor.indexOf(methodName) >= 0;
};

const isForbidden = (descriptor, methodName) => {
  const settings = getSettings(descriptor);

  return settings && settings.forbidAll
    ? !checkIf(descriptor, 'allow', methodName)
    : checkIf(descriptor, 'forbid', methodName);
};

const isDeferred = (descriptor, methodName) => checkIf(descriptor, 'defer', methodName);

const setMethodsMetadata = (opts, methodsMetadata) => {
  const { methods } = opts.stamp.compose;

  const setMethodCallback = (key) => {
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

const removeDuplicates = (settings) => {
  if (isArray(settings.defer)) set(settings, 'defer', dedupe(settings.defer));
  if (isArray(settings.forbid)) set(settings, 'forbid', dedupe(settings.forbid));
  if (isArray(settings.allow)) set(settings, 'allow', dedupe(settings.allow));
};

const throwIfAmbiguous = (settings) => {
  if (isArray(settings.forbid)) {
    const intersect = (value) => settings.forbid.indexOf(value) >= 0;
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

const throwIfForbiddenOrAmbiguous = (existingMetadata, descriptor, composable, methodName) => {
  // Process Collision.forbid
  if (existingMetadata && isForbidden(descriptor, methodName)) {
    throw new Error(`Collision of method \`${methodName}\` is forbidden`);
  }

  // Process Collision.defer
  if (isDeferred(composable, methodName)) {
    if (existingMetadata && !isArray(existingMetadata)) {
      throw new Error(`Ambiguous Collision settings. The \`${methodName}\` is both deferred and regular`);
    }
    // Process no Collision settings
  } else if (isArray(existingMetadata)) {
    // TODO: update error message below
    throw new Error(`Ambiguous Collision settings. The \`${methodName}\` is both deferred and regular`);
  }
};

const composer = (opts) => {
  const descriptor = opts.stamp.compose;
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
      const methodsMetadata = {}; // methods aggregation

      const getCallbackFor = (composable) => (methodName) => {
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
        .map((composable) => (isStamp(composable) ? composable.compose : composable))
        .filter((composable) => isObject(composable.methods))
        .forEach((composable) => {
          const { methods } = composable;
          const setMethodCallback = getCallbackFor(composable);
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

const Collision = compose({
  deepConfiguration: { Collision: { defer: [], forbid: [] } },
  staticProperties: {
    collisionSetup(opts) {
      const Stamp = this && this.compose ? this : Collision;
      return Stamp.compose({ deepConfiguration: { Collision: opts } });
    },
    collisionSettingsReset() {
      return this.collisionSetup(null);
    },
    collisionProtectAnyMethod(opts) {
      return this.collisionSetup(assign({}, opts, { forbidAll: true }));
    },
  },
  composers: [composer],
});

module.exports = Collision;
