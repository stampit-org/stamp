/* eslint-disable jest/no-truthy-falsy */

'use strict';

const { compose } = require('@stamp/compose');
const { Shortcut } = require('..');

expect.extend({
  toBeA(received, argument) {
    // eslint-disable-next-line valid-typeof
    const pass = typeof received === argument;
    return {
      pass,
      message() {
        return `expected ${received}${pass ? ' not' : ''} to be a${argument}`;
      },
    };
  },
});

describe('@stamp/shortcut', function() {
  it('adds all shortcuts', function() {
    const Stamp = compose(Shortcut);

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

  it('shortcuts add metadata', function() {
    const meta = {
      methods: { m() {} },

      props: { p: {} },
      statics: { s: {} },
      conf: { c: {} },

      deepProps: { dp: [1, 'a'] },
      deepStatics: { ds: [1, 'a'] },
      deepConf: { dc: [1, 'a'] },

      init: [function() {}],
      composers: [function() {}],

      propertyDescriptors: { x: { writable: true } },
      staticPropertyDescriptors: { y: { writable: true } },
    };
    const Stamp = compose(Shortcut)
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

    expect(Stamp().dp).toStrictEqual(meta.deepProps.dp);
    expect(Stamp.ds).toStrictEqual(meta.deepStatics.ds);
    expect(Stamp.compose.deepConfiguration.dc).toStrictEqual(meta.deepConf.dc);

    expect(Stamp.compose.initializers).toStrictEqual(meta.init);
    expect(Stamp.compose.composers).toStrictEqual(meta.composers);

    expect(Stamp.compose.propertyDescriptors).toStrictEqual(meta.propertyDescriptors);
    expect(Stamp.compose.staticPropertyDescriptors).toStrictEqual(meta.staticPropertyDescriptors);
  });

  it('unbound shortcuts add metadata', function() {
    const { methods } = Shortcut;
    const { props } = Shortcut;
    const { statics } = Shortcut;
    const { conf } = Shortcut;
    const { deepProps } = Shortcut;
    const { deepStatics } = Shortcut;
    const { deepConf } = Shortcut;
    const { init } = Shortcut;
    const { composers } = Shortcut;
    const { propertyDescriptors } = Shortcut;
    const { staticPropertyDescriptors } = Shortcut;
    const meta = {
      methods: { m() {} },

      props: { p: {} },
      statics: { s: {} },
      conf: { c: {} },

      deepProps: { dp: [1, 'a'] },
      deepStatics: { ds: [1, 'a'] },
      deepConf: { dc: [1, 'a'] },

      init: [function() {}],
      composers: [function() {}],

      propertyDescriptors: { x: { writable: true } },
      staticPropertyDescriptors: { y: { writable: true } },
    };
    const Stamp = compose(
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

    expect(Stamp().dp).toStrictEqual(meta.deepProps.dp);
    expect(Stamp.ds).toStrictEqual(meta.deepStatics.ds);
    expect(Stamp.compose.deepConfiguration.dc).toStrictEqual(meta.deepConf.dc);

    expect(Stamp.compose.initializers).toStrictEqual(meta.init);
    expect(Stamp.compose.composers).toStrictEqual(meta.composers);

    expect(Stamp.compose.propertyDescriptors).toStrictEqual(meta.propertyDescriptors);
    expect(Stamp.compose.staticPropertyDescriptors).toStrictEqual(meta.staticPropertyDescriptors);
  });

  it('unbound shortcuts should not add static methods', function() {
    const { methods } = Shortcut;
    expect(methods({}).methods).toBeFalsy();
    const { props } = Shortcut;
    expect(props({}).props).toBeFalsy();
    const { statics } = Shortcut;
    expect(statics({}).statics).toBeFalsy();
    const { conf } = Shortcut;
    expect(conf({}).conf).toBeFalsy();
    const { deepProps } = Shortcut;
    expect(deepProps({}).deepProps).toBeFalsy();
    const { deepStatics } = Shortcut;
    expect(deepStatics({}).deepStatics).toBeFalsy();
    const { deepConf } = Shortcut;
    expect(deepConf({}).deepConf).toBeFalsy();
    const { init } = Shortcut;
    expect(init({}).init).toBeFalsy();
    const { composers } = Shortcut;
    expect(composers({}).composers).toBeFalsy();
    const { propertyDescriptors } = Shortcut;
    expect(propertyDescriptors({}).propertyDescriptors).toBeFalsy();
    const { staticPropertyDescriptors } = Shortcut;
    expect(staticPropertyDescriptors({}).staticPropertyDescriptors).toBeFalsy();
  });
});
