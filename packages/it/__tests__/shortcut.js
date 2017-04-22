var _ = require('lodash');
var stampit = require('../');

// stampit.methods, stampit.statics, stampit.init, stampit.props, etc.
describe('shortcuts', function () {

  test('stampit.methods shortcut', function () {
    var methods = {method1: function () {}};
    var stamp1 = stampit({methods: methods});
    var stamp2 = stampit.methods(methods);

    expect(_.toPlainObject(stamp1.compose)).toEqual(_.toPlainObject(stamp2.compose));
  });

  test('stampit.init shortcut', function () {
    var init = function () {};
    var stamp1 = stampit({init: init});
    var stamp2 = stampit.init(init);

    expect(_.toPlainObject(stamp1.compose)).toEqual(_.toPlainObject(stamp2.compose));
  });

  test('stampit.composers shortcut', function () {
    var composer = function () {};
    var stamp1 = stampit({composers: composer});
    var stamp2 = stampit.composers(composer);

    expect(_.toPlainObject(stamp1.compose)).toEqual(_.toPlainObject(stamp2.compose));
  });

  test('stampit.props shortcut', function () {
    var props = {method1: function () {}};
    var stamp1 = stampit({props: props});
    var stamp2 = stampit.props(props);

    expect(_.toPlainObject(stamp1.compose)).toEqual(_.toPlainObject(stamp2.compose));
  });

  test('stampit.statics shortcut', function () {
    var statics = {method1: function () {}};
    var stamp1 = stampit({statics: statics});
    var stamp2 = stampit.statics(statics);

    expect(_.toPlainObject(stamp1.compose)).toEqual(_.toPlainObject(stamp2.compose));
  });

  test('stampit.propertyDescriptors shortcut', function () {
    var propertyDescriptors = {x: {writable: true}};
    var stamp1 = stampit({propertyDescriptors: propertyDescriptors});
    var stamp2 = stampit.propertyDescriptors(propertyDescriptors);

    expect(_.toPlainObject(stamp1.compose)).toEqual(_.toPlainObject(stamp2.compose));
  });

  test('stampit.staticPropertyDescriptors shortcut', function () {
    var staticPropertyDescriptors = {x: {writable: true}};
    var stamp1 = stampit({staticPropertyDescriptors: staticPropertyDescriptors});
    var stamp2 = stampit.staticPropertyDescriptors(staticPropertyDescriptors);

    expect(_.toPlainObject(stamp1.compose)).toEqual(_.toPlainObject(stamp2.compose));
  });

  test('invoke should not matter', function () {
    for (var prop in stampit) {
      var func = stampit[prop];
      var descriptor1 = _.toPlainObject(func().compose);
      var descriptor2 = _.toPlainObject(stampit[prop]().compose);

      expect(descriptor1).toEqual(descriptor2);
    }
  });

  test('all shortcuts combined', function () {
    var compose = stampit.compose;
    var methods = stampit.methods;
    var init = stampit.init;

    var HasFoo = compose({
      properties: {
        foo: 'default foo!'
      }
    }).methods().properties().initializers().deepProperties()
      .staticProperties().staticDeepProperties()
      .configuration().deepConfiguration()
      .propertyDescriptors().staticPropertyDescriptors()
      .props().init().composers().deepProps()
      .statics().deepStatics().conf().deepConf();

    var PrintFoo = methods({
      printFoo: function () {
        // console.log(this.foo || 'There is no foo');
      }
    }).methods().properties().initializers().deepProperties()
      .staticProperties().staticDeepProperties()
      .configuration().deepConfiguration()
      .propertyDescriptors().staticPropertyDescriptors()
      .props().init().composers().deepProps()
      .statics().deepStatics().conf().deepConf();

    var Init = init(function (opts) {
      this.foo = opts.foo;
    }).methods().properties().initializers().deepProperties()
      .staticProperties().staticDeepProperties()
      .configuration().deepConfiguration()
      .propertyDescriptors().staticPropertyDescriptors()
      .props().init().composers().deepProps()
      .statics().deepStatics().conf().deepConf();

    var Foo = compose(HasFoo, PrintFoo, Init);

    expect(Foo.compose.properties.foo).toBe('default foo!');
    expect(typeof Foo.compose.methods.printFoo === 'function').toBeTruthy();
    expect(Foo.compose.initializers.length).toBe(1);
  });
});
