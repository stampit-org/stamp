var compose = require("@stamp/compose");
var assign = require("@stamp/core").assign;
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
      Collision.collisionSetup({ methods: { draw: "defer" } })
    );
    var draw2 = jest.fn();
    draw2.mockReturnValueOnce({ b: 2 });
    var Defer2 = Collision.collisionSetup({ methods: { draw: "defer" } }).compose({
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

  it("pipe", function () {
    function toJSON1(previous) { return assign({}, previous, { a: 1 });}

    var Pipe1 = compose({
        methods: {
          toJSON: toJSON1
        }
      },
      Collision.collisionSetup({ methods: { toJSON: "pipe" } })
    );

    function toJSON2(previous) { return assign({}, previous, { b: 2 });}

    var Pipe2 = Collision.collisionSetup({ methods: { toJSON: "pipe" } }).compose({
      methods: {
        toJSON: toJSON2
      }
    });

    var StampCombined = compose(Pipe1, Pipe2);
    var obj = StampCombined();

    var result = obj.toJSON();

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("pipe + regular", function () {
    var Pipe = compose({
        methods: {
          toJSON: function () {}
        }
      },
      Collision.collisionSetup({ methods: { toJSON: "pipe" } })
    );
    var Regular = compose({ methods: { toJSON: function () {} } });

    expect(function () {compose(Pipe, Regular);}).toThrow();
    expect(function () {compose(Regular, Pipe);}).toThrow();
  });


  it("pipe without conflicts", function () {
    var Pipe = compose({
        methods: {
          toJSON: function () {}
        }
      },
      Collision.collisionSetup({ methods: { toJSON: "pipe" } })
    );
    var Regular = compose({
      methods: {
        whatever: function () {}
      }
    });

    expect(function () {compose(Pipe, Regular);}).not.toThrow();
    expect(function () {compose(Regular, Pipe);}).not.toThrow();
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

    expect(function () {compose(Forbid, Defer);}).toThrow(/Collision/);
    expect(function () {compose(Defer, Forbid);}).toThrow(/Collision/);

    expect(function () {compose(Regular, Forbid);}).toThrow(/Collision/);
    expect(function () {compose(Forbid, Regular);}).toThrow(/Collision/);
  });

  it("forbid everything", function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        },
        properties: {
          height: 0
        }
      },
      Collision.collisionSetup("forbid")
    );
    var Method = compose({
        methods: {
          draw: function () {}
        }
      }
    );
    var Property = compose({
        properties: {
          height: null
        }
      }
    );

    expect(function () {compose(Forbid, Method);}).toThrow(/Collision/);
    expect(function () {compose(Method, Forbid);}).toThrow(/Collision/);
    expect(function () {compose(Property, Forbid);}).toThrow(/Collision/);
    expect(function () {compose(Forbid, Property);}).toThrow(/Collision/);
  });

  it("can be used as a standalone function", function () {
    var collisionSetup = Collision.collisionSetup;
    expect(typeof collisionSetup({ methods: { foo: "allow" } })).toBe("function");
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

  it("resetting settings", function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "forbid" } })
    );
    var Resetted1 = Forbid.collisionSetup(null);
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.collisionSetup({ methods: { draw: "defer" } })
    );
    var Resetted2 = Defer.collisionSetup(null);
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
    })
    .compose({
      methods: {
        draw: "BAADFOOD"
      }
    });

    var NoDefer = compose(Collision, {
        methods: {
          draw: function () {}
        }
      }
    );
    NoDefer.compose.deepConfiguration = {};
    NoDefer.compose.deepConfiguration.Collision = {};
    NoDefer.compose.deepConfiguration.Collision.defer = null;

    var NoForbid = compose(Collision, {
        methods: {
          draw: function () {}
        }
      }
    );
    NoForbid.compose.deepConfiguration = {};
    NoForbid.compose.deepConfiguration.Collision = {};
    NoForbid.compose.deepConfiguration.Collision.forbid = null;
    NoForbid.compose.methods.random = "not function";

    var Malformed = compose(Collision, {
        methods: {
          draw: function () {}
        }
      }
    );
    Malformed.compose.deepConfiguration = {};
    Malformed.compose.deepConfiguration.Collision = null;


    expect(function () {compose(UndefinedMethod, NoForbid);}).not.toThrow();
    expect(function () {compose(UndefinedMethod, NoDefer);}).not.toThrow();


    expect(function () {compose(null, Malformed, UndefinedMethod, NoDefer, Malformed, { compose: null });}).not.toThrow();
  });
});
