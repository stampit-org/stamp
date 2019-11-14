'use strict';

const test = require('tape');
const _ = require('lodash');

module.exports = (compose) => {
  test('compose static properties with POJO', (assert) => {
    const expected = {
      a: 'a',
      b: 'b',
    };

    const { staticProperties } = compose(
      {
        staticProperties: {
          a: 'a',
        },
      },
      {
        staticProperties: {
          b: 'b',
        },
      }
    ).compose;
    const actual = _.pick(staticProperties, _.keys(expected));

    assert.deepEqual(actual, expected, 'should compose staticProperties into descriptor');

    assert.end();
  });

  test('compose static properties with stamp', (assert) => {
    const expected = compose({
      staticProperties: {
        a: 'a',
        b: 'b',
      },
    }).compose.staticProperties;

    const actual = compose(
      {
        staticProperties: {
          a: 'a',
        },
      },
      {
        staticProperties: {
          b: 'b',
        },
      }
    ).compose.staticProperties;

    assert.deepEqual(actual, expected, 'should compose staticProperties into descriptor');

    assert.end();
  });

  test('compose static deep properties with POJO', (assert) => {
    const expected = {
      a: 'a',
      b: 'b',
    };

    const { staticDeepProperties } = compose(
      {
        staticDeepProperties: {
          a: 'a',
        },
      },
      {
        staticDeepProperties: {
          b: 'b',
        },
      }
    ).compose;
    const actual = _.pick(staticDeepProperties, _.keys(expected));

    assert.deepEqual(actual, expected, 'should compose staticDeepProperties into descriptor');

    assert.end();
  });

  test('compose static deep properties with stamp', (assert) => {
    const expected = compose({
      staticDeepProperties: {
        a: 'a',
        b: 'b',
      },
    }).compose.staticDeepProperties;

    const actual = compose(
      {
        staticDeepProperties: {
          a: 'a',
        },
      },
      {
        staticDeepProperties: {
          b: 'b',
        },
      }
    ).compose.staticDeepProperties;

    assert.deepEqual(actual, expected, 'should compose staticDeepProperties into descriptor');

    assert.end();
  });
};
