/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-test-callback */
/* eslint-disable jest/no-export */
/* eslint-disable jest/require-top-level-describe */

'use strict';

const test = require('tape');
const _ = require('lodash');

module.exports = (compose) => {
  const createDescriptors = () => {
    const a = {
      value: 'a',
      writable: false,
      configurable: false,
      enumerable: false,
    };
    const b = _.assign({}, a);
    const descriptors = { a, b };
    return descriptors;
  };

  test('stamp', (nest) => {
    nest.test('...with propertyDescriptors', (assert) => {
      const descriptors = createDescriptors();
      const { b } = descriptors;

      const obj = compose({
        propertyDescriptors: _.assign({}, descriptors),
      })();

      const actual = Object.getOwnPropertyDescriptor(obj, 'b');
      const expected = _.assign({}, b);

      assert.deepEqual(actual, expected, 'should assign propertyDescriptors to instances');

      assert.end();
    });

    nest.test('...with malformed propertyDescriptors', (assert) => {
      [0, 'a', null, undefined, {}, NaN, /regexp/].forEach((propertyValue) => {
        const actual = compose({
          propertyDescriptors: propertyValue,
        })();
        const expected = compose()();

        assert.deepEqual(actual, expected, 'should not any properties instances');
      });

      assert.end();
    });

    nest.test('...with malformed staticPropertyDescriptors', (assert) => {
      [0, 'a', null, undefined, {}, NaN, /regexp/].forEach((propertyValue) => {
        const stamp = compose({
          staticPropertyDescriptors: propertyValue,
        });
        const actual = _.values(stamp.compose).filter((value) => {
          return !_.isEmpty(value);
        });
        const expected = _.values(compose().compose);

        assert.deepEqual(actual, expected, 'should not add any descriptor data');
      });

      assert.end();
    });

    nest.test('...with propertyDescriptors and existing prop conflict', (assert) => {
      const descriptors = createDescriptors();

      const obj = compose(
        {
          properties: {
            a: 'existing prop',
          },
        },
        {
          propertyDescriptors: _.assign({}, descriptors),
        }
      )();

      const actual = obj.a;
      const expected = 'a';

      assert.deepEqual(actual, expected, 'should assign propertyDescriptors to instances & override existing prop');

      assert.end();
    });

    nest.test('...with staticPropertyDescriptors', (assert) => {
      const descriptors = createDescriptors();
      const { b } = descriptors;

      const stamp = compose({
        staticPropertyDescriptors: _.assign({}, descriptors),
      });

      const actual = Object.getOwnPropertyDescriptor(stamp, 'b');
      const expected = _.assign({}, b);

      assert.deepEqual(actual, expected, 'should assign staticPropertyDescriptors to stamp');

      assert.end();
    });
  });
};
