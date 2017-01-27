var compose = require('@stamp/compose');
var InitPropertyStamp = require('..');

describe('@stamp/InitPropertyStamp', function () {
  it('creates sub instance from stamps assigned to properties', function () {
    var SubStamp1 = compose({
      properties: {subStamp1: true}
    });
    var SubStamp2 = compose({
      properties: {subStamp2: true}
    });
    var MainStamp = InitPropertyStamp.compose({
      properties: {
        prop1: SubStamp1,
        prop2: SubStamp2
      }
    });

    var opts = {prop1: {}, prop2: {}};
    var instance = MainStamp(opts);

    expect(instance.prop1).toEqual({subStamp1: true});
    expect(instance.prop2).toEqual({subStamp2: true});
  });

  it('passes same named value from opts', function () {
    var opts1, opts2;
    var SubStamp1 = compose({
      initializers: [function (opts) {
        opts1 = opts;
      }]
    });
    var SubStamp2 = compose({
      initializers: [function (opts) {
        opts2 = opts;
      }]
    });
    var MainStamp = InitPropertyStamp.compose({
      properties: {
        prop1: SubStamp1,
        prop2: SubStamp2
      }
    });

    var opts = {prop1: {}, prop2: {}};
    MainStamp(opts);

    expect(opts1).toBe(opts.prop1);
    expect(opts2).toBe(opts.prop2);
  });

  it('passes the rest of the factory arguments', function () {
    var args1, args2;
    var SubStamp1 = compose({
      initializers: [function (_, ref) {
        args1 = ref.args;
      }]
    });
    var SubStamp2 = compose({
      initializers: [function (_, ref) {
        args2 = ref.args;
      }]
    });
    var MainStamp = InitPropertyStamp.compose({
      properties: {
        prop1: SubStamp1,
        prop2: SubStamp2
      }
    });

    var argA = {A: 1}, argB = {B: 2};
    MainStamp(null, argA, argB);

    expect(args1[1]).toBe(argA);
    expect(args1[2]).toBe(argB);
    expect(args2[1]).toBe(argA);
    expect(args2[2]).toBe(argB);
  });

  it('should push the initializer to the beginning of the list', function () {
    var Stamp1 = compose({
      initializers: [function () {}]
    });
    var Stamp2 = compose({
      initializers: [function () {}]
    });
    var Stamp = compose(Stamp1, InitPropertyStamp, Stamp2);

    expect(Stamp.compose.initializers[0]).toBe(InitPropertyStamp.compose.initializers[0]);
  });
});
