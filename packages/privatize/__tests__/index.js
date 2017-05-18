var compose = require('@stamp/compose');
var Privatize = require('..');

describe('@stamp/privatize', function () {
  it('applies access restrictions', function () {
    var accessFoo, accessBar;
    var orig = compose({
      properties: {foo: 1},
      methods: {
        bar: function () {},
        checkAccess: function () {
          accessFoo = this.foo;
          accessBar = this.bar;
        }
      }
    });
    var Stamp = orig.compose(Privatize).privatizeMethods('bar');
    var instance = Stamp();

    expect(instance.foo).toBeUndefined();
    expect(instance.bar).toBeUndefined();
    instance.checkAccess();
    expect(accessFoo).toBe(1);
    expect(accessBar).toBe(orig.compose.methods.bar);
  });

  it('should push the initializer to the end of the list', function () {
    var Stamp1 = compose({
      initializers: [function () {}]
    });
    var Stamp2 = compose({
      initializers: [function () {}]
    });
    var Stamp = compose(Stamp1, Privatize, Stamp2);

    expect(Stamp.compose.initializers[2]).toBe(Privatize.compose.initializers[0]);
  });

  it('should allow rubbish to the .privatizeMethods()', function () {
    var Stamp = compose(
      {methods: {bar: function () {}}},
      Privatize
    ).privatizeMethods(null, {}, [], 1, 'bar', NaN, /a/, undefined);
    var instance = Stamp();

    expect(instance.bar).toBeUndefined();
  });

  it('should work without any methods defined', function () {
    var Stamp = compose(Privatize, {
      properties: { bar: 'foo' },
    });
    var instance = Stamp();

    expect(instance.bar).toBeUndefined();
  })
});
