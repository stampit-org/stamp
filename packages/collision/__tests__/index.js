var compose = require('@stamp/compose');
var Collision = require('..');

describe('@stamp/collision', function () {
  it('defer', function () {
    var draw1 = jest.fn();
    var Defer1 = compose({
        methods: {
          draw: draw1
        }
      },
      Collision.collisionSetup({defer: ['draw']})
    );
    var draw2 = jest.fn();
    var Defer2 = Collision.collisionSetup({defer: ['draw']}).compose({
      methods: {
        draw: draw2
      }
    });

    var StampCombined = compose(Defer1, Defer2);
    var obj = StampCombined();

    obj.draw();

    expect(draw1).toBeCalled();
    expect(draw2).toBeCalled();
  });

  it('defer + regular', function () {
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({defer: ['draw']})
    );
    var Regular = compose({methods: {draw: function () {}}});

    expect(function () {compose(Defer, Regular)}).toThrow();
    expect(function () {compose(Regular, Defer)}).toThrow();
  });


  it('defer without conflicts', function () {
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({defer: ['draw']})
    );
    var Regular = compose({
      methods: {
        whatever: function () {}
      }
    });

    expect(function () {compose(Defer, Regular)}).not.toThrow();
    expect(function () {compose(Regular, Defer)}).not.toThrow();
  });

  it('forbid', function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({forbid: ['draw']})
    );
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({defer: ['draw']})
    );
    var Regular = compose({
        methods: {
          draw: function () {}
        }
      }
    );

    expect(function () {compose(Forbid, Defer)}).toThrow();
    expect(function () {compose(Forbid, Regular)}).toThrow();
    expect(function () {compose(Defer, Forbid)}).toThrow();
    expect(function () {compose(Regular, Forbid)}).toThrow();
  });

  it('collisionProtectAnyMethod', function () {
    var FooBar = compose({
        methods: {
          foo: function () {},
          bar: function () {}
        }
      },
      Collision.collisionProtectAnyMethod()
    );
    var Foo = compose({
        methods: {
          foo: function () {}
        }
      },
      Collision.collisionProtectAnyMethod()
    );
    var Bar = compose({
        methods: {
          bar: function () {}
        }
      },
      Collision.collisionProtectAnyMethod()
    );

    expect(function () {compose(FooBar, Foo)}).toThrow();
    expect(function () {compose(Foo, FooBar)}).toThrow();
    expect(function () {compose(FooBar, Bar)}).toThrow();
    expect(function () {compose(Bar, FooBar)}).toThrow();
    expect(function () {compose(Foo, Bar)}).not.toThrow();
    expect(function () {compose(Bar, Foo)}).not.toThrow();
  });

  it('collisionProtectAnyMethod + allow', function () {
    var FooBar = compose({
        methods: {
          foo: function () {},
          bar: function () {}
        }
      },
      Collision.collisionProtectAnyMethod({allow: ['foo']})
    );
    var Foo = compose({
        methods: {
          foo: function () {}
        }
      },
      Collision.collisionProtectAnyMethod()
    );
    var Bar = compose({
        methods: {
          bar: function () {}
        }
      },
      Collision.collisionProtectAnyMethod()
    );

    expect(function () {compose(FooBar, Foo)}).not.toThrow();
    expect(function () {compose(Foo, FooBar)}).not.toThrow();
    expect(function () {compose(FooBar, Bar)}).toThrow();
    expect(function () {compose(Bar, FooBar)}).toThrow();
    expect(function () {compose(Foo, Bar)}).not.toThrow();
    expect(function () {compose(Bar, Foo)}).not.toThrow();
  });

  it('forbid + allow', function () {
    expect(function () {Collision.collisionSetup({allow: ['foo'], forbid: ['foo']})}).toThrow();
  });

  it('forbid without conflicts', function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({forbid: ['draw']})
    );
    var Regular = compose({
        methods: {
          whatever: function () {}
        }
      }
    );

    expect(function () {compose(Forbid, Regular)}).not.toThrow();
    expect(function () {compose(Regular, Forbid)}).not.toThrow();
  });

  it('collisionSettingsReset', function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({forbid: ['draw']})
    );
    var Resetted1 = Forbid.collisionSettingsReset();
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({defer: ['draw']})
    );
    var Resetted2 = Defer.collisionSettingsReset();
    var Regular = compose({
        methods: {
          draw: function () {}
        }
      }
    );

    expect(function () {compose(Resetted1, Resetted2)}).not.toThrow();
    expect(function () {compose(Resetted1, Regular)}).not.toThrow();
    expect(function () {compose(Resetted2, Resetted1)}).not.toThrow();
    expect(function () {compose(Regular, Resetted1)}).not.toThrow();
  });

  it('broken metadata', function () {
    var UndefinedMethod = Collision
      .collisionSetup({forbid: ['foo']})
      .compose({
        methods: {
          draw: null
        }
      });

    var NoDefer = compose(Collision, {
        methods: {
          draw: function () {}
        }
      }
    );
    NoDefer.compose.deepConfiguration.Collision.defer = null;

    var NoForbid = compose(Collision, {
        methods: {
          draw: function () {}
        }
      }
    );
    NoForbid.compose.deepConfiguration.Collision.forbid = null;


    expect(function () {compose(UndefinedMethod, NoForbid)}).not.toThrow();
    expect(function () {compose(UndefinedMethod, NoDefer)}).not.toThrow();
  });
});
