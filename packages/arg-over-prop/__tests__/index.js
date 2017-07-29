var ArgOverProp = require('..');

describe('@stamp/arg-over-prop', function () {
  it('assigns only the requested properties', function () {
    var Stamp = ArgOverProp.argOverProp('override');
    var instance = Stamp({override: 1, dontTouch: 2});

    expect(instance.override).toBe(1);
    expect(instance).not.toHaveProperty('dontTouch');
  });

  it('sets default property values if object was passed', function () {
    var Stamp = ArgOverProp.argOverProp({override: 0, dontTouch: 0});
    var instance = Stamp({override: 1});

    expect(instance.override).toBe(1);
    expect(instance.dontTouch).toBe(0);
  });

  it('allow array arguments', function () {
    var Stamp = ArgOverProp.argOverProp(['override', 'dontTouch']);
    var instance = Stamp({override: 1});

    expect(instance.override).toBe(1);
    expect(instance).not.toHaveProperty('dontTouch');
  });

  it('skips invalid arguments', function () {
    var Stamp = ArgOverProp.argOverProp(1, {}, [], NaN, function (){}, null, undefined);
    var instance = Stamp({'1': 1});

    expect(instance).not.toHaveProperty('1');
  });

  it('does not crash in any circumstance', function () {
    var Stamp1 = ArgOverProp.argOverProp('x');
    var Stamp2 = ArgOverProp.argOverProp({x: 1});
    var Stamp3 = ArgOverProp.argOverProp(['x']);
    var S1 = Stamp1.compose(Stamp2, Stamp3);
    var S2 = Stamp1.compose(Stamp3, Stamp2);
    var S3 = Stamp2.compose(Stamp1, Stamp3);
    var S4 = Stamp2.compose(Stamp3, Stamp1);
    var S5 = Stamp3.compose(Stamp1, Stamp2);
    var S6 = Stamp3.compose(Stamp2, Stamp1);

    expect(S1({x: 2})).toEqual({x: 2});
    expect(S2({x: 2})).toEqual({x: 2});
    expect(S3({x: 2})).toEqual({x: 2});
    expect(S4()).toEqual({x: 1});
    expect(S5()).toEqual({x: 1});
    expect(S6()).toEqual({x: 1});
  });

  it('overwrites metadata', function () {
    var Stamp = ArgOverProp.argOverProp('x').argOverProp(['x']).argOverProp({x: 1});

    expect(Stamp({x: 2})).toEqual({x: 2});
    expect(Stamp()).toEqual({x: 1});
  });

  it('de-duplicates property names in metadata', function () {
    var Base = ArgOverProp.argOverProp('dontTouch');

    var Stamp = Base.argOverProp('x').argOverProp(['x']).argOverProp({x: 1});
    expect(Stamp.compose.deepConfiguration.ArgOverProp).toHaveLength(2);

    Stamp = Stamp.compose(Base.argOverProp('x'));
    expect(Stamp.compose.deepConfiguration.ArgOverProp).toHaveLength(2);

    Stamp = Stamp.compose({deepConfiguration: {ArgOverProp: ['x']}});
    expect(Stamp.compose.deepConfiguration.ArgOverProp).toHaveLength(2);
  });
});
