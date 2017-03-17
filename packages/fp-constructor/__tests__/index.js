var compose = require('@stamp/compose');
var FpConstructor = require('..');

describe('@stamp/fp-constructor', function () {
  it('adds .constructor static method', function () {
    var Stamp = compose(FpConstructor);

    expect(typeof Stamp.constructor).toBe('function');
  });

  it('adds .constructor should be the stamp itself', function () {
    var Stamp = compose(FpConstructor);

    expect(Stamp.constructor).toBe(Stamp);
  });
});
