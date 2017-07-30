var compose = require('@stamp/compose');
var Shortcut = require('..');

expect.extend({
  toBeA: function (received, argument) {
    var pass = typeof received === argument;
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
    expect(Stamp.properties).toBeA('function');
    expect(Stamp.props).toBe(Stamp.properties);

    expect(Stamp.statics).toBeA('function');
    expect(Stamp.staticProperties).toBeA('function');
    expect(Stamp.statics).toBe(Stamp.staticProperties);

    expect(Stamp.conf).toBeA('function');
    expect(Stamp.configuration).toBeA('function');
    expect(Stamp.conf).toBe(Stamp.configuration);

    expect(Stamp.deepProps).toBeA('function');
    expect(Stamp.deepProperties).toBeA('function');
    expect(Stamp.deepProps).toBe(Stamp.deepProperties);

    expect(Stamp.deepStatics).toBeA('function');
    expect(Stamp.staticDeepProperties).toBeA('function');
    expect(Stamp.deepStatics).toBe(Stamp.staticDeepProperties);

    expect(Stamp.deepConf).toBeA('function');
    expect(Stamp.deepConfiguration).toBeA('function');
    expect(Stamp.deepConf).toBe(Stamp.deepConfiguration);

    expect(Stamp.init).toBeA('function');
    expect(Stamp.initializers).toBeA('function');
    expect(Stamp.init).toBe(Stamp.initializers);

    expect(Stamp.composers).toBeA('function');

    expect(Stamp.propertyDescriptors).toBeA('function');

    expect(Stamp.staticPropertyDescriptors).toBeA('function');
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
      composers: [function () {}],

      propertyDescriptors: {x: {writable: true}},
      staticPropertyDescriptors: {y: {writable: true}}
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
      .composers(meta.composers)
      .propertyDescriptors(meta.propertyDescriptors)
      .staticPropertyDescriptors(meta.staticPropertyDescriptors);

    expect(Stamp().m).toBe(meta.methods.m);

    expect(Stamp().p).toBe(meta.props.p);
    expect(Stamp.s).toBe(meta.statics.s);
    expect(Stamp.compose.configuration.c).toBe(meta.conf.c);

    expect(Stamp().dp).toEqual(meta.deepProps.dp);
    expect(Stamp.ds).toEqual(meta.deepStatics.ds);
    expect(Stamp.compose.deepConfiguration.dc).toEqual(meta.deepConf.dc);

    expect(Stamp.compose.initializers).toEqual(meta.init);
    expect(Stamp.compose.composers).toEqual(meta.composers);

    expect(Stamp.compose.propertyDescriptors).toEqual(meta.propertyDescriptors);
    expect(Stamp.compose.staticPropertyDescriptors).toEqual(meta.staticPropertyDescriptors);
  });

  it('unbound shortcuts add metadata', function () {
    var methods = Shortcut.methods;
    var props = Shortcut.props;
    var statics = Shortcut.statics;
    var conf = Shortcut.conf;
    var deepProps = Shortcut.deepProps;
    var deepStatics = Shortcut.deepStatics;
    var deepConf = Shortcut.deepConf;
    var init = Shortcut.init;
    var composers = Shortcut.composers;
    var propertyDescriptors = Shortcut.propertyDescriptors;
    var staticPropertyDescriptors = Shortcut.staticPropertyDescriptors;
    var meta = {
      methods: {m: function () {}},

      props: {p: {}},
      statics: {s: {}},
      conf: {c: {}},

      deepProps: {dp: [1, 'a']},
      deepStatics: {ds: [1, 'a']},
      deepConf: {dc: [1, 'a']},

      init: [function () {}],
      composers: [function () {}],

      propertyDescriptors: {x: {writable: true}},
      staticPropertyDescriptors: {y: {writable: true}}
    };
    var Stamp = compose(
      methods(meta.methods),
      props(meta.props),
      statics(meta.statics),
      conf(meta.conf),
      deepProps(meta.deepProps),
      deepStatics(meta.deepStatics),
      deepConf(meta.deepConf),
      init(meta.init),
      composers(meta.composers),
      propertyDescriptors(meta.propertyDescriptors),
      staticPropertyDescriptors(meta.staticPropertyDescriptors)
    );

    expect(Stamp().m).toBe(meta.methods.m);

    expect(Stamp().p).toBe(meta.props.p);
    expect(Stamp.s).toBe(meta.statics.s);
    expect(Stamp.compose.configuration.c).toBe(meta.conf.c);

    expect(Stamp().dp).toEqual(meta.deepProps.dp);
    expect(Stamp.ds).toEqual(meta.deepStatics.ds);
    expect(Stamp.compose.deepConfiguration.dc).toEqual(meta.deepConf.dc);

    expect(Stamp.compose.initializers).toEqual(meta.init);
    expect(Stamp.compose.composers).toEqual(meta.composers);

    expect(Stamp.compose.propertyDescriptors).toEqual(meta.propertyDescriptors);
    expect(Stamp.compose.staticPropertyDescriptors).toEqual(meta.staticPropertyDescriptors);
  });

  it('unbound shortcuts should not add static methods', function () {
    var methods = Shortcut.methods;
    expect(methods({}).methods).toBeFalsy();
    var props = Shortcut.props;
    expect(props({}).props).toBeFalsy();
    var statics = Shortcut.statics;
    expect(statics({}).statics).toBeFalsy();
    var conf = Shortcut.conf;
    expect(conf({}).conf).toBeFalsy();
    var deepProps = Shortcut.deepProps;
    expect(deepProps({}).deepProps).toBeFalsy();
    var deepStatics = Shortcut.deepStatics;
    expect(deepStatics({}).deepStatics).toBeFalsy();
    var deepConf = Shortcut.deepConf;
    expect(deepConf({}).deepConf).toBeFalsy();
    var init = Shortcut.init;
    expect(init({}).init).toBeFalsy();
    var composers = Shortcut.composers;
    expect(composers({}).composers).toBeFalsy();
    var propertyDescriptors = Shortcut.propertyDescriptors;
    expect(propertyDescriptors({}).propertyDescriptors).toBeFalsy();
    var staticPropertyDescriptors = Shortcut.staticPropertyDescriptors;
    expect(staticPropertyDescriptors({}).staticPropertyDescriptors).toBeFalsy();
  });
});
