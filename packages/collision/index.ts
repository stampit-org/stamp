/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
import compose, { ComposeProperty, Composer, ComposerParams, Descriptor, Initializer, PropertyMap, Stamp } from '@stamp/compose'
import { merge } from '@stamp/core'
import { isArray, isObject, isStamp } from '@stamp/is'

const { defineProperty, get, set } = Reflect

const dedupe = <T>(array: T[]): T[] => [...new Set(array)]

const AGGREGATION_PROPERTY_NAME = '_aggregated'

export interface CollisionDescriptor extends Descriptor {
  deepConfiguration?: PropertyMap & { Collision: CollisionSettings }
}

export interface CollisionStamp extends Stamp {
  collisionSetup(this: CollisionStamp | undefined | void, opts: CollisionSettings | null | undefined): CollisionStamp
  collisionSettingsReset(this: CollisionStamp | undefined | void): CollisionStamp
  collisionProtectAnyMethod(this: CollisionStamp | undefined | void, opts?: CollisionSettings): CollisionStamp
  compose: ComposeProperty & CollisionDescriptor
}

interface CollisionComposerParams extends ComposerParams {
  stamp: CollisionStamp
}

enum CollisionSettingKey {
  Allow = 'allow',
  MapSync = 'map',
  ReduceSync = 'reduce',
  ReduceThisSync = 'reduceThis',
  MapAsync = 'mapAsync',
  ReduceAsync = 'reduceAsync',
  ReduceThisAsync = 'reduceThisAsync',
  Forbid = 'forbid',
  ForbidAll = 'forbidAll',
}

const AggregateSettingKeys: string[] = [
  CollisionSettingKey.MapSync,
  CollisionSettingKey.ReduceSync,
  CollisionSettingKey.ReduceThisSync,
  CollisionSettingKey.MapAsync,
  CollisionSettingKey.ReduceAsync,
  CollisionSettingKey.ReduceThisAsync,
]

enum SettingIndex {
  None,
  MapSync,
  ReduceSync,
  ReduceThisSync,
  MapAsync,
  ReduceAsync,
  ReduceThisAsync,
}

interface CollisionSettingsCommon {
  allow?: string[]
  reduce?: string[]
  reduceThis?: string[]
  mapAsync?: string[]
  reduceAsync?: string[]
  reduceThisAsync?: string[]
  forbid?: string[]
  forbidAll?: boolean
  [key: string]: string[] | boolean | undefined
}

interface CollisionSettingsMethods extends CollisionSettingsCommon {
  map?: string[]
}

interface CollisionSettingsInitializers {
  async?: boolean
  [key: string]: boolean | undefined
}

type CollisionSettingsVariant = CollisionSettingsInitializers | CollisionSettingsMethods

interface CollisionSettings {
  methods?: CollisionSettingsMethods
  initializers?: CollisionSettingsInitializers
  [key: string]: CollisionSettingsMethods | CollisionSettingsInitializers | undefined
}

interface DeprecatedCollisionSettings {
  defer?: string[] // deprecated
  [key: string]: string[] | undefined
}

interface HasAggregatedFunctions {
  [AGGREGATION_PROPERTY_NAME]?: Function[]
}

export interface ReducerFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (accumulator: any, currentValue: any, index: number, array: any[]): any
}

export interface ThisReducerFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (this: any): any
}

export interface ReducerAsyncFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (accumulator: any, currentValue: any, index: number, array: any[]): Promise<any>
}

export interface ThisReducerAsyncFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (this: any): Promise<any>
}

interface MakeProxyFunctionOptions {
  functions: Function[],
  itemName: string,
}

interface MapSyncProxyFunction extends HasAggregatedFunctions {
  (this: object, ...args: unknown[]): unknown[]
}

interface ReduceSyncProxyFunction extends HasAggregatedFunctions {
  (this: object, initialValue: unknown, ...args: unknown[]): unknown
}

interface MapAsyncProxyFunction extends HasAggregatedFunctions {
  (this: object, ...args: unknown[]): Promise<unknown[]>
}

interface ReduceAsyncProxyFunction extends HasAggregatedFunctions {
  (this: object, initialValue: unknown, ...args: unknown[]): Promise<unknown>
}

function prepareProxyFunction<T extends Function>(functions: Function[], itemName: string, proxyFn: T): T {
  defineProperty(proxyFn, 'name', { value: itemName, configurable: true })
  defineProperty(proxyFn, AGGREGATION_PROPERTY_NAME, { value: functions, configurable: true })
  return proxyFn
}

