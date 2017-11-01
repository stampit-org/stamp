var test = require('tape');
var _ = require('lodash');

module.exports = function (compose) {

  var buildDescriptor = function (obj) {
    return _.assign({}, {
      properties: {
        a: 'props',
        b: 'props'
      }
    }, obj);
  };

  test('compose override priorities', function (nest) {
    nest.test('...with instance', function (assert) {
      var stamp = compose(buildDescriptor());
      var actual = stamp({
        instance: {
          a: 'instance'
        }
      }).a;
      var expected = 'props';

      assert.equal(actual, expected,
        'properties should override instance props');

      assert.end();
    });

    nest.test('...with deepProperties', function (assert) {
      var stamp = compose(
        buildDescriptor({
          deepProperties: {
            a: 'deepProps'
          }
        }));
      var actual = stamp().a;
      var expected = 'props';

      assert.equal(actual, expected,
        'shallow properties should override deep properties');

      assert.end();
    });

    nest.test('...with descriptors', function (assert) {
      var stamp = compose(
        buildDescriptor({
          propertyDescriptors: {
            b: {
              value: 'propertyDescriptors'
            }
          }
        }));

      var actual = stamp().b;
      var expected = 'propertyDescriptors';

      assert.equal(actual, expected,
        'descriptors should override shallow properties');
      assert.end();
    });

    nest.test('...with instance & deepProperties', function (assert) {
      var stamp = compose(buildDescriptor({
        deepProperties: {
          c: 'deep'
        }
      }));
      var actual = stamp({
        instance: {
          c: 'instance'
        }
      }).c;
      var expected = 'deep';

      assert.equal(actual, expected,
        'deepProperties should override instance props');

      assert.end();
    });

    nest.test('...with staticProperties', function (assert) {
      var stamp = compose({
        staticDeepProperties: {
          d: 'deep'
        },
        staticProperties: {
          d: 'staticProps'
        }
      });
      var actual = stamp.d;
      var expected = 'staticProps';

      assert.equal(actual, expected,
        'staticProperties should override staticDeepProperties');
      assert.end();
    });
  });

};
