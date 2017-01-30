var isPlainObject = require('../plain-object');

describe('isPlainObject', function () {
  it('with plain objects', function () {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({a: 1})).toBe(true);
  });

  it('with non plain objects', function () {
    expect(isPlainObject(new Array())).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Promise(function(){}))).toBe(false);
    expect(isPlainObject(function () {})).toBe(false);
    expect(isPlainObject(1)).toBe(false);
    expect(isPlainObject('string')).toBe(false);
  });
});
