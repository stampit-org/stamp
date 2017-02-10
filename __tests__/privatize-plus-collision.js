var compose = require('../packages/compose');
var Collision = require('../packages/collision');
var Privatize = require('../packages/privatize');

describe('Collision + Privatize', function () {
  it('work together', function () {
    var Stamp = compose(
      Collision,
      Privatize,
      {
        methods: {
          privateMethod: function () {}
        }
      }
    )
      .collisionProtectAnyMethod()
      .privatizeMethods('privateMethod');

    var obj = Stamp();

    expect(obj.privateMethod).toBeUndefined();
  });

  it('privatizes deferred methods', function () {
    // General purpose behavior to defer "draw()" method collisions
    var DeferDraw = Collision.collisionSetup({defer: ['draw']});

    var Border = compose(DeferDraw, {
      methods: {
        draw: jest.fn() // Spy function
      }
    });
    var Button = compose(DeferDraw, {
      methods: {
        draw: jest.fn() // Spy function
      }
    });

    // General purpose behavior to privatize the "draw()" method
    var PrivateDraw = Privatize.privatizeMethods('draw');

    // General purpose behavior to forbid the "redraw()" method collision
    var ForbidRedrawCollision = Collision.collisionSetup({forbid: ['redraw']});

    // The aggregating component
    var ModalDialog = compose(PrivateDraw) // privatize the "draw()" method
      .compose(Border, Button) // modal will consist of Border and Button
      .compose(ForbidRedrawCollision) // there can be only one "redraw()" method
      .compose({
        methods: {
          // the public method which calls the deferred private methods
          redraw: function (int) {
            this.draw(int);
          }
        }
      });

    // Creating an instance of the stamp
    var dialog = ModalDialog();

    // Check if the "draw()" method is actually privatized
    expect(dialog.draw).toBeUndefined();

    // Calling the public method, which calls the deferred private methods
    dialog.redraw(42);

    // Check if the spy "draw()" deferred functions were actually invoked
    expect(Border.compose.methods.draw).toBeCalledWith(42);
    expect(Button.compose.methods.draw).toBeCalledWith(42);

    // Make sure the ModalDialog throws every time on the "redraw()" collisions
    const HaveRedraw = compose({methods: {redraw: jest.fn()}});
    expect(function () {compose(ModalDialog, HaveRedraw)}).toThrow();
  });
});
