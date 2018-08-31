var compose = require("@stamp/compose");
var Collision = require("..");

describe("@stamp/collision", function () {
  it("defer", function () {
    var draw1 = jest.fn();
    draw1.mockReturnValueOnce({ a: 1 });
    var Defer1 = compose({
        methods: {
          draw: draw1
        }
      },
      Collision.collisionSetup({ defer: { methods: { draw: true } } })
    );
    var draw2 = jest.fn();
    draw2.mockReturnValueOnce({ b: 2 });
    var Defer2 = Collision.collisionSetup({ defer: { methods: { draw: true } } }).compose({
      methods: {
        draw: draw2
      }
    });

    var StampCombined = compose(Defer1, Defer2);
    var obj = StampCombined();

    var result = obj.draw();

    expect(result).toEqual([{ a: 1 }, { b: 2 }]);
    expect(draw1).toBeCalled();
    expect(draw2).toBeCalled();
  });

  it("defer + regular", function () {
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "defer" } })
    );
    var Regular = compose({ methods: { draw: function () {} } });

    expect(function () {compose(Defer, Regular);}).toThrow();
    expect(function () {compose(Regular, Defer);}).toThrow();
  });


  it("defer without conflicts", function () {
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "defer" } })
    );
    var Regular = compose({
      methods: {
        whatever: function () {}
      }
    });

    expect(function () {compose(Defer, Regular);}).not.toThrow();
    expect(function () {compose(Regular, Defer);}).not.toThrow();
  });

  it("forbid", function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "forbid" } })
    );
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "defer" } })
    );
    var Regular = compose({
        methods: {
          draw: function () {}
        }
      }
    );

    expect(function () {compose(Forbid, Defer);}).toThrow();
    expect(function () {compose(Defer, Forbid);}).toThrow();

    expect(function () {compose(Regular, Forbid);}).toThrow();
    expect(function () {compose(Forbid, Regular);}).toThrow();
  });

  it("forbid + allow", function () {
    expect(function () {Collision.collisionSetup({ methods: { foo: "allow" } });}).toThrow(/Collision/);
  });

  it("can be used as a standalone function", function () {
    var collisionSetup = Collision.collisionSetup;
    expect(function () {collisionSetup({ methods: { foo: "allow" } });}).toThrow(/Collision/);
  });

  it("forbid without conflicts", function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "forbid" } })
    );
    var Regular = compose({
        methods: {
          whatever: function () {}
        }
      }
    );

    expect(function () {compose(Forbid, Regular);}).not.toThrow();
    expect(function () {compose(Regular, Forbid);}).not.toThrow();
  });

  it("collisionSettingsReset", function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "forbid" } })
    );
    var Resetted1 = Forbid.collisionSettingsReset();
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "defer" } })
    );
    var Resetted2 = Defer.collisionSettingsReset();
    var Regular = compose({
        methods: {
          draw: function () {}
        }
      }
    );

    expect(function () {compose(Resetted1, Resetted2);}).not.toThrow();
    expect(function () {compose(Resetted1, Regular);}).not.toThrow();
    expect(function () {compose(Resetted2, Resetted1);}).not.toThrow();
    expect(function () {compose(Regular, Resetted1);}).not.toThrow();
  });

  it("broken metadata", function () {
    var UndefinedMethod = Collision
    .collisionSetup({ methods: { foo: "forbid" } })
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


    expect(function () {compose(UndefinedMethod, NoForbid);}).not.toThrow();
    expect(function () {compose(UndefinedMethod, NoDefer);}).not.toThrow();
  });
});
