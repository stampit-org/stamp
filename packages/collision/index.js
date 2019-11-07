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
    const proxy = (func) => func.apply(this, args.slice());
    return [...functions.map(proxy)];
  }

  defineProperty(deferredFn, 'name', {
    value: name,
    configurable: true,
  });

  return deferredFn;
};

const getCollisionSettings = (descriptor) =>
  descriptor && descriptor.deepConfiguration && descriptor.deepConfiguration.Collision;

const descriptorHasSetting = (descriptor, setting, methodName) => {
  const settings = getCollisionSettings(descriptor);
  const settingsFor = settings && get(settings, setting);
  return isArray(settingsFor) && settingsFor.indexOf(methodName) >= 0;
};

const forbidsCollision = (descriptor, methodName) => {
  const settings = getCollisionSettings(descriptor);

  return settings && settings.forbidAll
    ? !descriptorHasSetting(descriptor, 'allow', methodName)
    : descriptorHasSetting(descriptor, 'forbid', methodName);
};

const defersCollision = (descriptor, methodName) => descriptorHasSetting(descriptor, 'defer', methodName);

const setMethodsMetadata = (opts, methodsMetadata) => {
  const { methods } = opts.stamp.compose;

  ownKeys(methodsMetadata).forEach((methodName) => {
    const oneMetadata = get(methodsMetadata, methodName);
    if (isArray(oneMetadata)) {
      set(
        methods,
        methodName,
        oneMetadata.length === 1
          ? // Some collisions aggregated to a single method
            // Mutating the resulting stamp
            oneMetadata[0]
          : makeProxyFunction(oneMetadata, methodName)
      );
    } else {
      set(methods, methodName, oneMetadata);
    }
  });
};

const Collision = compose({
  deepConfiguration: { Collision: { defer: [], forbid: [] } },
  staticProperties: {
    collisionSetup(opts) {
      // 'use strict';

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
  composers: [
    // eslint-disable-next-line func-names
    function(opts) {
      const descriptor = opts.stamp.compose;
      const settings = getCollisionSettings(descriptor);
      if (isObject(settings)) {
        // let i;
        // let methodName;
        // Deduping is an important part of the logic
        if (isArray(settings.defer)) settings.defer = dedupe(settings.defer);
        if (isArray(settings.forbid)) settings.forbid = dedupe(settings.forbid);
        if (isArray(settings.allow)) settings.allow = dedupe(settings.allow);

        // Make sure settings are not ambiguous
        if (isArray(settings.forbid)) {
          const intersect = (value) => settings.forbid.indexOf(value) >= 0;
          const deferredAndForbidden = isArray(settings.defer) ? settings.defer.filter(intersect) : [];
          if (deferredAndForbidden.length > 0) {
            throw new Error(
              `Ambiguous Collision settings. [${deferredAndForbidden.join(', ')}] both deferred and forbidden`
            );
          }
          const allowedAndForbidden = isArray(settings.allow) ? settings.allow.filter(intersect) : [];
          if (allowedAndForbidden.length > 0) {
            throw new Error(
              `Ambiguous Collision settings. [${allowedAndForbidden.join(', ')}] both allowed and forbidden`
            );
          }
        }

        if (
          settings.forbidAll ||
          (isArray(settings.defer) && settings.defer.length > 0) ||
          (isArray(settings.forbid) && settings.forbid.length > 0)
        ) {
          const methodsMetadata = {}; // methods aggregation
          opts.composables
            .map((composable) => (isStamp(composable) ? composable.compose : composable))
            .filter((composable) => isObject(composable.methods))
            .forEach((composable) => {
              const { methods } = composable;
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
                .forEach((methodName) => {
                  const method = get(methods, methodName);
                  const existingMetadata = get(methodsMetadata, methodName);

                  // Process Collision.forbid
                  if (existingMetadata && forbidsCollision(descriptor, methodName)) {
                    throw new Error(`Collision of method \`${methodName}\` is forbidden`);
                  }

                  // Process Collision.defer
                  if (defersCollision(composable, methodName)) {
                    if (existingMetadata && !isArray(existingMetadata)) {
                      throw new Error(
                        `Ambiguous Collision settings. The \`${methodName}\` is both deferred and regular`
                      );
                    }
                    const arr = existingMetadata || [];
                    arr.push(method);
                    set(methodsMetadata, methodName, arr);
                  } else {
                    // Process no Collision settings
                    if (isArray(existingMetadata)) {
                      throw new Error(
                        `Ambiguous Collision settings. The \`${methodName}\` is both deferred and regular`
                      );
                    }

                    set(methodsMetadata, methodName, method);
                  }
                });
            });

          setMethodsMetadata(opts, methodsMetadata);
        }
      }
    },
  ],
});

module.exports = Collision;
