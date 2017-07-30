var compose = require('@stamp/compose');
var EventEmittable = require('..');

describe('EventEmittable', function () {
  describe('composition', function () {
    it('should allow composition', function () {
      var MyStamp = compose({
        methods: {
          foo: function () {
            this.emit('foo');
          }
        }
      })
        .compose(EventEmittable);

      var objectInstance = MyStamp();
      var listener = jest.fn();
      objectInstance.on('foo', listener);
      objectInstance.foo();
      expect(listener.mock.calls.length).toBe(1);
    });

    it('should not overwrite collided methods', function () {
      var on = jest.fn();
      var off = jest.fn();
      var MyStamp = compose(EventEmittable, {
        methods: {on: on, off: off}
      });

      expect(MyStamp().on).toBe(on);
      expect(MyStamp().off).toBe(off);
    });

    it('should have static properties of `events` class', function () {
      expect(typeof EventEmittable.defaultMaxListeners).toBe('number');
      expect(typeof EventEmittable.listenerCount).toBe('function');
    });
  });

  describe('members', function () {
    describe('once()', function () {
      it('should call listener once', function () {
        var ee = EventEmittable();
        var listener = jest.fn();
        ee.once('foo', listener);
        ee.emit('foo');
        ee.emit('foo');
        expect(listener.mock.calls.length).toBe(1);
      });
    });

    describe('on()', function () {
      it('should call listener', function () {
        var ee = EventEmittable();
        var listener = jest.fn();
        ee.on('foo', listener);
        ee.emit('foo');
        ee.emit('foo');
        expect(listener.mock.calls.length).toBe(2);
      });

      it('should emit a warning if max listeners exceeded', function () {
        // best case would be to spy on console.error() here, but Jest
        // chooses to make that impossible.
        var ee = EventEmittable();
        ee.setMaxListeners(2);
        ee.on('foo', jest.fn());
        ee.on('foo', jest.fn());
        ee.on('foo', jest.fn());
        expect(ee._events.foo.warned).toBe(true);
      });
    });

    describe('emit()', function () {
      it('should emit to multiple listeners', function () {
        var ee = EventEmittable();
        var listeners = [
          jest.fn(),
          jest.fn(),
          jest.fn()
        ];
        listeners.forEach(function (listener) {
          ee.once('foo', listener);
        });

        ee.emit('foo');

        listeners.forEach(function (listener) {
          expect(listener.mock.calls.length).toBe(1);
        });
      });
    });

    describe('removeListener()', function () {
      it('should remove a listener from the event', function () {
        var ee = EventEmittable();
        var listeners = [
          jest.fn(),
          jest.fn()
        ];
        listeners.forEach(function (listener) {
          ee.once('foo', listener);
        });

        ee.removeListener('foo', listeners[1]);
        ee.emit('foo');
        expect(listeners[0].mock.calls.length).toBe(1);
        expect(listeners[1].mock.calls.length).toBe(0);
      });
    });

    describe('removeAllListeners()', function () {
      describe('when provided an event', function () {
        it('should remove all listeners from a single event', function () {
          var ee = EventEmittable();
          var listeners = [
            jest.fn(),
            jest.fn()
          ];
          listeners.forEach(function (listener) {
            ee.once('foo', listener);
            ee.once('bar', listener);
          });

          ee.removeAllListeners('foo');
          ee.emit('foo');
          listeners.forEach(function (listener) {
            expect(listener.mock.calls.length).toBe(0);
          });
        });
      });

      describe('when not provided an event', function () {
        it('should remove all listeners from all events', function () {
          var ee = EventEmittable();
          var listeners = [
            jest.fn(),
            jest.fn()
          ];
          listeners.forEach(function (listener) {
            ee.once('foo', listener);
            ee.once('bar', listener);
          });

          ee.removeAllListeners();
          ee.emit('foo');
          ee.emit('bar');
          listeners.forEach(function (listener) {
            expect(listener.mock.calls.length).toBe(0);
          });
        });
      });
    });

    describe('setMaxListeners()', function () {
      it('should set the maximum number of listeners', function () {
        var ee = EventEmittable();
        ee.setMaxListeners(2);
        expect(ee._maxListeners).toBe(2);
      });
    });

    describe('listeners()', function () {
      it('should return an array of listeners for an event', function () {
        var ee = EventEmittable();
        var listeners = [
          jest.fn(),
          jest.fn()
        ];
        listeners.forEach(function (listener) {
          ee.on('foo', listener);
        });

        expect(ee.listeners('foo')).toEqual(listeners);
      });
    });
  });
});