function makeMapSyncProxyFunction({functions, itemName}: MakeProxyFunctionOptions): MapSyncProxyFunction {
  return prepareProxyFunction(
    functions,
    itemName,
    function mapSyncFn(this: object, ...args: unknown[]): unknown[] {
      const fns = (get(mapSyncFn as HasAggregatedFunctions, AGGREGATION_PROPERTY_NAME) || []) as Function[]
      return [...fns.map(fn => fn.apply(this, [...args]))]
    }
  );
}

function makeReduceSyncProxyFunction({functions, itemName}: MakeProxyFunctionOptions): ReduceSyncProxyFunction {
  return prepareProxyFunction(
    functions,
    itemName,
    function reduceSyncFn(initialValue: unknown, ...args: unknown[]): unknown {
      const fns = (get(reduceSyncFn as HasAggregatedFunctions, AGGREGATION_PROPERTY_NAME) || []) as Function[]
      return fns.reduce((o, fn) => {
        return fn(o, ...args)
      }, initialValue)
    }
  );
}

function makeReduceThisSyncProxyFunction({functions, itemName}: MakeProxyFunctionOptions): ReduceSyncProxyFunction {
  return prepareProxyFunction(
    functions,
    itemName,
    function reduceThisSyncFn(this: object, ...args: unknown[]): unknown {
      const fns = (get(reduceThisSyncFn as HasAggregatedFunctions, AGGREGATION_PROPERTY_NAME) || []) as Function[]
      return fns.reduce((o, fn) => {
        const result = fn.apply(o, args)
        return result || this
      }, this)
    }
  );
}

function makeMapAsyncProxyFunction({functions, itemName}: MakeProxyFunctionOptions): MapAsyncProxyFunction {
  return prepareProxyFunction(
    functions,
    itemName,
    async function mapAsyncFn(this: object, ...args: unknown[]): Promise<unknown[]> {
      const fns = (get(mapAsyncFn as HasAggregatedFunctions, AGGREGATION_PROPERTY_NAME) || []) as Function[]
      return Promise.all(fns.map(fn => fn.apply(this, args)))
    }
  )
}

function makeReduceAsyncProxyFunction({functions, itemName}: MakeProxyFunctionOptions): ReduceAsyncProxyFunction {
  return prepareProxyFunction(
    functions,
    itemName,
    async function reduceAsyncFn(initialValue: unknown, ...args: unknown[]): Promise<unknown> {
      const fns = (get(reduceAsyncFn as HasAggregatedFunctions, AGGREGATION_PROPERTY_NAME) || []) as Function[]
      return fns.reduce((promise, fn) => {
        return fn(promise, ...args)
      }, Promise.resolve(initialValue))
    }
  );
}

function makeReduceThisAsyncProxyFunction({functions, itemName}: MakeProxyFunctionOptions): ReduceAsyncProxyFunction {
  return prepareProxyFunction(
    functions,
    itemName,
    async function reduceAsyncFn(this: object, ...args: unknown[]): Promise<unknown> {
      const fns = (get(reduceAsyncFn as HasAggregatedFunctions, AGGREGATION_PROPERTY_NAME) || []) as Function[]
      return fns.reduce((promise, fn) => {
        return promise.then(result => {
          return Promise.resolve(fn.apply(result || this, args))
            .then(nextResult => {
              return nextResult || this
            })
        })
      }, Promise.resolve(this || this))
    }
  )
}

interface GetAllSettings {
  (descriptor: CollisionDescriptor): CollisionSettings | undefined
}
const getAllSettings: GetAllSettings = (descriptor) => descriptor?.deepConfiguration?.Collision

interface GetSettings {
  (descriptor: CollisionDescriptor, domain: string): CollisionSettingsVariant | undefined
}
const getSettings: GetSettings = (descriptor, domain) => descriptor?.deepConfiguration?.Collision ? descriptor.deepConfiguration.Collision[domain] : undefined

interface CheckIf {
  (descriptor: CollisionDescriptor, domain: string, setting: string, itemName: string): boolean
}
const checkIf: CheckIf = (descriptor, domain, setting, itemName: string) => {
  const settings = getSettings(descriptor, domain)
  const settingsFor = settings && get(settings, setting)
  return isArray(settingsFor) && settingsFor.indexOf(itemName) >= 0
}

