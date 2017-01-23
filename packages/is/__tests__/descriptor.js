var isDescriptor = require('../descriptor');

function getStamp(obj) {
  var stamp = function () {};
  stamp.compose = function () {};
  Object.assign(stamp.compose, obj);
  return stamp;
}

describe('isDescriptor', function () {
  it('with objects', function () {
    var emptyStampDescriptor = getStamp().compose;
    var rawObject = {};
    var rawFunction = function () {};
    var regExp = /x/;

    expect(isDescriptor(emptyStampDescriptor)).toBeTruthy();
    expect(isDescriptor(rawObject)).toBeTruthy();
    expect(isDescriptor(rawFunction)).toBeTruthy();
    expect(isDescriptor(regExp)).toBeTruthy();
  });

  it('with non-objects', function () {
    var undef;
    var NULL = null;
    var number = 42;
    var string = 's';

    expect(isDescriptor(undef)).toBeFalsy();
    expect(isDescriptor(NULL)).toBeFalsy();
    expect(isDescriptor(number)).toBeFalsy();
    expect(isDescriptor(string)).toBeFalsy();
  });
});
