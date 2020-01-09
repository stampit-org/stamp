/* eslint-disable jest/prefer-called-with */
/* eslint-disable jest/require-to-throw-message */

'use strict';

const compose = require('@stamp/compose');
const Collision = require('..');

describe('@stamp/collision', function() {
  it('defer', function() {
    const draw1 = jest.fn();
    draw1.mockReturnValueOnce({ a: 1 });
    const Defer1 = compose(
      {
        methods: {
          draw: draw1,
        },
      },
      Collision.collisionSetup({ defer: ['draw'] })
    );
    const draw2 = jest.fn();
    draw2.mockReturnValueOnce({ b: 2 });
    const Defer2 = Collision.collisionSetup({ defer: ['draw'] }).compose({
      methods: {
        draw: draw2,
      },
    });

    const StampCombined = compose(Defer1, Defer2);
    const obj = StampCombined();

    const result = obj.draw();

    expect(result).toStrictEqual([{ a: 1 }, { b: 2 }]);
    expect(draw1).toHaveBeenCalled();
    expect(draw2).toHaveBeenCalled();
  });

  it('defer + regular', function() {
    const Defer = compose(
      {
        methods: {
          draw() {},
        },
      },
      Collision.collisionSetup({ defer: ['draw'] })
    );
    const Regular = compose({ methods: { draw() {} } });

    expect(function() {
      compose(Defer, Regular);
    }).toThrow();
    expect(function() {
      compose(Regular, Defer);
    }).toThrow();
  });

  it('defer without conflicts', function() {
    const Defer = compose(
      {
        methods: {
          draw() {},
        },
      },
      Collision.collisionSetup({ defer: ['draw'] })
    );
    const Regular = compose({
      methods: {
        whatever() {},
      },
    });

    expect(function() {
      compose(Defer, Regular);
    }).not.toThrow();
    expect(function() {
      compose(Regular, Defer);
    }).not.toThrow();
  });

  it('forbid', function() {
    const Forbid = compose(
      {
        methods: {
          draw() {},
        },
      },
      Collision.collisionSetup({ forbid: ['draw'] })
    );
    const Defer = compose(
      {
        methods: {
          draw() {},
        },
      },
      Collision.collisionSetup({ defer: ['draw'] })
    );
    const Regular = compose({
      methods: {
        draw() {},
      },
    });

    expect(function() {
      compose(Forbid, Defer);
    }).toThrow();
    expect(function() {
      compose(Defer, Forbid);
    }).toThrow();

    expect(function() {
      compose(Regular, Forbid);
    }).toThrow();
    expect(function() {
      compose(Forbid, Regular);
    }).toThrow();
  });

  it('collisionProtectAnyMethod', function() {
    const FooBar = compose(
      {
        methods: {
          foo() {},
          bar() {},
        },
      },
      Collision.collisionProtectAnyMethod()
    );
    const Foo = compose(
      {
        methods: {
          foo() {},
        },
      },
      Collision.collisionProtectAnyMethod()
    );
    const Bar = compose(
      {
        methods: {
          bar() {},
        },
      },
      Collision.collisionProtectAnyMethod()
    );

    expect(function() {
      compose(FooBar, Foo);
    }).toThrow();
    expect(function() {
      compose(Foo, FooBar);
    }).toThrow();
    expect(function() {
      compose(FooBar, Bar);
    }).toThrow();
    expect(function() {
      compose(Bar, FooBar);
    }).toThrow();
    expect(function() {
      compose(Foo, Bar);
    }).not.toThrow();
    expect(function() {
      compose(Bar, Foo);
    }).not.toThrow();
  });

  it('collisionProtectAnyMethod multiple times same stamp', function() {
    const Base = compose(
      {
        methods: {
          foo() {},
          bar() {},
        },
      },
      Collision.collisionProtectAnyMethod()
    );
    const Stamp1 = compose(Base);
    const Stamp2 = compose(Base);
    const Stamp3 = compose(Base);

    expect(function() {
      compose(Stamp1, Stamp2);
    }).not.toThrow();
    expect(function() {
      compose(Stamp1, Stamp2, Stamp3);
    }).not.toThrow();
    expect(function() {
      compose(Stamp1).compose(Stamp2, Stamp3);
    }).not.toThrow();
    expect(function() {
      compose(Stamp1, Stamp2).compose(Stamp3);
    }).not.toThrow();
  });

  it('collisionProtectAnyMethod + allow', function() {
    const FooBar = compose(
      {
        methods: {
          foo() {},
          bar() {},
        },
      },
      Collision.collisionProtectAnyMethod({ allow: ['foo'] })
    );
    const Foo = compose(
      {
        methods: {
          foo() {},
        },
      },
      Collision.collisionProtectAnyMethod()
    );
    const Bar = compose(
      {
        methods: {
          bar() {},
        },
      },
      Collision.collisionProtectAnyMethod()
    );

    expect(function() {
      compose(FooBar, Foo);
    }).not.toThrow();
    expect(function() {
      compose(Foo, FooBar);
    }).not.toThrow();
    expect(function() {
      compose(FooBar, Bar);
    }).toThrow();
    expect(function() {
      compose(Bar, FooBar);
    }).toThrow();
    expect(function() {
      compose(Foo, Bar);
    }).not.toThrow();
    expect(function() {
      compose(Bar, Foo);
    }).not.toThrow();
  });

  it('forbid + allow', function() {
    expect(function() {
      Collision.collisionSetup({ allow: ['foo'], forbid: ['foo'] });
    }).toThrow(/Collision/);
  });

  it('can be used as a standalone function', function() {
    const { collisionSetup } = Collision;
    expect(function() {
      collisionSetup({ allow: ['foo'], forbid: ['foo'] });
    }).toThrow(/Collision/);
  });

  it('forbid without conflicts', function() {
    const Forbid = compose(
      {
        methods: {
          draw() {},
        },
      },
      Collision.collisionSetup({ forbid: ['draw'] })
    );
    const Regular = compose({
      methods: {
        whatever() {},
      },
    });

    expect(function() {
      compose(Forbid, Regular);
    }).not.toThrow();
    expect(function() {
      compose(Regular, Forbid);
    }).not.toThrow();
  });

  it('collisionSettingsReset', function() {
    const Forbid = compose(
      {
        methods: {
          draw() {},
        },
      },
      Collision.collisionSetup({ forbid: ['draw'] })
    );
    const Resetted1 = Forbid.collisionSettingsReset();
    const Defer = compose(
      {
        methods: {
          draw() {},
        },
      },
      Collision.collisionSetup({ defer: ['draw'] })
    );
    const Resetted2 = Defer.collisionSettingsReset();
    const Regular = compose({
      methods: {
        draw() {},
      },
    });

    expect(function() {
      compose(Resetted1, Resetted2);
    }).not.toThrow();
    expect(function() {
      compose(Resetted1, Regular);
    }).not.toThrow();
    expect(function() {
      compose(Resetted2, Resetted1);
    }).not.toThrow();
    expect(function() {
      compose(Regular, Resetted1);
    }).not.toThrow();
  });

  it('broken metadata', function() {
    const UndefinedMethod = Collision.collisionSetup({ forbid: ['foo'] }).compose({
      methods: {
        draw: null,
      },
    });

    const NoDefer = compose(Collision, {
      methods: {
        draw() {},
      },
    });
    NoDefer.compose.deepConfiguration.Collision.defer = null;

    const NoForbid = compose(Collision, {
      methods: {
        draw() {},
      },
    });
    NoForbid.compose.deepConfiguration.Collision.forbid = null;

    expect(function() {
      compose(UndefinedMethod, NoForbid);
    }).not.toThrow();
    expect(function() {
      compose(UndefinedMethod, NoDefer);
    }).not.toThrow();
  });
});