interface IsForbidden {
  (descriptor: CollisionDescriptor, domain: string, itemName: string): boolean
}
const isForbidden: IsForbidden = (descriptor, domain, itemName) => {
  const settings = getSettings(descriptor, domain)
  if (!settings) {
    return false
  }
  return settings[CollisionSettingKey.ForbidAll]
    ? !checkIf(descriptor, domain, CollisionSettingKey.Allow, itemName)
    : checkIf(descriptor, domain, CollisionSettingKey.Forbid, itemName)
}

interface IsAggregate {
  (descriptor: CollisionDescriptor, domain: string, itemName: string): boolean
}

const isAggregateMapSync: IsAggregate = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.MapSync, itemName)
const isAggregateReduceSync: IsAggregate = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.ReduceSync, itemName)
const isAggregateReduceThisSync: IsAggregate = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.ReduceThisSync, itemName)
const isAggregateMapAsync: IsAggregate = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.MapAsync, itemName)
const isAggregateReduceAsync: IsAggregate = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.ReduceAsync, itemName)
const isAggregateReduceThisAsync: IsAggregate = (descriptor, domain, itemName) => checkIf(descriptor, domain, CollisionSettingKey.ReduceThisAsync, itemName)
const aggregateCheckers: IsAggregate[] = [isAggregateMapSync, isAggregateReduceSync, isAggregateReduceThisSync, isAggregateMapAsync, isAggregateReduceAsync, isAggregateReduceThisAsync]
const isAggregate: IsAggregate = (descriptor, domain, itemName) => aggregateCheckers.reduce<boolean>((o, fn) => o || fn(descriptor, domain, itemName), false)

interface GetSettingIndex {
  (descriptor: CollisionDescriptor, domain: string, itemName: string): number
}

const aggregationType: GetSettingIndex = (descriptor, domain, itemName) => aggregateCheckers.reduce((o, fn, i) => {
  return fn(descriptor, domain, itemName) ? i + 1 : o
}, SettingIndex.None)

interface MakeAggregateProxyFunction {
  (descriptor: CollisionDescriptor, domain: string, functions: Function[], itemName: string): MapSyncProxyFunction | ReduceSyncProxyFunction | MapAsyncProxyFunction | ReduceAsyncProxyFunction | undefined
}

const makeAggregatedProxyFunction: MakeAggregateProxyFunction = (descriptor, domain, functions, itemName) => {
  const type = aggregationType(descriptor, domain, itemName)

  switch (type) {
    case SettingIndex.MapSync:
      return makeMapSyncProxyFunction({ functions, itemName })
    case SettingIndex.ReduceSync:
      return makeReduceSyncProxyFunction({ functions, itemName })
    case SettingIndex.ReduceThisSync:
      return makeReduceThisSyncProxyFunction({ functions, itemName })
    case SettingIndex.MapAsync:
      return makeMapAsyncProxyFunction({ functions, itemName })
    case SettingIndex.ReduceAsync:
      return makeReduceAsyncProxyFunction({ functions, itemName })
    case SettingIndex.ReduceThisAsync:
      return makeReduceThisAsyncProxyFunction({ functions, itemName })
    default:
      return undefined
  }
}

interface SetDomainMetadata {
  (opts: CollisionComposerParams, domain: string, domainMetadata: PropertyMap | Function[]): void
}
const setDomainMetadata: SetDomainMetadata = (opts, domain, domainMetadata) => {  
  if (isObject(domainMetadata) && !isArray(domainMetadata)) {
    const target = get(opts.stamp.compose as Required<Descriptor>, domain)

    const setDomainMetadataCallback = (key: string): void => {
      const metadata = get(domainMetadata, key)
      const value =
        // eslint-disable-next-line no-nested-ternary
        isArray(metadata)
          ? metadata.length === 1
            ? // Some collisions aggregated to a single method
            // Mutating the resulting stamp
            metadata[0]
            : makeAggregatedProxyFunction(opts.stamp.compose, domain, metadata, key)
          : metadata

      set(target, key, value)
    }

    Object.getOwnPropertyNames(domainMetadata).forEach(setDomainMetadataCallback)
  }
  else if (isArray(domainMetadata)) {
    const settings = getSettings(opts.stamp.compose, domain) as CollisionSettingsInitializers
    const key = settings.async ? 'reduceThisAsyncInits' : 'reduceThisSyncInits'
    const metadata = [...domainMetadata]
    const value =
      // eslint-disable-next-line no-nested-ternary
      metadata.length > 1
        ? settings.async
          ? [makeReduceThisAsyncProxyFunction({ functions: metadata, itemName: key })]
          : [makeReduceThisSyncProxyFunction({ functions: metadata, itemName: key })]
        : metadata

    set(opts.stamp.compose, domain, value)
  }
}

