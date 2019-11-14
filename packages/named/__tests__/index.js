'use strict';

const compose = require('@stamp/compose');
const Named = require('..');

// This test can be executed by Jest testing framework only.
// Its minimal node.js supported version is 4. Same as this stamp.
// Thus, there is no risk running these test in a non-supported platform.
describe('@stamp/named', function() {
  it('default name is "Stamp"', function() {
    const S = compose();
    expect(S.name).toBe('Stamp');
  });

  it('setName sets the name', function() {
    const S = compose(Named).setName('foo');
    expect(S.name).toBe('foo');
  });

  it('setName overwrites existing name', function() {
    const S = compose(Named).setName('foo');
    expect(S.setName('bar').name).toBe('bar');
  });

  it('can be used as a standalone function', function() {
    const { setName } = Named;
    const S = setName('foo');
    expect(S.name).toBe('foo');
  });
});
