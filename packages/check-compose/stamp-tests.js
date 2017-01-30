var test = require('tape');
var _ = require('lodash');

module.exports = function (compose) {

  var build = function (prop, key, val) {
    val = val || key;
    var composable = function () {};
    composable.compose = function () {};

    composable.compose[prop] = {};
    composable.compose[prop][val] = val;

    return composable;
  };

  test('compose()', function (assert) {
    var actual = typeof compose();
    var expected = 'function';

    assert.equal(actual, expected,
      'compose() should return a function');

    assert.end();
  });


  test('Stamp', function (nest) {
    nest.test('...with no arguments', function (assert) {
      var actual = typeof compose()();
      var expected = 'object';

      assert.equal(actual, expected,
        'should produce an object instance');

      assert.end();
    });

    nest.test('...with broken descriptor', function (assert) {
      var stamp = compose();
      stamp.compose = null;

      var expected = {};
      var actual = stamp();

      assert.deepEqual(actual, expected,
        'should ignore non function initializers');

      assert.end();
    });

    nest.test('should allow late descriptor edition', function (assert) {
      var stamp = compose();
      stamp.compose.properties = {foo: 'exists'};

      var expected = {foo: 'exists'};
      var actual = stamp();

      assert.deepEqual(actual, expected,
        'should allow late addition of metadata');

      assert.end();
    });

  });

  test('Stamp assignments', function (nest) {
    nest.test('...with properties', function (assert) {
      var composable = function () {};
      composable.compose = function () {};
      composable.compose.properties = {
        a: 'a',
        b: 'b'
      };
      var stamp = compose(composable);

      var expected = {
        a: 'a',
        b: 'b'
      };
      var actual = _.pick(stamp(), _.keys(expected));

      assert.deepEqual(actual, expected,
        'should create properties');

      assert.end();
    });
  });

  test('Stamp.compose()', function (nest) {
    nest.test('...type', function (assert) {
      var actual = typeof compose().compose;
      var expected = 'function';

      assert.equal(actual, expected,
        'should be a function');

      assert.end();
    });

    nest.test('...with no arguments', function (assert) {
      var actual = typeof compose().compose().compose;
      var expected = 'function';

      assert.equal(actual, expected,
        'should return a new stamp');

      assert.end();
    });

    nest.test('...with base defaults', function (assert) {
      var stamp1 = compose(build('properties', 'a'));
      var stamp2 = compose(build('properties', 'b'));
      var finalStamp = stamp1.compose(stamp2);

      var expected = {
        a: 'a',
        b: 'b'
      };
      var actual = _.pick(finalStamp(), _.keys(expected));

      assert.deepEqual(actual, expected,
        'should use Stamp as base composable');

      assert.end();
    });
  });

};