interface RemoveDuplicates {
  (settings: CollisionSettingsVariant): void
}
const removeDuplicates: RemoveDuplicates = (settings) => {
  Object.values(CollisionSettingKey)
    .filter(key => isArray(settings[key]))
    .forEach(key => {
      set(settings, key, dedupe(settings[key] as string[]))
    })
}

interface ThrowIfAmbiguous {
  (settings: CollisionSettingsVariant): void
}

const throwIfAmbiguous: ThrowIfAmbiguous = (settings) => {
  if (isArray(settings[CollisionSettingKey.Forbid])) {
    const intersectMapSync = (value: string): boolean => (settings[CollisionSettingKey.MapSync] as string[]).indexOf(value) >= 0

    AggregateSettingKeys.slice(1).forEach(key => {
      const intersected = isArray(settings[key]) ? (settings[key] as string[]).filter(intersectMapSync) : []
      if (intersected.length > 0) {
        throw new Error(`Ambiguous Collision settings. [${intersected.join(', ')}] both map and ${key}`)
      }
    })

    const intersectForbidden = (value: string): boolean => (settings[CollisionSettingKey.Forbid] as string[] || []).indexOf(value) >= 0
    AggregateSettingKeys.forEach(key => {
      const intersected = isArray(settings[key]) ? (settings[key] as string[]).filter(intersectForbidden) : []
      if (intersected.length > 0) {
        throw new Error(`Ambiguous Collision settings. [${intersected.join(', ')}] both ${key} and forbidden`)
      }
    })

    const allowedAndForbidden = isArray(settings.allow) ? settings.allow.filter(intersectForbidden) : []
    if (allowedAndForbidden.length > 0) {
      throw new Error(`Ambiguous Collision settings. [${allowedAndForbidden.join(', ')}] both allowed and forbidden`)
    }
  }
}

interface ThrowIfForbiddenOrAmbiguous {
  (
    existingMetadata: unknown[],
    descriptor: CollisionDescriptor,
    composable: Required<CollisionDescriptor>,
    domain: string,
    itemName: string
  ): void
}

const throwIfForbiddenOrAmbiguous: ThrowIfForbiddenOrAmbiguous = (
  existingMetadata,
  descriptor,
  composable,
  domain,
  itemName
) => {
  // Process Forbid
  if (existingMetadata && isForbidden(descriptor, domain, itemName)) {
    throw new Error(`Collision of \`${String(itemName)}\` ${domain.slice(0, -1)} is forbidden`)
  }

  // Process Aggregate
  if (isAggregate(descriptor, domain, itemName)) {
    if (existingMetadata && !isArray(existingMetadata)) {
      throw new Error(`Ambiguous Collision settings. The \`${String(itemName)}\` ${domain.slice(0, -1)} is both aggregated and regular`)
    }
  }
  else if (isArray(existingMetadata)) {
    // TODO: update error message below
    throw new Error(`Ambiguous Collision settings. The \`${String(itemName)}\` ${domain.slice(0, -1)} is both aggregated and regular`)
  }
}

