'use strict';

const compose = require('@stamp/compose');
const InitProperty = require('..');

describe('@stamp/init-property', function() {
  it('creates sub instance from stamps assigned to properties', function() {
    const SubStamp1 = compose({
      properties: { subStamp1: true },
    });
    const SubStamp2 = compose({
      properties: { subStamp2: true },
    });
    const MainStamp = InitProperty.compose({
      properties: {
        prop1: SubStamp1,
        prop2: SubStamp2,
      },
    });

    const opts = { prop1: {}, prop2: {} };
    const instance = MainStamp(opts);

    expect(instance.prop1).toStrictEqual({ subStamp1: true });
    expect(instance.prop2).toStrictEqual({ subStamp2: true });
  });

  it('should ignore non stamp properties', function() {
    const MainStamp = InitProperty.compose({
      properties: {
        prop1: 'whatever',
        prop2: 42,
      },
    });

    const opts = { prop1: {}, prop2: {} };
    const instance = MainStamp(opts);

    expect(instance.prop1).toBe('whatever');
    expect(instance.prop2).toBe(42);
  });

  it('passes same named value from opts', function() {
    let opts1;
    let opts2;
    const SubStamp1 = compose({
      initializers: [
        function(opts) {
          opts1 = opts;
        },
      ],
    });
    const SubStamp2 = compose({
      initializers: [
        function(opts) {
          opts2 = opts;
        },
      ],
    });
    const MainStamp = InitProperty.compose({
      properties: {
        prop1: SubStamp1,
        prop2: SubStamp2,
      },
    });

    const opts = { prop1: {}, prop2: {} };
    MainStamp(opts);

    expect(opts1).toBe(opts.prop1);
    expect(opts2).toBe(opts.prop2);
  });

  it('passes the rest of the factory arguments', function() {
    let args1;
    let args2;
    const SubStamp1 = compose({
      initializers: [
        function(_, ref) {
          args1 = ref.args;
        },
      ],
    });
    const SubStamp2 = compose({
      initializers: [
        function(_, ref) {
          args2 = ref.args;
        },
      ],
    });
    const MainStamp = InitProperty.compose({
      properties: {
        prop1: SubStamp1,
        prop2: SubStamp2,
      },
    });

    const argA = { A: 1 };
    const argB = { B: 2 };
    MainStamp(null, argA, argB);

    expect(args1[1]).toBe(argA);
    expect(args1[2]).toBe(argB);
    expect(args2[1]).toBe(argA);
    expect(args2[2]).toBe(argB);
  });

  it('should push the initializer to the beginning of the list', function() {
    const Stamp1 = compose({
      initializers: [function() {}],
    });
    const Stamp2 = compose({
      initializers: [function() {}],
    });
    const Stamp = compose(Stamp1, InitProperty, Stamp2);

    expect(Stamp.compose.initializers[0]).toBe(InitProperty.compose.initializers[0]);
  });
});
