import { ComposeProperty, Descriptor, PropertyMap, Stamp } from '@stamp/compose';
export interface CollisionDescriptor extends Descriptor {
    deepConfiguration?: PropertyMap & {
        Collision: CollisionSettings;
    };
}
export interface CollisionStamp extends Stamp {
    collisionSetup(this: CollisionStamp | undefined | void, opts: CollisionSettings | null | undefined): CollisionStamp;
    collisionSettingsReset(this: CollisionStamp | undefined | void): CollisionStamp;
    collisionProtectAnyMethod(this: CollisionStamp | undefined | void, opts?: CollisionSettings): CollisionStamp;
    hasAggregates(this: CollisionStamp, domain: string, itemName?: string): boolean;
    getAggregates(this: CollisionStamp, domain: string, itemName?: string): Function[] | undefined;
    setAggregates(this: CollisionStamp, aggregates: Function[], domain: string, itemName?: string): void;
    compose: ComposeProperty & CollisionDescriptor;
}
interface CollisionSettingsCommon {
    allow?: string[];
    reduce?: string[];
    reduceThis?: string[];
    mapAsync?: string[];
    reduceAsync?: string[];
    reduceThisAsync?: string[];
    forbid?: string[];
    forbidAll?: boolean;
    [key: string]: string[] | boolean | undefined;
}
interface CollisionSettingsMethods extends CollisionSettingsCommon {
    map?: string[];
}
interface CollisionSettingsInitializers {
    async?: boolean;
    [key: string]: boolean | undefined;
}
interface CollisionSettings {
    methods?: CollisionSettingsMethods;
    initializers?: CollisionSettingsInitializers;
    [key: string]: CollisionSettingsMethods | CollisionSettingsInitializers | undefined;
}
export interface ReducerFunction {
    (accumulator: any, currentValue: any, index: number, array: any[]): any;
}
export interface ThisReducerFunction {
    (this: any): any;
}
export interface ReducerAsyncFunction {
    (accumulator: any, currentValue: any, index: number, array: any[]): Promise<any>;
}
export interface ThisReducerAsyncFunction {
    (this: any): Promise<any>;
}
/**
 * TODO
 */
declare const Collision: CollisionStamp;
export default Collision;
