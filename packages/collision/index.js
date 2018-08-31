var compose = require("@stamp/compose");
var assign = require("@stamp/core/assign");
var is = require("@stamp/is");

function forEach(maybeArray, fn) {
  if (!is.isArray(maybeArray) && is.isObject(maybeArray)) maybeArray = Object.keys(maybeArray);
  if (is.isArray(maybeArray) && maybeArray.length > 0) {
    for (var i = 0; i < maybeArray.length; i++) {
      fn(maybeArray[i]);
    }
  }
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

function isForbidden(allSettings, metadataType, metadataName) {
  if (!allSettings || !allSettings.forbidAll) return false;
  if (allSettings.forbidAll === true) return true;
  if (allSettings.forbidAll[metadataType]) return true;

  if (!allSettings.forbid) return false;
  if (allSettings.forbid[metadataType] && allSettings.forbid[metadataType][metadataName]) return true;

  return false;
}

function checkAmbiguousSetup(allSettings) {
  if (!allSettings.defer && !allSettings.pipe) return;

  forEach(allSettings.defer, function (metadataType) {
    forEach(allSettings.defer[metadataType], function (metadataName) {
      if (isForbidden(allSettings, metadataType, metadataName)) {
        throw new Error("Ambiguous Collision settings. The `" + metadataName + "` " + metadataType + " are both deferred and forbidden");
      }
    });
  });

  forEach(allSettings.pipe, function (metadataType) {
    forEach(allSettings.pipe[metadataType], function (metadataName) {
      if (isForbidden(allSettings, metadataType, metadataName)) {
        throw new Error("Ambiguous Collision settings. The `" + metadataName + "` " + metadataType + " are both piped and forbidden");
      }
    });
  });

  var mergedDelayedDescriptor = assign({}, allSettings.defer, allSettings.pipe);
  forEach(mergedDelayedDescriptor, function (metadataType) {
    forEach(mergedDelayedDescriptor[metadataType], function (metadataName) {
      if (
        allSettings.defer && allSettings.defer[metadataType] && allSettings.defer[metadataType] &&
        allSettings.pipe && allSettings.pipe[metadataType] && allSettings.pipe[metadataType]
      ) {
        throw new Error("Ambiguous Collision settings. The `" + metadataName + "` " + metadataType + " are both piped and deferred");
      }
    });
  });
}

function checkCollisions(allSettings, finalDescriptor, composables) {
  var aggregatedComposables = {};
  forEach(composables, function (composable) {
    var descriptor = composable.compose || composable || {};
    forEach(descriptor, function (metadataType) {
      if (!is.isPlainObject(descriptor[metadataType])) return;
      forEach(descriptor[metadataType], function (metadataName) {
        aggregatedComposables[metadataType] = aggregatedComposables[metadataType] || {};
        aggregatedComposables[metadataType][metadataName] = aggregatedComposables[metadataType][metadataName] || [];
        aggregatedComposables[metadataType][metadataName].push(descriptor[metadataType][metadataName]);
      });
    });
  });

  forEach(aggregatedComposables, function (metadataType) {
    forEach(aggregatedComposables[metadataType], function (metadataName) {
      if (aggregatedComposables[metadataType][metadataName].length > 1) {
        if (isForbidden(allSettings, metadataType, metadataName)) {
          throw Error("Collisions of `" + metadataName + "` " + metadataType + " are forbidden.");
        }
      }
    });
  });

  return aggregatedComposables;
}

function mutateFinalDescriptor(allSettings, finalDescriptor, aggregatedComposables) {
  forEach(delayTypes, function (delayType) {
    forEach(aggregatedComposables, function (metadataType) {
      forEach(aggregatedComposables[metadataType], function (metadataName) {
        if (allSettings && allSettings[delayType] && allSettings[delayType][metadataType] && allSettings[delayType][metadataType][metadataName]) {
          finalDescriptor[metadataType][metadataName] = makeProxyFunction(aggregatedComposables[metadataType][metadataName], metadataName, delayType);
        }
      });
    });
  });
}

var Collision = compose({
  deepConfiguration: { Collision: {} },
  staticProperties: {
    collisionSetup: function (opts) {
      "use strict";
      var Stamp = is.isStamp(this && this.compose) ? this : Collision;
      return Stamp.compose({ deepConfiguration: { Collision: opts } });
    },
    collisionForbidAll: function (metadataType) {
      if (!metadataType) {
        return this.collisionSetup({ forbidAll: true });
      } else {
        var opts = { forbidAll: {} };
        opts[metadataType] = true;
        return this.collisionSetup(opts);
      }
    },
    collisionForbid: function (opts) {
      return this.collisionSetup({ forbid: opts });
    },
    collisionDeferMethod: function (methodName) {
      var methods = {};
      methods[methodName] = true;
      return this.collisionSetup({ defer: { methods: methods } });
    },
    collisionPipeMethod: function (methodName) {
      var methods = {};
      methods[methodName] = true;
      return this.collisionSetup({ pipe: { methods: methods } });
    },
    collisionSettingsReset: function () {
      return this.collisionSetup(null);
    }
  },
  composers: [function (opts) {
    var finalDescriptor = opts.stamp.compose;
    var allSettings = finalDescriptor.deepConfiguration && finalDescriptor.deepConfiguration.Collision;
    if (!is.isObject(allSettings)) return;

    checkAmbiguousSetup(allSettings);
    var aggregatedComposables = checkCollisions(allSettings, finalDescriptor, opts.composables);
    mutateFinalDescriptor(allSettings, finalDescriptor, aggregatedComposables);
  }]
});

module.exports = Collision;
