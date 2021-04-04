"use strict";
/* eslint-disable @typescript-eslint/ban-types */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compose_1 = __importDefault(require("@stamp/compose"));
const core_1 = require("@stamp/core");
const is_1 = require("@stamp/is");
const { defineProperty, get, set } = Reflect;
const dedupe = (array) => [...new Set(array)];
const AGGREGATION_PROPERTY_NAME = '_aggregated';
// eslint-disable-next-line no-shadow
var CollisionSettingKey;
(function (CollisionSettingKey) {
    CollisionSettingKey["Allow"] = "allow";
    CollisionSettingKey["MapSync"] = "map";
    CollisionSettingKey["ReduceSync"] = "reduce";
    CollisionSettingKey["ReduceThisSync"] = "reduceThis";
    CollisionSettingKey["MapAsync"] = "mapAsync";
    CollisionSettingKey["ReduceAsync"] = "reduceAsync";
    CollisionSettingKey["ReduceThisAsync"] = "reduceThisAsync";
    CollisionSettingKey["Forbid"] = "forbid";
    CollisionSettingKey["ForbidAll"] = "forbidAll";
})(CollisionSettingKey || (CollisionSettingKey = {}));
const AggregateSettingKeys = [
    CollisionSettingKey.MapSync,
    CollisionSettingKey.ReduceSync,
    CollisionSettingKey.ReduceThisSync,
    CollisionSettingKey.MapAsync,
    CollisionSettingKey.ReduceAsync,
    CollisionSettingKey.ReduceThisAsync,
];
// eslint-disable-next-line no-shadow
var SettingIndex;
(function (SettingIndex) {
    SettingIndex[SettingIndex["None"] = 0] = "None";
    SettingIndex[SettingIndex["MapSync"] = 1] = "MapSync";
    SettingIndex[SettingIndex["ReduceSync"] = 2] = "ReduceSync";
    SettingIndex[SettingIndex["ReduceThisSync"] = 3] = "ReduceThisSync";
    SettingIndex[SettingIndex["MapAsync"] = 4] = "MapAsync";
    SettingIndex[SettingIndex["ReduceAsync"] = 5] = "ReduceAsync";
    SettingIndex[SettingIndex["ReduceThisAsync"] = 6] = "ReduceThisAsync";
})(SettingIndex || (SettingIndex = {}));
function domainIsCollection(domain) {
    return ['methods'].includes(domain);
}
function validateDomainAndItemName(domain, itemName) {
    const dio = domainIsCollection(domain);
    if (dio && !itemName) {
        throw new Error(`Domain ${domain} requires an item name for aggregates`);
    }
    if (!dio && itemName) {
        throw new Error(`Domain ${domain} does not need an item name for aggregates`);
    }
}
function getDomainItems(descriptor, domain) {
    if (domainIsCollection(domain)) {
        return (get(descriptor, domain) || {});
    }
    return (get(descriptor, domain) || []);
}
function getDomainItem(descriptor, domain, itemName) {
    validateDomainAndItemName(domain, itemName);
    const domainItems = getDomainItems(descriptor, domain);
    if (!itemName) {
        return domainItems[0];
    }
    return get(domainItems, itemName);
}
function isAggregateDomainItem(domainItem) {
    return AGGREGATION_PROPERTY_NAME in domainItem;
}
function getDomainItemAggregates(domainItem) {
    return get(domainItem, AGGREGATION_PROPERTY_NAME) || [];
}
function setDomainItemAggregates(domainItem, aggregates) {
    const arr = get(domainItem, AGGREGATION_PROPERTY_NAME);
    if (arr) {
        arr.length = 0;
        aggregates.forEach((f) => {
            arr.push(f);
        });
    }
}
function prepareProxyFunction(functions, itemName, proxyFn) {
    defineProperty(proxyFn, 'name', { value: itemName, configurable: true });
    defineProperty(proxyFn, AGGREGATION_PROPERTY_NAME, { value: functions, configurable: true });
    return proxyFn;
}
function makeMapSyncProxyFunction({ functions, itemName }) {
    return prepareProxyFunction(functions, itemName, function mapSyncFn(...args) {
        const fns = getDomainItemAggregates(mapSyncFn);
        return [...fns.map((fn) => fn.apply(this, [...args]))];
    });
}
function makeReduceSyncProxyFunction({ functions, itemName }) {
    return prepareProxyFunction(functions, itemName, function reduceSyncFn(initialValue, ...args) {
        return getDomainItemAggregates(reduceSyncFn).reduce((o, fn) => {
            return fn(o, ...args);
        }, initialValue);
    });
}
function makeReduceThisSyncProxyFunction({ functions, itemName }) {
    return prepareProxyFunction(functions, itemName, function reduceThisSyncFn(...args) {
        return getDomainItemAggregates(reduceThisSyncFn).reduce((o, fn) => {
            const result = fn.apply(o, args);
            return result || this;
        }, this);
    });
}
function makeMapAsyncProxyFunction({ functions, itemName }) {
    return prepareProxyFunction(functions, itemName, async function mapAsyncFn(...args) {
        return Promise.all(getDomainItemAggregates(mapAsyncFn).map((fn) => fn.apply(this, args)));
    });
}
function makeReduceAsyncProxyFunction({ functions, itemName }) {
    return prepareProxyFunction(functions, itemName, async function reduceAsyncFn(initialValue, ...args) {
        return getDomainItemAggregates(reduceAsyncFn).reduce((promise, fn) => {
            return fn(promise, ...args);
        }, Promise.resolve(initialValue));
    });
}
function makeReduceThisAsyncProxyFunction({ functions, itemName }) {
    return prepareProxyFunction(functions, itemName, async function reduceThisAsyncFn(...args) {
        return getDomainItemAggregates(reduceThisAsyncFn).reduce((promise, fn) => {
            return promise.then((result) => {
                return Promise.resolve(fn.apply(result || this, args)).then((nextResult) => {
                    return nextResult || this;
                });
            });
        }, Promise.resolve(this || this));
    });
}
const getAllSettings = (descriptor) => { var _a, _b; return (_b = (_a = descriptor) === null || _a === void 0 ? void 0 : _a.deepConfiguration) === null || _b === void 0 ? void 0 : _b.Collision; };
const getSettings = (descriptor, domain) => { var _a, _b; return ((_b = (_a = descriptor) === null || _a === void 0 ? void 0 : _a.deepConfiguration) === null || _b === void 0 ? void 0 : _b.Collision) ? descriptor.deepConfiguration.Collision[domain] : undefined; };
const checkIf = (descriptor, domain, setting, itemName) => {
    const settings = getSettings(descriptor, domain);
    const settingsFor = settings && get(settings, setting);
    return is_1.isArray(settingsFor) && settingsFor.indexOf(itemName) >= 0;
};
const isForbidden = (descriptor, domain, itemName) => {
    const settings = getSettings(descriptor, domain);
    if (!settings) {
        return false;
    }
    return settings[CollisionSettingKey.ForbidAll]
        ? !checkIf(descriptor, domain, CollisionSettingKey.Allow, itemName)
        : checkIf(descriptor, domain, CollisionSettingKey.Forbid, itemName);
};
const isAggregateMapSync = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.MapSync, itemName);
const isAggregateReduceSync = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.ReduceSync, itemName);
const isAggregateReduceThisSync = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.ReduceThisSync, itemName);
const isAggregateMapAsync = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.MapAsync, itemName);
const isAggregateReduceAsync = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.ReduceAsync, itemName);
const isAggregateReduceThisAsync = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.ReduceThisAsync, itemName);
const aggregateCheckers = [
    isAggregateMapSync,
    isAggregateReduceSync,
    isAggregateReduceThisSync,
    isAggregateMapAsync,
    isAggregateReduceAsync,
    isAggregateReduceThisAsync,
];
const isAggregate = (descriptor, domain, itemName) => aggregateCheckers.reduce((o, fn) => o || fn(descriptor, domain, itemName), false);
const aggregationType = (descriptor, domain, itemName) => aggregateCheckers.reduce((o, fn, i) => {
    return fn(descriptor, domain, itemName) ? i + 1 : o;
}, SettingIndex.None);
const makeAggregatedProxyFunction = (descriptor, domain, functions, itemName) => {
    const type = aggregationType(descriptor, domain, itemName);
    switch (type) {
        case SettingIndex.MapSync:
            return makeMapSyncProxyFunction({ functions, itemName });
        case SettingIndex.ReduceSync:
            return makeReduceSyncProxyFunction({ functions, itemName });
        case SettingIndex.ReduceThisSync:
            return makeReduceThisSyncProxyFunction({ functions, itemName });
        case SettingIndex.MapAsync:
            return makeMapAsyncProxyFunction({ functions, itemName });
        case SettingIndex.ReduceAsync:
            return makeReduceAsyncProxyFunction({ functions, itemName });
        case SettingIndex.ReduceThisAsync:
            return makeReduceThisAsyncProxyFunction({ functions, itemName });
        default:
            return undefined;
    }
};
const setDomainMetadata = (opts, domain, domainMetadata) => {
    if (is_1.isObject(domainMetadata) && !is_1.isArray(domainMetadata)) {
        const target = get(opts.stamp.compose, domain);
        const setDomainMetadataCallback = (key) => {
            const metadata = get(domainMetadata, key);
            const value = 
            // eslint-disable-next-line no-nested-ternary
            is_1.isArray(metadata)
                ? metadata.length === 1
                    ? // Some collisions aggregated to a single method
                        // Mutating the resulting stamp
                        metadata[0]
                    : makeAggregatedProxyFunction(opts.stamp.compose, domain, metadata, key)
                : metadata;
            set(target, key, value);
        };
        Object.getOwnPropertyNames(domainMetadata).forEach(setDomainMetadataCallback);
    }
    else if (is_1.isArray(domainMetadata)) {
        const settings = getSettings(opts.stamp.compose, domain);
        const metadata = [...domainMetadata];
        const value = settings.async
            ? [makeReduceThisAsyncProxyFunction({ functions: metadata, itemName: 'reduceThisAsyncInits' })]
            : metadata;
        set(opts.stamp.compose, domain, value);
    }
};
const removeDuplicates = (settings) => {
    Object.values(CollisionSettingKey)
        .filter((key) => is_1.isArray(settings[key]))
        .forEach((key) => {
        set(settings, key, dedupe(settings[key]));
    });
};
const throwIfAmbiguous = (settings) => {
    if (is_1.isArray(settings[CollisionSettingKey.Forbid])) {
        const intersectMapSync = (value) => settings[CollisionSettingKey.MapSync].indexOf(value) >= 0;
        AggregateSettingKeys.slice(1).forEach((key) => {
            const intersected = is_1.isArray(settings[key]) ? settings[key].filter(intersectMapSync) : [];
            if (intersected.length > 0) {
                throw new Error(`Ambiguous Collision settings. [${intersected.join(', ')}] both map and ${key}`);
            }
        });
        const intersectForbidden = (value) => (settings[CollisionSettingKey.Forbid] || []).indexOf(value) >= 0;
        AggregateSettingKeys.forEach((key) => {
            const intersected = is_1.isArray(settings[key]) ? settings[key].filter(intersectForbidden) : [];
            if (intersected.length > 0) {
                throw new Error(`Ambiguous Collision settings. [${intersected.join(', ')}] both ${key} and forbidden`);
            }
        });
        const allowedAndForbidden = is_1.isArray(settings.allow) ? settings.allow.filter(intersectForbidden) : [];
        if (allowedAndForbidden.length > 0) {
            throw new Error(`Ambiguous Collision settings. [${allowedAndForbidden.join(', ')}] both allowed and forbidden`);
        }
    }
};
const throwIfForbiddenOrAmbiguous = (existingMetadata, descriptor, composable, domain, itemName) => {
    // Process Forbid
    if (existingMetadata && isForbidden(descriptor, domain, itemName)) {
        throw new Error(`Collision of \`${String(itemName)}\` ${domain.slice(0, -1)} is forbidden`);
    }
    // Process Aggregate
    if (isAggregate(descriptor, domain, itemName)) {
        if (existingMetadata && !is_1.isArray(existingMetadata)) {
            throw new Error(`Ambiguous Collision settings. The \`${String(itemName)}\` ${domain.slice(0, -1)} is both aggregated and regular`);
        }
    }
    else if (is_1.isArray(existingMetadata)) {
        // TODO: update error message below
        throw new Error(`Ambiguous Collision settings. The \`${String(itemName)}\` ${domain.slice(0, -1)} is both aggregated and regular`);
    }
};
function collisionComposer(opts) {
    const descriptor = opts.stamp.compose;
    const allSettings = getAllSettings(descriptor);
    if (!is_1.isObject(allSettings)) {
        return;
    }
    Object.getOwnPropertyNames(allSettings).forEach((domain) => {
        const settings = getSettings(descriptor, domain);
        if (is_1.isObject(settings) && settings !== undefined) {
            // Deduping is an important part of the logic
            removeDuplicates(settings);
            // Make sure settings are not ambiguous
            throwIfAmbiguous(settings);
            if (settings !== undefined) {
                if (domain !== 'initializers' &&
                    (settings.forbidAll ||
                        AggregateSettingKeys.reduce((o, key) => o || (is_1.isArray(settings[key]) && settings[key].length > 0), false) ||
                        (is_1.isArray(settings.forbid) && settings.forbid.length > 0))) {
                    const domainMetadata = {}; // methods aggregation
                    const getCallbackFor = (composable) => (itemName) => {
                        const domainItem = getDomainItem(composable, domain, itemName);
                        const existingMetadata = get(domainMetadata, itemName);
                        throwIfForbiddenOrAmbiguous(existingMetadata, descriptor, composable, domain, itemName);
                        let value = domainItem;
                        // Process Collision.*.(map|reduce)
                        let arr;
                        if (isAggregate(descriptor, domain, itemName)) {
                            arr = existingMetadata || [];
                        }
                        if (arr) {
                            if (isAggregateDomainItem(domainItem)) {
                                arr = arr.concat(getDomainItemAggregates(domainItem));
                            }
                            else {
                                arr.push(domainItem);
                            }
                            value = arr;
                        }
                        set(domainMetadata, itemName, value);
                    };
                    opts.composables
                        .map((composable) => (is_1.isStamp(composable) ? composable.compose : composable))
                        .filter((composable) => is_1.isObject(get(composable, domain)))
                        .forEach((composable) => {
                        const domainItems = getDomainItems(composable, domain);
                        const setMethodCallback = getCallbackFor(composable);
                        Object.getOwnPropertyNames(domainItems)
                            .filter((itemName) => {
                            const item = get(domainItems, itemName);
                            const existingMetadata = get(domainMetadata, itemName);
                            // Checking by reference if the method is already present
                            return (item !== undefined &&
                                (existingMetadata === undefined ||
                                    (existingMetadata !== item &&
                                        (!is_1.isArray(existingMetadata) || existingMetadata.indexOf(item) === -1))));
                        })
                            .forEach(setMethodCallback);
                    });
                    setDomainMetadata(opts, domain, domainMetadata);
                }
                else if (domain === 'initializers') {
                    let domainMetadata = [];
                    opts.composables
                        .map((composable) => (is_1.isStamp(composable) ? composable.compose : composable))
                        .map((composable) => (is_1.isArray(get(composable, domain)) ? get(composable, domain) : []))
                        .forEach((initializers) => {
                        initializers.forEach((domainItem) => {
                            if (isAggregateDomainItem(domainItem)) {
                                domainMetadata = domainMetadata.concat(getDomainItemAggregates(domainItem));
                            }
                            else {
                                domainMetadata.push(domainItem);
                            }
                        });
                    });
                    if (domainMetadata.length) {
                        setDomainMetadata(opts, domain, domainMetadata);
                    }
                }
            }
        }
    });
}
function prepareSettings(opts) {
    if (!opts) {
        return null;
    }
    const { defer = [] } = (opts || {});
    const defaultMethodsSettings = {
        map: [],
        reduce: [],
        reduceThis: [],
        mapAsync: [],
        reduceAsync: [],
        reduceThisAsync: [],
        allow: [],
        forbid: [],
        forbidAll: false,
    };
    const defaultInitializersSettings = {};
    const settings = {
        methods: core_1.merge(Object.assign({}, defaultMethodsSettings), { map: defer }, opts.methods),
        initializers: core_1.merge(Object.assign({}, defaultInitializersSettings), opts.initializers),
    };
    return settings;
}
/**
 * TODO
 */
