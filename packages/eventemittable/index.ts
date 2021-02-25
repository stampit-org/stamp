import compose from '@stamp/compose';
import { EventEmitter } from 'events';

import type { PropertyMap, Stamp } from '@stamp/compose';

/**
 * A Stamp with the EventEmitter behavior
 */
// TODO: EventEmitterStamp should support generics like <ObjectInstance, OriginalStamp>
export interface EventEmitterStamp extends Omit<EventEmitter, 'listenerCount'>, Stamp {
  /**
   * Returns the number of listeners listening to the event named eventName
   */
  listenerCount: typeof listenerCount;
}

/** @internal */
// ??? why emitter and not `this`
const listenerCount = (emitter: EventEmitter, event: string): number => emitter.listenerCount(event);

/**
 * Node.js' EventEmitter as a stamp
 */
// TODO: EventEmittable should support generics like <ObjectInstance, OriginalStamp>
const EventEmittable: EventEmitterStamp = compose({
  staticProperties: {
    defaultMaxListeners: EventEmitter.defaultMaxListeners,
    listenerCount,
  },
  methods: (EventEmitter.prototype as unknown) as PropertyMap,
}) as EventEmitterStamp;

export default EventEmittable;

// For CommonJS default export support
module.exports = EventEmittable;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: EventEmittable });
