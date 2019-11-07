/* eslint-disable node/no-unpublished-require */
/* eslint-disable func-names */

'use strict';

const compose = require('@stamp/compose');
const InstanceOf = require('@stamp/instanceof');
const Privatize = require('..');

describe('@stamp/privatize', function() {
  it('applies access restrictions', function() {
    let accessFoo;
    let accessBar;
    const Orig = compose({
      properties: { foo: 1 },
      methods: {
        bar() {},
        checkAccess() {
          accessFoo = this.foo;
          accessBar = this.bar;
        },
      },
    });
    const Stamp = Orig.compose(Privatize).privatizeMethods('bar');
    const instance = Stamp();

    expect(instance.foo).toBeUndefined();
    expect(instance.bar).toBeUndefined();
    instance.checkAccess();
    expect(accessFoo).toBe(1);
    expect(accessBar).toBe(Orig.compose.methods.bar);
  });

  it('should push the initializer to the end of the list', function() {
    const Stamp1 = compose({
      initializers: [function() {}],
    });
    const Stamp2 = compose({
      initializers: [function() {}],
    });
    const Stamp = compose(
      Stamp1,
      Privatize,
      Stamp2
    );

    expect(Stamp.compose.initializers[2]).toBe(Privatize.compose.initializers[0]);
  });

  it('should allow rubbish to the .privatizeMethods()', function() {
    const Stamp = compose(
      { methods: { bar() {} } },
      Privatize
    ).privatizeMethods(null, {}, [], 1, 'bar', NaN, /a/, undefined);
    const instance = Stamp();

    expect(instance.bar).toBeUndefined();
  });

  it('should work without any methods defined', function() {
    const Stamp = compose(
      Privatize,
      {
        properties: { bar: 'foo' },
      }
    );
    const instance = Stamp();

    expect(instance.bar).toBeUndefined();
  });

  it('can be used as a standalone function', function() {
    const { privatizeMethods } = Privatize;
    let accessFoo;
    let accessBar;
    const Orig = compose({
      properties: { foo: 1 },
      methods: {
        bar() {},
        checkAccess() {
          accessFoo = this.foo;
          accessBar = this.bar;
        },
      },
    });
    const Stamp = privatizeMethods('bar').compose(Orig);
    const instance = Stamp();

    expect(instance.foo).toBeUndefined();
    expect(instance.bar).toBeUndefined();
    instance.checkAccess();
    expect(accessFoo).toBe(1);
    expect(accessBar).toBe(Orig.compose.methods.bar);
  });

  it('works with InstanceOf stamp', function() {
    const Stamp = compose(
      InstanceOf,
      Privatize
    );
    expect(Stamp() instanceof Stamp).toBe(true);
  });
});
