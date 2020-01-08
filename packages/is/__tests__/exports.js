/* eslint-disable global-require */

'use strict';

describe('exports', function() {
  it('isComposable', function() {
    expect(require('../composable').default).toBe(require('../').isComposable);
  });

  it('isDescriptor', function() {
    expect(require('../descriptor').default).toBe(require('../').isDescriptor);
  });

  it('isStamp', function() {
    expect(require('../stamp').default).toBe(require('../').isStamp);
  });
});
