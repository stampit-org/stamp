'use strict';

const isStamp = require('../stamp');

function getStamp(obj) {
  const stamp = function() {};
  stamp.compose = function() {};
  Object.assign(stamp.compose, obj);
  return stamp;
}

describe('isStamp', function() {
  it('with stamps', function() {
    const emptyStamp = getStamp();
    const refsOnlyStamp = getStamp({ properties: { foo: 'bar' } });
    const methodsOnlyStamp = getStamp({ methods: { method() {} } });
    const closureOnlyStamp = getStamp({ initializers: [function() {}] });

    expect(isStamp(emptyStamp)).toBe(true);
    expect(isStamp(refsOnlyStamp)).toBe(true);
    expect(isStamp(methodsOnlyStamp)).toBe(true);
    expect(isStamp(closureOnlyStamp)).toBe(true);
  });

  it('isStamp() with non stamps', function() {
    let undef;
    const rawObject = { refs: {}, methods: {}, init: {}, compose: {}, props: {} };
    const rawFunction = function() {
      this.init = this;
    };
    const regExp = /x/;

    expect(isStamp(undef)).toBe(false);
    expect(isStamp(rawObject)).toBe(false);
    expect(isStamp(rawFunction)).toBe(false);
    expect(isStamp(regExp)).toBe(false);
  });
});