const Collision = compose_1.default({
    deepConfiguration: { Collision: {} },
    staticProperties: {
        collisionSetup(opts) {
            var _a;
            return (((_a = this) === null || _a === void 0 ? void 0 : _a.compose) ? this : Collision).compose({
                deepConfiguration: { Collision: prepareSettings(opts) },
            });
        },
        collisionSettingsReset() {
            const settings = getSettings(this.compose, 'initializers');
            // Resetting asynchronous initializers will break everything.
            // Workaround: Use a composer
            if (settings.async) {
                throw new Error('An attempt was made to reset collision settings when the stamp has asynchronous initializers enabled. Use a composer to reset collision settings and properly handle these initializers.');
            }
            return this.collisionSetup(null);
        },
        collisionProtectAnyMethod(opts) {
            return this.collisionSetup(core_1.merge({}, opts, { methods: { forbidAll: true } }));
        },
        collisionHasAggregates(domain, itemName) {
            validateDomainAndItemName(domain, itemName);
            return this.collisionGetAggregates.call(this, domain, itemName) !== undefined;
        },
        collisionGetAggregates(domain, itemName) {
            validateDomainAndItemName(domain, itemName);
            const targetDomain = get(this.compose, domain);
            if (!targetDomain) {
                return undefined;
            }
            const target = is_1.isArray(targetDomain) ? targetDomain[0] : get(targetDomain, itemName);
            if (!target) {
                return undefined;
            }
            return is_1.isArray(target[AGGREGATION_PROPERTY_NAME]) && target[AGGREGATION_PROPERTY_NAME].length > 0
                ? [...target[AGGREGATION_PROPERTY_NAME]]
                : undefined;
        },
        collisionSetAggregates(aggregates, domain, itemName) {
            validateDomainAndItemName(domain, itemName);
            const settings = getSettings(this.compose, domain);
            if (!settings) {
                throw new Error(`Stamp has no collision settings for domain "${domain}"`);
            }
            if (itemName && !isAggregate(this.compose, domain, itemName)) {
                throw new Error(`Stamp has no collision settings for ${domain} item with name ${itemName}`);
            }
            const targetDomain = get(this.compose, domain);
            if (!targetDomain) {
                throw new Error('Domain does not exist');
            }
            const domainItem = is_1.isArray(targetDomain) ? targetDomain[0] : get(targetDomain, itemName);
            const currentAggregates = getDomainItemAggregates(domainItem);
            const isSubset = aggregates.filter((a) => !currentAggregates.includes(a)).length === 0;
            if (!isSubset) {
                throw new Error(`New aggregates for ${domain} must be a subset of existing aggregates`);
            }
            if (isAggregateDomainItem(domainItem)) {
                setDomainItemAggregates(domainItem, aggregates);
            }
        },
    },
    composers: [collisionComposer],
});
exports.default = Collision;
// For CommonJS default export support
module.exports = Collision;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Collision });
