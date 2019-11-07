/* eslint-disable func-names */

'use strict';

const compose = require('@stamp/compose');
const InstanceOf = require('..');

describe('instanceOf', function() {
  if (typeof Symbol === 'undefined') return;

  it('should just work', function() {
    const MyComposedStamp = compose(InstanceOf);
    const obj = MyComposedStamp();

    expect(obj).toBeInstanceOf(MyComposedStamp);
    expect(obj instanceof MyComposedStamp).toBe(true);
  });

  it('should return false for wrong things', function() {
    const MyComposedStamp = compose(InstanceOf);
    const obj = MyComposedStamp();

    expect({} instanceof MyComposedStamp).toBe(false);
    expect(MyComposedStamp.compose()() instanceof MyComposedStamp).toBe(false);
    expect(obj instanceof InstanceOf).toBe(false);
    expect(obj instanceof MyComposedStamp.compose()).toBe(false);
    expect(obj instanceof compose()).toBe(false);
    expect(obj instanceof RegExp).toBe(false);
    expect(obj instanceof Array).toBe(false);
    expect(obj instanceof Function).toBe(false);
    expect(obj instanceof String).toBe(false);
  });
});
