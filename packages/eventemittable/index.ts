import compose from '@stamp/compose';
import { EventEmitter } from 'events';

import type { PropertyMap } from '@stamp/compose';

type ListenerCount = (emitter: EventEmitter, event: string) => number;

const listenerCount: ListenerCount = (emitter, event) => emitter.listenerCount(event);

/**
 * TODO
 */
const EventEmittable = compose({
  staticProperties: {
    defaultMaxListeners: EventEmitter.defaultMaxListeners,
    listenerCount,
  },
  methods: (EventEmitter.prototype as unknown) as PropertyMap,
});

export default EventEmittable;

// For CommonJS default export support
module.exports = EventEmittable;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: EventEmittable });
