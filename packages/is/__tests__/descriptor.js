/* eslint-disable func-names */

const isDescriptor = require('../descriptor');

function getStamp(obj) {
  const stamp = function() {};
  stamp.compose = function() {};
  Object.assign(stamp.compose, obj);
  return stamp;
}

describe('isDescriptor', function() {
  it('with objects', function() {
    const emptyStampDescriptor = getStamp().compose;
    const rawObject = {};
    const rawFunction = function() {};
    const regExp = /x/;

    expect(isDescriptor(emptyStampDescriptor)).toBe(true);
    expect(isDescriptor(rawObject)).toBe(true);
    expect(isDescriptor(rawFunction)).toBe(true);
    expect(isDescriptor(regExp)).toBe(true);
  });

  it('with non-objects', function() {
    let undef;
    const NULL = null;
    const number = 42;
    const string = 's';

    expect(isDescriptor(undef)).toBe(false);
    expect(isDescriptor(NULL)).toBe(false);
    expect(isDescriptor(number)).toBe(false);
    expect(isDescriptor(string)).toBe(false);
  });
});
