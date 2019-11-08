/* eslint-disable jest/expect-expect */
/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/no-test-callback */
/* eslint-disable jest/no-export */
/* eslint-disable jest/require-top-level-describe */

'use strict';

const test = require('tape');
const _ = require('lodash');

module.exports = (compose) => {
  const mergeProps = ['deepProperties', 'staticDeepProperties', 'deepConfiguration'];

  test('Deep property merge', (nest) => {
    // Loop over each property that is merged and ensure
    // that merge implemented correctly.
    mergeProps.forEach((prop) => {
      const build = (num) => {
        const composable = () => {};
        composable.compose = () => {};
        composable.compose[prop] = { a: { merge: {} } };
        composable.compose[prop].a[num] = num;
        composable.compose[prop].a.merge[num] = num;

        return composable;
      };

      nest.test(`...${prop} merge 1`, (assert) => {
        const subject = compose(
          build(1),
          build(2)
        );
        const props = subject.compose;

        const actual = props[prop].a[1];
        const expected = 1;

        assert.equal(actual, expected, `${prop}should be merged from first argument`);

        assert.end();
      });

      nest.test(`...${prop} merge 2`, (assert) => {
        const subject = compose(
          build(1),
          build(2)
        );
        const props = subject.compose;

        const actual = props[prop].a[2];
        const expected = 2;

        assert.equal(actual, expected, `${prop} should be merged from 2nd argument`);

        assert.end();
      });

      nest.test(`...${prop} merge 3`, (assert) => {
        const subject = compose(
          build(1),
          build(2),
          build(3)
        );
        const props = subject.compose;

        const actual = props[prop].a[3];
        const expected = 3;

        assert.equal(actual, expected, `${prop}should be merged from subsequent arguments`);

        assert.end();
      });

      nest.test(`...${prop} merge collision`, (assert) => {
        const actual = compose(
          {
            deepProperties: {
              a: { b: 1 },
            },
          },
          {
            deepProperties: {
              a: { b: 2 },
            },
          }
        )().a;
        const expected = { b: 2 };

        assert.deepEqual(actual, expected, `${prop}conflicts should be merged with last-in priority.`);

        assert.end();
      });

      function deepMerge(a, b) {
        return compose(
          { [prop]: a },
          { [prop]: b }
        ).compose[prop];
      }

      nest.test('undefined does not replace object', (t) => {
        const a = {
          foo: { expected: true },
        };
        const b = {
          foo: undefined,
        };
        const expected = { expected: true };

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('object replaces null', (t) => {
        const a = {
          foo: null,
        };
        const b = {
          foo: { expected: true },
        };
        const expected = { expected: true };

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('level-one primitive replaced with object', (t) => {
        const actual = compose(
          {
            [prop]: 42,
          },
          {
            [prop]: { expected: true },
          }
        ).compose[prop];

        const expected = { expected: true };

        const expectedMsg = `result expected : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });
    });
  });

  test('Function merge', (nest) => {
    // Loop over each property that is merged and ensure
    // that merge implemented correctly.
    mergeProps.forEach((prop) => {
      nest.test(`...${prop} should assign functions source`, (assert) => {
        function F() {}

        F.x = 1;
        const actual = compose(
          {
            deepProperties: {
              a: { b: 1 },
            },
          },
          {
            deepProperties: {
              a: F,
            },
          }
        )().a;
        const expected = F;

        assert.strictEqual(actual, expected, `${prop}function must be assigned`);

        assert.end();
      });

      nest.test(`...${prop} should not merge to a function`, (assert) => {
        function F() {}

        F.x = 1;
        const actual = compose(
          {
            deepProperties: {
              a: F,
            },
          },
          {
            deepProperties: {
              a: { b: 1 },
            },
          }
        )().a;
        const expected = { b: 1 };

        assert.deepEqual(actual, expected, `${prop}function must be overwritten with plain object`);

        assert.end();
      });
    });
  });

  test('Deep array merge', (nest) => {
    // Loop over each property that is merged and ensure
    // that merge implemented correctly.
    mergeProps.forEach((prop) => {
      function deepMerge(a, b) {
        const c1 = {};
        c1[prop] = a;
        const c2 = {};
        c2[prop] = b;
        return compose(
          c1,
          c2
        ).compose[prop];
      }

      nest.test('array replaces object', (t) => {
        const a = {
          foo: {
            bar: 'bam',
          },
        };
        const b = {
          foo: ['a', 'b', 'c'],
        };
        const expected = ['a', 'b', 'c'];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);
        t.notEqual(actual, b.foo, 'array replacing object should be deep merged: c.foo !== b.foo');

        t.end();
      });

      nest.test('object replaces array', (t) => {
        const a = {
          foo: ['a', 'b', 'c'],
        };
        const b = {
          foo: {
            bar: 'bam',
          },
        };
        const expected = {
          bar: 'bam',
        };

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.notEqual(actual, b.foo, 'object replacing array should be deep merged: c.foo !== b.foo');

        t.end();
      });

      nest.test('array concat', (t) => {
        const a = {
          foo: [1, 2, 3],
        };
        const b = {
          foo: ['a', 'b', 'c'],
        };
        const expected = [1, 2, 3, 'a', 'b', 'c'];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);
        t.notEqual(actual, b.foo, 'array should be deep merged from right: c.foo === b.foo');

        t.end();
      });

      nest.test('number replaces array', (t) => {
        const a = {
          foo: [1, 2, 3],
        };
        const b = {
          foo: 99,
        };
        const expected = 99;

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces number', (t) => {
        const a = {
          foo: 99,
        };
        const b = {
          foo: [1, 2, 3],
        };
        const expected = [1, 2, 3];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('string replaces array', (t) => {
        const a = {
          foo: [1, 2, 3],
        };
        const b = {
          foo: 'abc',
        };
        const expected = 'abc';

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces string', (t) => {
        const a = {
          foo: 'abc',
        };
        const b = {
          foo: [1, 2, 3],
        };
        const expected = [1, 2, 3];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('boolean true replaces array', (t) => {
        const a = {
          foo: [1, 2, 3],
        };
        const b = {
          foo: true,
        };
        const expected = true;

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces boolean true', (t) => {
        const a = {
          foo: true,
        };
        const b = {
          foo: [1, 2, 3],
        };
        const expected = [1, 2, 3];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('boolean false replaces array', (t) => {
        const a = {
          foo: [1, 2, 3],
        };
        const b = {
          foo: false,
        };
        const expected = false;

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces boolean false', (t) => {
        const a = {
          foo: false,
        };
        const b = {
          foo: [1, 2, 3],
        };
        const expected = [1, 2, 3];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('null replaces array', (t) => {
        const a = {
          foo: [1, 2, 3],
        };
        const b = {
          foo: null,
        };
        const expected = null;

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces null', (t) => {
        const a = {
          foo: null,
        };
        const b = {
          foo: [1, 2, 3],
        };
        const expected = [1, 2, 3];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces undefined', (t) => {
        const a = {};
        const b = {
          foo: [1, _, _.noop],
        };
        const expected = [1, _, _.noop];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('undefined does not replace array', (t) => {
        const a = {
          foo: [1, _, _.noop],
        };
        const b = {
          foo: undefined,
        };
        const expected = [1, _, _.noop];

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('number replace array', (t) => {
        const a = {
          foo: [1, 2, 3],
        };
        const b = {
          foo: 42,
        };
        const expected = 42;

        const actual = deepMerge(a, b).foo;
        const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });
    });
  });
};
