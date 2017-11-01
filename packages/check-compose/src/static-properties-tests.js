var test = require('tape');
var _ = require('lodash');

module.exports = function (compose) {

  test('compose static properties with POJO', function (assert) {
    var expected = {
      a: 'a',
      b: 'b'
    };

    var staticProperties = compose({
      staticProperties: {
        a: 'a'
      }
    }, {
      staticProperties: {
        b: 'b'
      }
    }).compose.staticProperties;
    var actual = _.pick(staticProperties, _.keys(expected));

    assert.deepEqual(actual, expected,
      'should compose staticProperties into descriptor');

    assert.end();
  });

  test('compose static properties with stamp', function (assert) {
    var expected = compose({
      staticProperties: {
        a: 'a',
        b: 'b'
      }
    }).compose.staticProperties;

    var actual = compose({
      staticProperties: {
        a: 'a'
      }
    }, {
      staticProperties: {
        b: 'b'
      }
    }).compose.staticProperties;

    assert.deepEqual(actual, expected,
      'should compose staticProperties into descriptor');

    assert.end();
  });

  test('compose static deep properties with POJO', function (assert) {
    var expected = {
      a: 'a',
      b: 'b'
    };

    var staticDeepProperties = compose({
      staticDeepProperties: {
        a: 'a'
      }
    }, {
      staticDeepProperties: {
        b: 'b'
      }
    }).compose.staticDeepProperties;
    var actual = _.pick(staticDeepProperties, _.keys(expected));

    assert.deepEqual(actual, expected,
      'should compose staticDeepProperties into descriptor');

    assert.end();
  });

  test('compose static deep properties with stamp', function (assert) {
    var expected = compose({
      staticDeepProperties: {
        a: 'a',
        b: 'b'
      }
    }).compose.staticDeepProperties;

    var actual = compose({
      staticDeepProperties: {
        a: 'a'
      }
    }, {
      staticDeepProperties: {
        b: 'b'
      }
    }).compose.staticDeepProperties;

    assert.deepEqual(actual, expected,
      'should compose staticDeepProperties into descriptor');

    assert.end();
  });

};
