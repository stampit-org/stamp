var isStamp = require('../stamp');

function getStamp(obj) {
  var stamp = function () {};
  stamp.compose = function () {};
  Object.assign(stamp.compose, obj);
  return stamp;
}

describe('isStamp', function () {
  it('with stamps', function () {
    var emptyStamp = getStamp();
    var refsOnlyStamp = getStamp({properties: {foo: 'bar'}});
    var methodsOnlyStamp = getStamp({methods: {method: function () {}}});
    var closureOnlyStamp = getStamp({initializers: [function () {}]});

    expect(isStamp(emptyStamp)).toBeTruthy();
    expect(isStamp(refsOnlyStamp)).toBeTruthy();
    expect(isStamp(methodsOnlyStamp)).toBeTruthy();
    expect(isStamp(closureOnlyStamp)).toBeTruthy();
  });

  it('isStamp() with non stamps', function () {
    var undef;
    var rawObject = {refs: {}, methods: {}, init: {}, compose: {}, props: {}};
    var rawFunction = function () {
      this.init = this;
    };
    var regExp = /x/;

    expect(isStamp(undef)).toBeFalsy();
    expect(isStamp(rawObject)).toBeFalsy();
    expect(isStamp(rawFunction)).toBeFalsy();
    expect(isStamp(regExp)).toBeFalsy();
  });
});
