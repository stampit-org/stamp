/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-test-callback */
/* eslint-disable jest/no-export */
/* eslint-disable jest/require-top-level-describe */

'use strict';

const test = require('tape');

module.exports = (compose) => {
  test('compose function', (assert) => {
    const actual = typeof compose;
    const expected = 'function';

    assert.equal(actual, expected, 'compose should be a function.');

    assert.end();
  });
};
