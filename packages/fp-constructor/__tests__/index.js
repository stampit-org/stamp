var compose = require('@stamp/compose');
var FpConstructor = require('..');

describe('@stamp/fp-constructor', function() {
  it('adds .constructor should be the stamp itself', function() {
    var Stamp = compose(FpConstructor);

    expect(Stamp.constructor).toBe(Stamp);
  });

  it('.constructor presence regardless of composition chain', function() {
    var Stamp = compose({staticProperties: {constructor: 1}})
      .compose(
        {staticProperties: {constructor: 2}},
        FpConstructor,
        {staticProperties: {constructor: 3}}
      ).compose({staticProperties: {constructor: 4}});

    expect(Stamp.constructor).toBe(Stamp);
  });
});
