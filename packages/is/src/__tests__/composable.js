var isComposable = require('../composable');

function getStamp(obj) {
  var stamp = function () {};
  stamp.compose = function () {};
  Object.assign(stamp.compose, obj);
  return stamp;
}

describe('isComposable', function () {
  it('with objects', function () {
    var emptyStamp = getStamp();
    var rawObject = {};
    var rawFunction = function () {};
    var regExp = /x/;

    expect(isComposable(emptyStamp)).toBeTruthy();
    expect(isComposable(rawObject)).toBeTruthy();
    expect(isComposable(rawFunction)).toBeTruthy();
    expect(isComposable(regExp)).toBeTruthy();
  });

  it('with non-objects', function () {
    var undef;
    var NULL = null;
    var number = 42;
    var string = 's';

    expect(isComposable(undef)).toBeFalsy();
    expect(isComposable(NULL)).toBeFalsy();
    expect(isComposable(number)).toBeFalsy();
    expect(isComposable(string)).toBeFalsy();
  });
});
