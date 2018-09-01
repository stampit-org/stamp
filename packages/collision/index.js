var compose = require("@stamp/compose");
var is = require("@stamp/is");

function forEach(maybeArray, fn) {
  if (!is.isArray(maybeArray) && is.isObject(maybeArray)) maybeArray = Object.keys(maybeArray);
  if (is.isArray(maybeArray) && maybeArray.length > 0) {
    for (var i = 0; i < maybeArray.length; i++) {
      if (fn(maybeArray[i]) === "BREAK") break;
    }
  }
}

function forEachMetadata(maybeDescriptor, fn) {
  if (!is.isObject(maybeDescriptor)) return;
  forEach(maybeDescriptor, function (metadataType) {
    if (!is.isPlainObject(maybeDescriptor[metadataType])) return;
    forEach(maybeDescriptor[metadataType], function (metadataName) {
      fn(metadataType, metadataName);
    });
  });
}

function deferredFn(functions) {
  return function deferredFn() {
    "use strict";
    var results = [];
    for (var i = 0; i < functions.length; i++) {
      results.push(functions[i].apply(this, arguments)); // jshint ignore:line
    }
    return results;
  };
}

function pipedFn(functions) {
  return function pipedFn() {
    "use strict";
    for (var i = 0, result; i < functions.length; i++) {
      result = functions[i].call(this, result); // jshint ignore:line
    }
    return result;
  };
}

var delayTypes = {
  defer: deferredFn,
  pipe: pipedFn
};

function makeProxyFunction(functions, name, delayType) {
  var fns = [];
  var haveRegularFns = false, haveProxiesFns = false;
  for (var i = 0; i < functions.length; i++) {
    var f = functions[i];
    if (!is.isFunction(f)) continue;

    if (is.isArray(f._proxiedFunctions)) {
      haveProxiesFns = true;
      fns = fns.concat(f._proxiedFunctions);
    } else {
      haveRegularFns = true;
      fns.push(f);
    }

    if (haveRegularFns && haveProxiesFns)
      throw new Error("Attempt to " + delayType + " with regular method");
  }

  var fn = delayTypes[delayType](fns);
  fn._proxiedFunctions = fns;
  Object.defineProperty(fn, "name", {
    value: name,
    configurable: true
  });

  return fn;
}

function isForbidden(settings, metadataType, metadataName) {
  return (
    settings === "forbid" ||
    (settings && settings[metadataType] === "forbid") ||
    (settings && settings[metadataType] && settings[metadataType][metadataName] === "forbid")
  );
}

function getValidSettings(composables) {
  var finalSettings = {};
  forEach(composables, function (composable) {
    var settings = getSettings(composable);

    if (settings === "forbid") {
      finalSettings = "forbid";
      return "BREAK";
    }
    forEach(settings, function (metadataType) {
      if (settings[metadataType] === "forbid") {
        finalSettings[metadataType] = "forbid";
        return "BREAK";
      }

      if (!is.isPlainObject(settings[metadataType])) return;
      forEach(settings[metadataType], function (metadataName) {
        if (!is.isString(settings[metadataType][metadataName])) return; // malformed settings

        finalSettings[metadataType] = finalSettings[metadataType] || {};
        if (settings[metadataType][metadataName] === "forbid") {
          finalSettings[metadataType][metadataName] = "forbid";
          return "BREAK";
        }

        var newValue = settings[metadataType][metadataName];
        var existingValue = finalSettings[metadataType][metadataName];
        if (existingValue && existingValue !== newValue) {
          throw new Error("Ambiguous Collision settings. The `" + metadataName + "` " + metadataType + " can't be both " + existingValue + " and " + newValue);
        }

        finalSettings[metadataType][metadataName] = newValue;
      });
    });
  });

  return finalSettings;
}

function checkCollisions(finalSettings, finalDescriptor, composables) {
  var aggregatedComposables = {};
  forEach(composables, function (composable) {
    var descriptor = composable.compose || composable || {};
    forEachMetadata(descriptor, function (metadataType, metadataName) {
      aggregatedComposables[metadataType] = aggregatedComposables[metadataType] || {};
      var array = aggregatedComposables[metadataType][metadataName] = aggregatedComposables[metadataType][metadataName] || [];
      array.push(descriptor[metadataType][metadataName]);

      if (array.length > 1) {
        if (isForbidden(finalSettings, metadataType, metadataName)) {
          throw Error("Collisions of `" + metadataName + "` " + metadataType + " are forbidden.");
        }
      }
    });
  });

  return aggregatedComposables;
}

function mutateFinalDescriptor(finalSettings, finalDescriptor, aggregatedComposables) {
  forEach(delayTypes, function (delayType) {
    forEachMetadata(aggregatedComposables, function (metadataType, metadataName) {
      if (finalSettings[metadataType] && finalSettings[metadataType][metadataName] === delayType) {
        finalDescriptor[metadataType][metadataName] = makeProxyFunction(aggregatedComposables[metadataType][metadataName], metadataName, delayType);
      }
    });
  });
}

function getSettings(composable) {
  var descriptor = composable.compose || composable;
  return descriptor && descriptor.deepConfiguration && descriptor.deepConfiguration.Collision;
}

var Collision = compose({
  deepConfiguration: { Collision: {} },
  staticProperties: {
    collisionSetup: function (opts) {
      "use strict";
      var Stamp = is.isStamp(this) ? this : Collision;
      return Stamp.compose({ deepConfiguration: { Collision: opts } });
    }
  },
  composers: [function (opts) {
    var finalDescriptor = opts.stamp.compose;
    var allSettings = getSettings(finalDescriptor);
    if (!is.isObject(allSettings) && !is.isString(allSettings)) return;

    var finalSettings = getValidSettings(opts.composables); // recompose the settings. Also, checks for ambiguous setup
    finalDescriptor.deepConfiguration.Collision = finalSettings;
    var aggregatedComposables = checkCollisions(finalSettings, finalDescriptor, opts.composables);
    mutateFinalDescriptor(finalSettings, finalDescriptor, aggregatedComposables);
  }]
});

module.exports = Collision;
