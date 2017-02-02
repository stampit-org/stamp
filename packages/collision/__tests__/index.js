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
      Collision.setupCollision({defer: ['draw']})
    );
    var draw2 = jest.fn();
    var Defer2 = Collision.setupCollision({defer: ['draw']}).compose({
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

  it('forbid', function () {
    var Forbid = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.setupCollision({forbid: ['draw']})
    );
    var Defer = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.setupCollision({defer: ['draw']})
    );
    var Allow = compose({
        methods: {
          draw: function () {}
        }
      },
      Collision.setupCollision({allow: ['draw']})
    );

    expect(function () {compose(Forbid, Defer)}).toThrow();
    expect(function () {compose(Forbid, Allow)}).toThrow();
  })
});
