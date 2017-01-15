var test = require('tape');
var _ = require('lodash');

module.exports = function (compose) {

  var createDescriptors = function () {
    var a = {
      value: 'a',
      writable: false,
      configurable: false,
      enumerable: false
    };
    var b = _.assign({}, a);
    var descriptors = {a: a, b: b};
    return descriptors;
  };

  test('stamp', function (nest) {
    nest.test('...with propertyDescriptors', function (assert) {
      var descriptors = createDescriptors();
      var b = descriptors.b;

      var obj = compose({
        propertyDescriptors: _.assign({}, descriptors)
      })();

      var actual = Object.getOwnPropertyDescriptor(obj, 'b');
      var expected = _.assign({}, b);

      assert.deepEqual(actual, expected,
        'should assign propertyDescriptors to instances');

      assert.end();
    });

    nest.test('...with malformed propertyDescriptors', function (assert) {
      [0, 'a', null, undefined, {}, NaN, /regexp/].forEach(function (propertyValue) {
        var actual = compose({
          propertyDescriptors: propertyValue
        })();
        var expected = compose()();

        assert.deepEqual(actual, expected,
          'should not any properties instances');
      });

      assert.end();
    });

    nest.test('...with malformed staticPropertyDescriptors', function (assert) {
      [0, 'a', null, undefined, {}, NaN, /regexp/].forEach(function (propertyValue) {
        var stamp = compose({
          staticPropertyDescriptors: propertyValue
        });
        var actual = _.values(stamp.compose).filter(function (value) { return !_.isEmpty(value); });
        var expected = _.values(compose().compose);

        assert.deepEqual(actual, expected,
          'should not add any descriptor data');
      });

      assert.end();
    });

    nest.test('...with propertyDescriptors and existing prop conflict', function (assert) {
      var descriptors = createDescriptors();

      var obj = compose({
          properties: {
            a: 'existing prop'
          }
        },
        {
          propertyDescriptors: _.assign({}, descriptors)
        })();

      var actual = obj.a;
      var expected = 'a';

      assert.deepEqual(actual, expected,
        'should assign propertyDescriptors to instances & override existing prop');

      assert.end();
    });

    nest.test('...with staticPropertyDescriptors', function (assert) {
      var descriptors = createDescriptors();
      var b = descriptors.b;

      var stamp = compose({
        staticPropertyDescriptors: _.assign({}, descriptors)
      });

      var actual = Object.getOwnPropertyDescriptor(stamp, 'b');
      var expected = _.assign({}, b);

      assert.deepEqual(actual, expected,
        'should assign staticProperties to stamp');

      assert.end();
    });
  });

};
