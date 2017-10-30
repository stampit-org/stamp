var compose = require('@stamp/compose');
var Named = require('..');

// This test can be executed by Jest testing framework only.
// Its minimal node.js supported version is 4. Same as this stamp.
// Thus, there is no risk running these test in a non-supported platform.
describe('@stamp/named', function () {
  it('default name is "Stamp"', function () {
    var S = compose();
    expect(S.name).toBe('Stamp');
  });

  it('setName sets the name', function () {
    var S = compose(Named).setName('foo');
    expect(S.name).toBe('foo');
  });

  it('setName overwrites existing name', function () {
    var S = compose(Named).setName('foo');
    expect(S.setName('bar').name).toBe('bar');
  });

  it('can be used as a standalone function', function () {
    var setName = Named.setName;
    var S = setName('foo');
    expect(S.name).toBe('foo');
  });
});
