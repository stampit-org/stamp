var EventEmitter = require('../node_modules/events').EventEmitter;
var stampit = require('@stamp/it');
var EventEmittable = require('..');

describe('EventEmittable', function () {
  describe('method', function () {
    var ee;

    beforeEach(function () {
      ee = EventEmittable();
    });

    describe('once()', function () {
      var listener;

      beforeEach(function () {
        listener = jest.fn();
      });

      it('should call listener once', function () {
        ee.once('foo', listener);
        ee.emit('foo');
        ee.emit('foo');
        expect(listener.mock.calls.length)
          .toBe(1);
      });
    });

    describe('on()', function () {
      var listener;

      beforeEach(function () {
        listener = jest.fn();
      });

      it('should call listener', function () {
        ee.on('foo', listener);
        ee.emit('foo');
        ee.emit('foo');
        expect(listener.mock.calls.length)
          .toBe(2);
      });
    });

    describe('emit()', function () {
      var listeners;

      beforeEach(function () {
        listeners = [
          jest.fn(),
          jest.fn(),
          jest.fn()
        ];
        listeners.forEach(function (listener) {
          ee.once('foo', listener);
        });
      });

      it('should emit to multiple listeners', function () {
        ee.emit('foo');

        listeners.forEach(function (listener) {
          expect(listener.mock.calls.length)
            .toBe(1);
        });
      });
    });

    describe('removeListener()', function () {
      var listeners;

      beforeEach(function () {
        listeners = [
          jest.fn(),
          jest.fn()
        ];
        listeners.forEach(function (listener) {
          ee.once('foo', listener);
        });
      });

      it('should remove a listener from the event', function () {
        ee.removeListener('foo', listeners[1]);
        ee.emit('foo');
        expect(listeners[0].mock.calls.length)
          .toBe(1);
        expect(listeners[1].mock.calls.length)
          .toBe(0);
      });
    });

    describe('removeAllListeners()', function () {
      var listeners;

      beforeEach(function () {
        listeners = [
          jest.fn(),
          jest.fn()
        ];
        listeners.forEach(function (listener) {
          ee.once('foo', listener);
          ee.once('bar', listener);
        });
      });

      describe('when provided an event', function () {
        it('should remove all listeners from a single event', function () {
          ee.removeAllListeners('foo');
          ee.emit('foo');
          listeners.forEach(function (listener) {
            expect(listener.mock.calls.length)
              .toBe(0);
          });
        });
      });

      describe('when not provided an event', function () {
        it('should remove all listeners from all events', function () {
          ee.removeAllListeners();
          ee.emit('foo');
          ee.emit('bar');
          listeners.forEach(function (listener) {
            expect(listener.mock.calls.length)
              .toBe(0);
          });
        });
      });
    });

    describe('getMaxListeners()', function () {
      it('should return the (default) maximum number of listeners',
        function () {
          expect(ee.getMaxListeners())
            .toBe(EventEmitter.defaultMaxListeners);
        });
    });

    describe('setMaxListeners()', function () {
      it('should set the maximum number of listeners', function () {
        ee.setMaxListeners(2);
        expect(ee.getMaxListeners())
          .toBe(2);
      });
    });

    describe('listeners()', function () {
      var listeners;

      beforeEach(function () {
        listeners = [
          jest.fn(),
          jest.fn()
        ];
        listeners.forEach(function (listener) {
          ee.on('foo', listener);
        });
      });

      it('should return an array of listeners for an event', function () {
        expect(ee.listeners('foo')).toEqual(listeners);
      });
    });
  });

  it('should emit a warning if max listeners exceeded', function () {
    // best case would be to spy on console.error() here, but Jest
    // chooses to make that impossible.
    var ee = EventEmittable();
    ee.setMaxListeners(2);
    ee.on('foo', jest.fn());
    ee.on('foo', jest.fn());
    ee.on('foo', jest.fn());

    expect(ee._events.foo.warned)
      .toBe(true);
  });

  it('should allow composition', function () {
    var MyStamp = stampit({
      methods: {
        foo: function () {
          this.emit('foo');
        }
      }
    })
      .compose(EventEmittable);

    var stamp = MyStamp();
    var listener = jest.fn();
    stamp.on('foo', listener);
    stamp.foo();
    expect(listener.mock.calls.length)
      .toBe(1);
  });

  // guess I'm convinced.
});
