'use strict';

const ArgOverProp = require('..');

describe('@stamp/arg-over-prop', function() {
  it('can be used as a standalone function', function() {
    const { argOverProp } = ArgOverProp;
    const Stamp = argOverProp('override');
    const instance = Stamp({ override: 1, dontTouch: 2 });

    expect(instance.override).toBe(1);
    expect(instance).not.toHaveProperty('dontTouch');
  });

  it('assigns only the requested properties', function() {
    const Stamp = ArgOverProp.argOverProp('override');
    const instance = Stamp({ override: 1, dontTouch: 2 });

    expect(instance.override).toBe(1);
    expect(instance).not.toHaveProperty('dontTouch');
  });

  it('sets default property values if object was passed', function() {
    const Stamp = ArgOverProp.argOverProp({ override: 0, dontTouch: 0 });
    const instance = Stamp({ override: 1 });

    expect(instance.override).toBe(1);
    expect(instance.dontTouch).toBe(0);
  });

  it('allow array arguments', function() {
    const Stamp = ArgOverProp.argOverProp(['override', 'dontTouch']);
    const instance = Stamp({ override: 1 });

    expect(instance.override).toBe(1);
    expect(instance).not.toHaveProperty('dontTouch');
  });

  it('skips invalid arguments', function() {
    const Stamp = ArgOverProp.argOverProp(1, {}, [], NaN, function() {}, null, undefined);
    const instance = Stamp({ '1': 1 });

    expect(instance).not.toHaveProperty('1');
  });

  it('does not crash in any circumstance', function() {
    const Stamp1 = ArgOverProp.argOverProp('x');
    const Stamp2 = ArgOverProp.argOverProp({ x: 1 });
    const Stamp3 = ArgOverProp.argOverProp(['x']);
    const S1 = Stamp1.compose(
      Stamp2,
      Stamp3
    );
    const S2 = Stamp1.compose(
      Stamp3,
      Stamp2
    );
    const S3 = Stamp2.compose(
      Stamp1,
      Stamp3
    );
    const S4 = Stamp2.compose(
      Stamp3,
      Stamp1
    );
    const S5 = Stamp3.compose(
      Stamp1,
      Stamp2
    );
    const S6 = Stamp3.compose(
      Stamp2,
      Stamp1
    );

    expect(S1({ x: 2 })).toStrictEqual({ x: 2 });
    expect(S2({ x: 2 })).toStrictEqual({ x: 2 });
    expect(S3({ x: 2 })).toStrictEqual({ x: 2 });
    expect(S4()).toStrictEqual({ x: 1 });
    expect(S5()).toStrictEqual({ x: 1 });
    expect(S6()).toStrictEqual({ x: 1 });
  });

  it('overwrites metadata', function() {
    const Stamp = ArgOverProp.argOverProp('x')
      .argOverProp(['x'])
      .argOverProp({ x: 1 });

    expect(Stamp({ x: 2 })).toStrictEqual({ x: 2 });
    expect(Stamp()).toStrictEqual({ x: 1 });
  });

  it('de-duplicates property names in metadata', function() {
    const Base = ArgOverProp.argOverProp('dontTouch');

    let Stamp = Base.argOverProp('x')
      .argOverProp(['x'])
      .argOverProp({ x: 1 });
    expect(Stamp.compose.deepConfiguration.ArgOverProp).toHaveLength(2);

    Stamp = Stamp.compose(Base.argOverProp('x'));
    expect(Stamp.compose.deepConfiguration.ArgOverProp).toHaveLength(2);

    Stamp = Stamp.compose({ deepConfiguration: { ArgOverProp: ['x'] } });
    expect(Stamp.compose.deepConfiguration.ArgOverProp).toHaveLength(2);
  });

  it('initializer does not crash under any circumstances', function() {
    const badArgs = [0, 1, {}, [], NaN, function() {}, null, undefined];
    const Stamp = ArgOverProp.argOverProp({ dontTouch: 42 });
    badArgs.forEach(function(arg) {
      const instance = Stamp(arg);
      expect(instance.dontTouch).toBe(42);
    });
  });
});
