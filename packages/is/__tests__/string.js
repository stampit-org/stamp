var isString = require('../string');

describe('isString', function () {
  it('with strings', function () {
    expect(isString('')).toBe(true);
    expect(isString('my string')).toBe(true);
  });

  it('with non plain objects', function () {
    expect(isString(new Array(1))).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString(new Promise(function(){}))).toBe(false);
    expect(isString(function () {})).toBe(false);
    expect(isString(1)).toBe(false);
    expect(isString(Symbol)).toBe(false);
  });
});
