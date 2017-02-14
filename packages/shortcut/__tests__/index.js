var compose = require('@stamp/compose');
var Shortcut = require('..');

expect.extend({
  toBeA: function (received, argument) {
    const pass = typeof received === argument;
    return {
      pass: pass,
      message: function () {
        return 'expected ' + received +
          (pass ? ' not' : '') + ' to be a' + argument;
      }
    };
  }
});

describe('@stamp/shortcut', function () {
  it('adds all shortcuts', function () {
    var Stamp = compose(Shortcut);

    expect(Stamp.methods).toBeA('function');
    expect(Stamp.props).toBeA('function');
    expect(Stamp.statics).toBeA('function');
    expect(Stamp.conf).toBeA('function');
    expect(Stamp.deepProps).toBeA('function');
    expect(Stamp.deepStatics).toBeA('function');
    expect(Stamp.deepConf).toBeA('function');
    expect(Stamp.init).toBeA('function');
    expect(Stamp.composers).toBeA('function');
  });

  it('shortcuts add metadata', function () {
    var meta = {
      methods: {m: function () {}},

      props: {p: {}},
      statics: {s: {}},
      conf: {c: {}},

      deepProps: {dp: [1, 'a']},
      deepStatics: {ds: [1, 'a']},
      deepConf: {dc: [1, 'a']},

      init: [function () {}],
      composers: [function () {}]
    };
    var Stamp = compose(Shortcut)
      .methods(meta.methods)
      .props(meta.props)
      .statics(meta.statics)
      .conf(meta.conf)
      .deepProps(meta.deepProps)
      .deepStatics(meta.deepStatics)
      .deepConf(meta.deepConf)
      .init(meta.init)
      .composers(meta.composers);

    expect(Stamp().m).toBe(meta.methods.m);

    expect(Stamp().p).toBe(meta.props.p);
    expect(Stamp.s).toBe(meta.statics.s);
    expect(Stamp.compose.configuration.c).toBe(meta.conf.c);

    expect(Stamp().dp).toEqual(meta.deepProps.dp);
    expect(Stamp.ds).toEqual(meta.deepStatics.ds);
    expect(Stamp.compose.deepConfiguration.dc).toEqual(meta.deepConf.dc);

    expect(Stamp.compose.initializers).toEqual(meta.init);
    expect(Stamp.compose.composers).toEqual(meta.composers);
  });
});
