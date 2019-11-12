/* eslint-disable node/no-unpublished-require */

'use strict';

const _ = require('lodash');
const stampit = require('../');

// stampit.methods, stampit.statics, stampit.init, stampit.props, etc.
describe('shortcuts', function() {
  it('stampit.methods shortcut', function() {
    const methods = { method1() {} };
    const stamp1 = stampit({ methods });
    const stamp2 = stampit.methods(methods);

    expect(_.toPlainObject(stamp1.compose)).toStrictEqual(_.toPlainObject(stamp2.compose));
  });

  it('stampit.init shortcut', function() {
    const init = function() {};
    const stamp1 = stampit({ init });
    const stamp2 = stampit.init(init);

    expect(_.toPlainObject(stamp1.compose)).toStrictEqual(_.toPlainObject(stamp2.compose));
  });

  it('stampit.composers shortcut', function() {
    const composer = function() {};
    const stamp1 = stampit({ composers: composer });
    const stamp2 = stampit.composers(composer);

    expect(_.toPlainObject(stamp1.compose)).toStrictEqual(_.toPlainObject(stamp2.compose));
  });

  it('stampit.props shortcut', function() {
    const props = { method1() {} };
    const stamp1 = stampit({ props });
    const stamp2 = stampit.props(props);

    expect(_.toPlainObject(stamp1.compose)).toStrictEqual(_.toPlainObject(stamp2.compose));
  });

  it('stampit.statics shortcut', function() {
    const statics = { method1() {} };
    const stamp1 = stampit({ statics });
    const stamp2 = stampit.statics(statics);

    expect(_.toPlainObject(stamp1.compose)).toStrictEqual(_.toPlainObject(stamp2.compose));
  });

  it('stampit.propertyDescriptors shortcut', function() {
    const propertyDescriptors = { x: { writable: true } };
    const stamp1 = stampit({ propertyDescriptors });
    const stamp2 = stampit.propertyDescriptors(propertyDescriptors);

    expect(_.toPlainObject(stamp1.compose)).toStrictEqual(_.toPlainObject(stamp2.compose));
  });

  it('stampit.staticPropertyDescriptors shortcut', function() {
    const staticPropertyDescriptors = { x: { writable: true } };
    const stamp1 = stampit({ staticPropertyDescriptors });
    const stamp2 = stampit.staticPropertyDescriptors(staticPropertyDescriptors);

    expect(_.toPlainObject(stamp1.compose)).toStrictEqual(_.toPlainObject(stamp2.compose));
  });

  it('invoke should not matter', function() {
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const prop in stampit) {
      const func = stampit[prop];
      const descriptor1 = _.toPlainObject(func().compose);
      const descriptor2 = _.toPlainObject(stampit[prop]().compose);

      expect(descriptor1).toStrictEqual(descriptor2);
    }
  });

  it('all shortcuts combined', function() {
    const { compose } = stampit;
    const { methods } = stampit;
    const { init } = stampit;

    const HasFoo = compose({
      properties: {
        foo: 'default foo!',
      },
    })
      .methods()
      .properties()
      .initializers()
      .deepProperties()
      .staticProperties()
      .staticDeepProperties()
      .configuration()
      .deepConfiguration()
      .propertyDescriptors()
      .staticPropertyDescriptors()
      .props()
      .init()
      .composers()
      .deepProps()
      .statics()
      .deepStatics()
      .conf()
      .deepConf();

    const PrintFoo = methods({
      printFoo() {
        // console.log(this.foo || 'There is no foo');
      },
    })
      .methods()
      .properties()
      .initializers()
      .deepProperties()
      .staticProperties()
      .staticDeepProperties()
      .configuration()
      .deepConfiguration()
      .propertyDescriptors()
      .staticPropertyDescriptors()
      .props()
      .init()
      .composers()
      .deepProps()
      .statics()
      .deepStatics()
      .conf()
      .deepConf();

    const Init = init(function(opts) {
      this.foo = opts.foo;
    })
      .methods()
      .properties()
      .initializers()
      .deepProperties()
      .staticProperties()
      .staticDeepProperties()
      .configuration()
      .deepConfiguration()
      .propertyDescriptors()
      .staticPropertyDescriptors()
      .props()
      .init()
      .composers()
      .deepProps()
      .statics()
      .deepStatics()
      .conf()
      .deepConf();

    const Foo = compose(HasFoo, PrintFoo, Init);

    expect(Foo.compose.properties.foo).toBe('default foo!');
    // eslint-disable-next-line jest/no-truthy-falsy
    expect(typeof Foo.compose.methods.printFoo === 'function').toBeTruthy();
    expect(Foo.compose.initializers).toHaveLength(1);
  });
});
