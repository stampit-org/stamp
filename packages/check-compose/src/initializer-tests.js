var test = require('tape');
var _ = require('lodash');

module.exports = function (compose) {

  var build = function (num) {

    var composable = function () {};
    composable.compose = function () {};
    composable.compose.initializers = [function () {
      return {num: num};
    }];

    return composable;
  };

  var buildInitializers = function () {

    var composable = function () {};
    composable.compose = function () {};
    composable.compose.initializers = [
      function (options, o) {
        var instance = o.instance;
        return _.assign(instance, {
          a: 'a',
          override: 'a'
        });
      },
      function (options, o) {
        var instance = o.instance;
        return _.assign(instance, {
          b: 'b'
        });
      },
      function (options, o) {
        var instance = o.instance;
        return _.assign(instance, {
          override: 'c'
        });
      }
    ];
    return composable;
  };


  test('compose()', function (nest) {

    nest.test('...with no initializers', function (assert) {
      var expected = _.size(compose().compose.initializers);
      var subject = compose({initializers: [0, 'a', null, undefined, {}, NaN, /regexp/]});
      var actual = _.size(subject.compose.initializers);

      assert.equal(actual, expected,
        'should not add any initializers');

      assert.end();
    });

    nest.test('...with two initializers', function (assert) {
      var subject = compose(build(1), build(2));
      var initializers = subject.compose.initializers;

      var actual = initializers[0]().num;
      var expected = 1;

      assert.equal(actual, expected,
        'should add initializer from first composable');

      assert.end();
    });

    nest.test('...with two initializers', function (assert) {
      var subject = compose(build(1), build(2));
      var initializers = subject.compose.initializers;

      var actual = initializers[1]().num;
      var expected = 2;

      assert.equal(actual, expected,
        'should add initializer from second composable');

      assert.end();
    });

    nest.test('...with three initializers', function (assert) {
      var subject = compose(build(1), build(2), build(3));
      var initializers = subject.compose.initializers;

      var actual = initializers[2]().num;
      var expected = 3;

      assert.equal(actual, expected,
        'should add initializer from subsequent composables');

      assert.end();
    });

    nest.test('...with identical initializers', function (assert) {
      var stamp1 = build(1);
      var stamp2 = build(2);
      var stamp3 = build(3);
      stamp2.compose.initializers = stamp1.compose.initializers.slice();
      stamp3.compose.initializers = stamp1.compose.initializers.slice();
      stamp3.compose.initializers.push(stamp3.compose.initializers[0]);
      var subject = compose(stamp1, stamp2, stamp3);
      var initializers = subject.compose.initializers;

      var actual = initializers.length;
      var expected = 1;

      assert.equal(actual, expected,
        'should not add same initializer more than once');

      assert.end();
    });

    nest.test('...with identical initializers in a single argument', function (assert) {
      var stamp1 = build(1);
      stamp1.compose.initializers.push(stamp1.compose.initializers[0]);
      var subject = compose(stamp1);
      var initializers = subject.compose.initializers;

      var actual = initializers.length;
      var expected = 1;

      assert.equal(actual, expected,
        'should not add same initializer more than once');

      assert.end();
    });
  });

  test('stamp()', function (nest) {

    nest.test('...with initializers', function (assert) {
      var composable = function () {};
      composable.compose = function () {};
      composable.compose.properties = {
        'instanceProps': true
      };
      composable.compose.initializers = [
        function (a, o) {
          var stampOption = a.stampOption;
          var instance = o.instance, stamp = o.stamp, args = o.args;
          assert.equal(args.length, 3);
          var expected = {
            correctThisValue: true,
            hasOptions: true,
            hasInstance: true,
            hasStamp: true,
            argsLength: true
          };

          var actual = _.pick({
            correctThisValue: this === instance,
            hasOptions: Boolean(stampOption),
            hasInstance: Boolean(instance.instanceProps),
            hasStamp: Boolean(stamp.compose),
            argsLength: args.length === 3
          }, _.keys(expected));

          assert.deepEqual(actual, expected,
            'should call initializer with correct signature');

          assert.end();
        }
      ];
      var testStamp = compose(composable);

      testStamp({stampOption: true}, 1, 2);
    });

    nest.test('...with overrides in initializer', function (assert) {
      var stamp = buildInitializers();

      var expected = {
        a: 'a',
        b: 'b',
        override: 'c'
      };
      var actual = _.pick(compose(stamp)(), _.keys(expected));

      assert.deepEqual(actual, expected,
        'should apply initializers with last-in priority');

      assert.end();
    });

    nest.test('...with options defaulting to empty object', function (assert) {
      var composable = function () {};
      composable.compose = function () {};
      composable.compose.initializers = [
        function (options) {
          assert.ok(typeof options === 'object' && options !== null,
            'should receive options as object');

          assert.end();
        }
      ];
      var testStamp = compose(composable);

      testStamp();
    });

    nest.test('...with args in initializer', function (assert) {
      var expected = [0, 'string', {obj: {}}, [1, 2, 3]];

      var composable = function () {};
      composable.compose = function () {};
      composable.compose.initializers = [
        function (options, o) {
          var args = o.args;
          assert.deepEqual(args, expected,
            'should receive all given arguments');

          assert.end();
        }
      ];
      var testStamp = compose(composable);

      testStamp(expected[0], expected[1], expected[2], expected[3]);
    });

    nest.test('...with `this` in initializer', function (assert) {
      var composable = function () {};
      composable.compose = function () {};
      composable.compose.initializers = [
        function () {
          return _.assign(this, {
            a: 'a'
          });
        }
      ];
      var stamp = compose(composable);

      var expected = {
        a: 'a'
      };
      var actual = _.pick(compose(stamp)(), _.keys(expected));

      assert.deepEqual(actual, expected,
        'should use object instance as `this` inside initializers');

      assert.end();
    });

    nest.test('...with rubbish` in initializer', function (assert) {
      var composable = function () {};
      composable.compose = function () {};
      composable.compose.initializers = [0, 1, null, NaN, 'string', true, false];
      var stamp = compose(composable);
      stamp.compose.initializers = [0, 1, null, NaN, 'string', true, false];

      var actual = compose(stamp)();
      var expected = compose()();

      assert.deepEqual(actual, expected,
        'should avoid non functions in initializers array');

      assert.end();
    });

    nest.test('...with accidental rubbish in initializer', function (assert) {
      var stamp = compose();
      stamp.compose.initializers = [_.noop, 0, 1, null, NaN, 'string', true, false];

      var actual = stamp();
      var expected = compose()();

      assert.deepEqual(actual, expected,
        'should avoid non functions in initializers array');

      assert.end();
    });
  });

};
