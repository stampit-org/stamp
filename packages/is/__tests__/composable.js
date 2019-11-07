/* eslint-disable func-names */

'use strict';

const isComposable = require('../composable');

function getStamp(obj) {
  const stamp = function() {};
  stamp.compose = function() {};
  Object.assign(stamp.compose, obj);
  return stamp;
}

describe('isComposable', function() {
  it('with objects', function() {
    const emptyStamp = getStamp();
    const rawObject = {};
    const rawFunction = function() {};
    const regExp = /x/;

    expect(isComposable(emptyStamp)).toBe(true);
    expect(isComposable(rawObject)).toBe(true);
    expect(isComposable(rawFunction)).toBe(true);
    expect(isComposable(regExp)).toBe(true);
  });

  it('with non-objects', function() {
    let undef;
    const NULL = null;
    const number = 42;
    const string = 's';

    expect(isComposable(undef)).toBe(false);
    expect(isComposable(NULL)).toBe(false);
    expect(isComposable(number)).toBe(false);
    expect(isComposable(string)).toBe(false);
  });
});
