'use strict';

const test = require('tape');
const _ = require('lodash');

module.exports = (compose) => {
  const build = (num) => {
    const composable = () => {};
    composable.compose = () => {};
    composable.compose.initializers = [
      () => {
        return { num };
      },
    ];

    return composable;
  };

  const buildInitializers = () => {
    const composable = () => {};
    composable.compose = () => {};
    composable.compose.initializers = [
      (options, o) => {
        const { instance } = o;
        return _.assign(instance, {
          a: 'a',
          override: 'a',
        });
      },
      (options, o) => {
        const { instance } = o;
        return _.assign(instance, {
          b: 'b',
        });
      },
      (options, o) => {
        const { instance } = o;
        return _.assign(instance, {
          override: 'c',
        });
      },
    ];
    return composable;
  };

  test('compose()', (nest) => {
    nest.test('...with no initializers', (assert) => {
      const expected = _.size(compose().compose.initializers);
      const subject = compose({
        initializers: [0, 'a', null, undefined, {}, NaN, /regexp/],
      });
      const actual = _.size(subject.compose.initializers);

      assert.equal(actual, expected, 'should not add any initializers');

      assert.end();
    });

    nest.test('...with two initializers', (assert) => {
      const subject = compose(build(1), build(2));
      const { initializers } = subject.compose;

      const actual = initializers[0]().num;
      const expected = 1;

      assert.equal(actual, expected, 'should add initializer from first composable');

      assert.end();
    });

    nest.test('...with two initializers', (assert) => {
      const subject = compose(build(1), build(2));
      const { initializers } = subject.compose;

      const actual = initializers[1]().num;
      const expected = 2;

      assert.equal(actual, expected, 'should add initializer from second composable');

      assert.end();
    });

    nest.test('...with three initializers', (assert) => {
      const subject = compose(build(1), build(2), build(3));
      const { initializers } = subject.compose;

      const actual = initializers[2]().num;
      const expected = 3;

      assert.equal(actual, expected, 'should add initializer from subsequent composables');

      assert.end();
    });

    nest.test('...with identical initializers', (assert) => {
      const stamp1 = build(1);
      const stamp2 = build(2);
      const stamp3 = build(3);
      stamp2.compose.initializers = stamp1.compose.initializers.slice();
      stamp3.compose.initializers = stamp1.compose.initializers.slice();
      stamp3.compose.initializers.push(stamp3.compose.initializers[0]);
      const subject = compose(stamp1, stamp2, stamp3);
      const { initializers } = subject.compose;

      const actual = initializers.length;
      const expected = 1;

      assert.equal(actual, expected, 'should not add same initializer more than once');

      assert.end();
    });

    nest.test('...with identical initializers in a single argument', (assert) => {
      const stamp1 = build(1);
      stamp1.compose.initializers.push(stamp1.compose.initializers[0]);
      const subject = compose(stamp1);
      const { initializers } = subject.compose;

      const actual = initializers.length;
      const expected = 1;

      assert.equal(actual, expected, 'should not add same initializer more than once');

      assert.end();
    });
  });

  test('stamp()', (nest) => {
    nest.test('...with initializers', (assert) => {
      const composable = () => {};
      composable.compose = () => {};
      composable.compose.properties = {
        instanceProps: true,
      };
      composable.compose.initializers = [
        function (a, o) {
          const { stampOption } = a;
          const { instance } = o;
          const { stamp } = o;
          const { args } = o;
          assert.equal(args.length, 3);
          const expected = {
            correctThisValue: true,
            hasOptions: true,
            hasInstance: true,
            hasStamp: true,
            argsLength: true,
          };

          const actual = _.pick(
            {
              correctThisValue: this === instance,
              hasOptions: Boolean(stampOption),
              hasInstance: Boolean(instance.instanceProps),
              hasStamp: Boolean(stamp.compose),
              argsLength: args.length === 3,
            },
            _.keys(expected)
          );

          assert.deepEqual(actual, expected, 'should call initializer with correct signature');

          assert.end();
        },
      ];
      const testStamp = compose(composable);

      testStamp({ stampOption: true }, 1, 2);
    });

    nest.test('...with overrides in initializer', (assert) => {
      const stamp = buildInitializers();

      const expected = {
        a: 'a',
        b: 'b',
        override: 'c',
      };
      const actual = _.pick(compose(stamp)(), _.keys(expected));

      assert.deepEqual(actual, expected, 'should apply initializers with last-in priority');

      assert.end();
    });

    nest.test('...with options defaulting to empty object', (assert) => {
      const composable = () => {};
      composable.compose = () => {};
      composable.compose.initializers = [
        (options) => {
          assert.ok(typeof options === 'object' && options !== null, 'should receive options as object');

          assert.end();
        },
      ];
      const testStamp = compose(composable);

      testStamp();
    });

    nest.test('...with args in initializer', (assert) => {
      const expected = [0, 'string', { obj: {} }, [1, 2, 3]];

      const composable = () => {};
      composable.compose = () => {};
      composable.compose.initializers = [
        (options, o) => {
          const { args } = o;
          assert.deepEqual(args, expected, 'should receive all given arguments');

          assert.end();
        },
      ];
      const testStamp = compose(composable);

      testStamp(expected[0], expected[1], expected[2], expected[3]);
    });

    nest.test('...with `this` in initializer', (assert) => {
      const composable = () => {};
      composable.compose = () => {};
      composable.compose.initializers = [
        function () {
          return _.assign(this, {
            a: 'a',
          });
        },
      ];
      const stamp = compose(composable);

      const expected = {
        a: 'a',
      };
      const actual = _.pick(compose(stamp)(), _.keys(expected));

      assert.deepEqual(actual, expected, 'should use object instance as `this` inside initializers');

      assert.end();
    });

    nest.test('...with rubbish` in initializer', (assert) => {
      const composable = () => {};
      composable.compose = () => {};
      composable.compose.initializers = [0, 1, null, NaN, 'string', true, false];
      const stamp = compose(composable);
      stamp.compose.initializers = [0, 1, null, NaN, 'string', true, false];

      const actual = compose(stamp)();
      const expected = compose()();

      assert.deepEqual(actual, expected, 'should avoid non functions in initializers array');

      assert.end();
    });

    nest.test('...with accidental rubbish in initializer', (assert) => {
      const stamp = compose();
      stamp.compose.initializers = [_.noop, 0, 1, null, NaN, 'string', true, false];

      const actual = stamp();
      const expected = compose()();

      assert.deepEqual(actual, expected, 'should avoid non functions in initializers array');

      assert.end();
    });
  });
};
