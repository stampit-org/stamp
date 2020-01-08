import { compose } from '@stamp/compose';
import { EventEmitter } from 'events';

interface ListenerCount {
  (emitter: EventEmitter, event: string): number;
}

const listenerCount: ListenerCount = (emitter, event) => emitter.listenerCount(event);

/**
 * TODO
 */
export const EventEmittable = compose({
  staticProperties: {
    defaultMaxListeners: EventEmitter.defaultMaxListeners,
    listenerCount,
  },
  methods: EventEmitter.prototype,
});

export default EventEmittable;