const composer: Composer = (opts) => {
  const descriptor = opts.stamp.compose as CollisionDescriptor
  const allSettings = getAllSettings(descriptor)

  if (!isObject(allSettings)) {
    return
  }

  Object.getOwnPropertyNames(allSettings)
    .forEach(domain => {
      const settings = getSettings(descriptor, domain)
      if (isObject(settings) && settings !== undefined) {
        // Deduping is an important part of the logic
        removeDuplicates(settings)

        // Make sure settings are not ambiguous
        throwIfAmbiguous(settings)

        if (settings !== undefined) {
          if (
              domain !== 'initializers' &&
              (
                settings.forbidAll ||
                AggregateSettingKeys.reduce<boolean>((o, key) => o || isArray(settings[key]) && (settings[key] as string[]).length > 0, false) ||
                (isArray(settings.forbid) && settings.forbid.length > 0)
              )
          ) {
            const domainMetadata: PropertyMap = {}; // methods aggregation

            const getCallbackFor = (composable: Required<CollisionDescriptor>) => (itemName: string): void => {
              const domainItem = get(composable[domain] as object, itemName)
              const existingMetadata = get(domainMetadata, itemName)

              throwIfForbiddenOrAmbiguous(existingMetadata, descriptor, composable, domain, itemName)

              let value = domainItem

              // Process Collision.*.(map|reduce)
              let arr
              if (isAggregate(descriptor, domain, itemName)) {
                arr = existingMetadata || []
              }

              if (arr) {
                if(AGGREGATION_PROPERTY_NAME in domainItem) {
                  arr = arr.concat(domainItem[AGGREGATION_PROPERTY_NAME])
                }
                else {
                  arr.push(domainItem)
                }
                value = arr
              }

              set(domainMetadata, itemName, value)
            }

            opts.composables
              .map((composable) => (isStamp<Stamp>(composable) ? composable.compose : composable))
              .filter((composable) => isObject(get(composable, domain)))
              .forEach((composable) => {
                const domainItems = (composable as Required<Descriptor>)[domain] as PropertyMap
                const setMethodCallback = getCallbackFor(composable as Required<CollisionDescriptor>)
                Object.getOwnPropertyNames(domainItems)
                  .filter((itemName) => {
                    const item = get(domainItems, itemName)
                    const existingMetadata = get(domainMetadata, itemName)
                    // Checking by reference if the method is already present
                    return (
                      item !== undefined &&
                      (existingMetadata === undefined ||
                        (existingMetadata !== item &&
                          (!isArray(existingMetadata) || existingMetadata.indexOf(item) === -1)))
                    )
                  })
                  .forEach(setMethodCallback)
              })

            setDomainMetadata(opts as CollisionComposerParams, domain, domainMetadata)
          }
          else if (domain === 'initializers') {
            const domainMetadata: Initializer[] = [];

            opts.composables
              .map(composable => (isStamp<Stamp>(composable) ? composable.compose : composable))
              .map(composable => (isArray(get(composable, domain)) ? get(composable, domain): []) as Initializer[])
              .forEach(initializers => {
                initializers.forEach(method => method && domainMetadata.push(method))
              })

            if (domainMetadata.length) {
              setDomainMetadata(opts as CollisionComposerParams, domain, domainMetadata)
            }
          }
        }
      }
    })
}

function prepareSettings(opts: CollisionSettings | DeprecatedCollisionSettings): CollisionSettings {
  if (!opts) {
    return opts
  }
  const { defer = [] } = (opts || {}) as DeprecatedCollisionSettings
  const defaultMethodsSettings = { map: [], reduce: [], reduceThis: [], mapAsync: [], reduceAsync: [], reduceThisAsync: [], allow: [], forbid: [], forbidAll: false }
  const defaultInitializersSettings = {}
  const settings: CollisionSettings = {
    methods: merge({...defaultMethodsSettings}, { map: defer }, opts.methods),
    initializers: merge({...defaultInitializersSettings}, opts.initializers),
  }

  return settings
}

/**
 * TODO
 */
const Collision = compose({
  deepConfiguration: { Collision: { } },
  staticProperties: {
    collisionSetup(this: Stamp | undefined, opts: CollisionSettings | DeprecatedCollisionSettings): CollisionStamp {
      return (this?.compose ? this : Collision).compose({
        deepConfiguration: { Collision: prepareSettings(opts) },
      }) as CollisionStamp
    },
    collisionSettingsReset(this: CollisionStamp): CollisionStamp {
      const settings = getSettings(this.compose, 'initializers') as CollisionSettingsInitializers

      // Resetting asynchronous initializers will break everything.
      // Workaround: Use a composer
      if (settings.async) {
        throw new Error('An attempt was made to reset collision settings when the stamp has asynchronous initializers enabled. Use a composer to reset collision settings and properly handle these initializers.')
      }

      return this.collisionSetup(null)
    },
    collisionProtectAnyMethod(this: CollisionStamp, opts: CollisionSettings): CollisionStamp {
      return this.collisionSetup(merge({}, opts, { methods: { forbidAll: true } }) as CollisionSettings)
    },
  },
  composers: [composer],
}) as CollisionStamp

export default Collision

// For CommonJS default export support
module.exports = Collision;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: Collision });
