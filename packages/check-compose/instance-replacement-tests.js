/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-test-callback */
/* eslint-disable jest/no-export */
/* eslint-disable jest/require-top-level-describe */

'use strict';

const test = require('tape');

module.exports = (compose) => {
  [0, 1, null, NaN, 'string', true, false].forEach((obj) => {
    test(`initializer returns ${obj}`, (assert) => {
      compose({
        initializers: [
          () => {
            return obj;
          },
          (options, o) => {
            const { instance } = o;
            const actual = typeof instance;
            const expected = typeof obj;

            assert.equal(actual, expected, 'initializer return value should replace instance');

            assert.end();
          },
        ],
      })();
    });
  });

  test('initializer returns undefined', (assert) => {
    compose({
      initializers: [
        () => {
          return undefined;
        },
        (options, o) => {
          const { instance } = o;
          const actual = typeof instance;
          const expected = 'object';

          assert.equal(actual, expected, 'initializer return value should not replace instance');

          assert.end();
        },
      ],
    })();
  });

  test('instance replacement', (assert) => {
    const message = 'instance replaced';
    const newInstance = {
      message,
    };

    const obj = compose({
      initializers: [
        () => {
          return newInstance;
        },
      ],
    })();

    const actual = obj.message;
    const expected = message;

    assert.equal(actual, expected, 'the replaced instance value should be returned from the stamp');

    assert.end();
  });
};
