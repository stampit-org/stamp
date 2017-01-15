var test = require('tape');
var _ = require('lodash');

module.exports = function (compose) {

  var mergeProps = [
    'deepProperties',
    'staticDeepProperties',
    'deepConfiguration'
  ];


  test('Deep property merge', function (nest) {

    // Loop over each property that is merged and ensure
    // that merge implemented correctly.
    mergeProps.forEach(function (prop) {

      var build = function (num) {
        var composable = function () {};
        composable.compose = function () {};
        composable.compose[prop] = {a: {merge: {}}};
        composable.compose[prop].a[num] = num;
        composable.compose[prop].a.merge[num] = num;

        return composable;
      };

      nest.test('...' + prop + ' merge 1', function (assert) {
        var subject = compose(build(1), build(2));
        var props = subject.compose;

        var actual = props[prop].a[1];
        var expected = 1;

        assert.equal(actual, expected,
          prop + 'should be merged from first argument');

        assert.end();
      });

      nest.test('...' + prop + ' merge 2', function (assert) {
        var subject = compose(build(1), build(2));
        var props = subject.compose;

        var actual = props[prop].a[2];
        var expected = 2;

        assert.equal(actual, expected,
          prop + ' should be merged from 2nd argument');

        assert.end();
      });

      nest.test('...' + prop + ' merge 3', function (assert) {
        var subject = compose(build(1), build(2), build(3));
        var props = subject.compose;

        var actual = props[prop].a[3];
        var expected = 3;

        assert.equal(actual, expected,
          prop + 'should be merged from subsequent arguments');

        assert.end();
      });

      nest.test('...' + prop + ' merge collision', function (assert) {
        var actual = compose(
          {
            deepProperties: {
              a: {b: 1}
            }
          },
          {
            deepProperties: {
              a: {b: 2}
            }
          })().a;
        var expected = {b: 2};

        assert.deepEqual(actual, expected,
          prop + 'conflicts should be merged with last-in priority.');

        assert.end();
      });

    });
  });


  test('Deep array merge', function (nest) {
    // Loop over each property that is merged and ensure
    // that merge implemented correctly.
    mergeProps.forEach(function (prop) {

      nest.test('...' + prop + ' should assign functions source', function (assert) {
        function F() {}

        F.x = 1;
        var actual = compose(
          {
            deepProperties: {
              a: {b: 1}
            }
          },
          {
            deepProperties: {
              a: F
            }
          })().a;
        var expected = F;

        assert.strictEqual(actual, expected,
          prop + 'function must be assigned');

        assert.end();
      });

      nest.test('...' + prop + ' should not merge to a function', function (assert) {
        function F() {}

        F.x = 1;
        var actual = compose(
          {
            deepProperties: {
              a: F
            }
          },
          {
            deepProperties: {
              a: {b: 1}
            }
          })().a;
        var expected = {b: 1};

        assert.deepEqual(actual, expected,
          prop + 'function must be overwritten with plain object');

        assert.end();
      });

    });
  });


  test('Deep array merge', function (nest) {

    // Loop over each property that is merged and ensure
    // that merge implemented correctly.
    mergeProps.forEach(function (prop) {

      function deepMerge(a, b) {
        var c1 = {};
        c1[prop] = a;
        var c2 = {};
        c2[prop] = b;
        return compose(c1, c2).compose[prop];
      }

      nest.test('array replaces object', function (t) {
        var a = {
          foo: {
            bar: 'bam'
          }
        };
        var b = {
          foo: ['a', 'b', 'c']
        };
        var expected = ['a', 'b', 'c'];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);
        t.notEqual(actual, b.foo, 'array replacing object should be deep merged: c.foo !== b.foo');

        t.end();
      });

      nest.test('object replaces array', function (t) {
        var a = {
          foo: ['a', 'b', 'c']
        };
        var b = {
          foo: {
            bar: 'bam'
          }
        };
        var expected = {
          bar: 'bam'
        };

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.notEqual(actual, b.foo, 'object replacing array should be deep merged: c.foo !== b.foo');

        t.end();
      });

      nest.test('array concat', function (t) {
        var a = {
          foo: [1, 2, 3]
        };
        var b = {
          foo: ['a', 'b', 'c']
        };
        var expected = [1, 2, 3, 'a', 'b', 'c'];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);
        t.notEqual(actual, b.foo, 'array should be deep merged from right: c.foo === b.foo');

        t.end();
      });

      nest.test('number replaces array', function (t) {
        var a = {
          foo: [1, 2, 3]
        };
        var b = {
          foo: 99
        };
        var expected = 99;

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces number', function (t) {
        var a = {
          foo: 99
        };
        var b = {
          foo: [1, 2, 3]
        };
        var expected = [1, 2, 3];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('string replaces array', function (t) {
        var a = {
          foo: [1, 2, 3]
        };
        var b = {
          foo: 'abc'
        };
        var expected = 'abc';

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });


      nest.test('array replaces string', function (t) {
        var a = {
          foo: 'abc'
        };
        var b = {
          foo: [1, 2, 3]
        };
        var expected = [1, 2, 3];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('boolean true replaces array', function (t) {
        var a = {
          foo: [1, 2, 3]
        };
        var b = {
          foo: true
        };
        var expected = true;

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces boolean true', function (t) {
        var a = {
          foo: true
        };
        var b = {
          foo: [1, 2, 3]
        };
        var expected = [1, 2, 3];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('boolean false replaces array', function (t) {
        var a = {
          foo: [1, 2, 3]
        };
        var b = {
          foo: false
        };
        var expected = false;

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces boolean false', function (t) {
        var a = {
          foo: false
        };
        var b = {
          foo: [1, 2, 3]
        };
        var expected = [1, 2, 3];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });


      nest.test('null replaces array', function (t) {
        var a = {
          foo: [1, 2, 3]
        };
        var b = {
          foo: null
        };
        var expected = null;

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces null', function (t) {
        var a = {
          foo: null
        };
        var b = {
          foo: [1, 2, 3]
        };
        var expected = [1, 2, 3];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('array replaces undefined', function (t) {
        var a = {};
        var b = {
          foo: [1, _, _.noop]
        };
        var expected = [1, _, _.noop];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('undefined does not replace array', function (t) {
        var a = {
          foo: [1, _, _.noop]
        };
        var b = {
          foo: undefined
        };
        var expected = [1, _, _.noop];

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });

      nest.test('number replace array', function (t) {
        var a = {
          foo: [1, 2, 3]
        };
        var b = {
          foo: 42
        };
        var expected = 42;

        var actual = deepMerge(a, b).foo;
        var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

        t.deepEqual(actual, expected, expectedMsg);

        t.end();
      });
    });
  });

};
