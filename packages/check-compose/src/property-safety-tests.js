var test = require('tape');

module.exports = function (compose) {

  test('Deep properties', function (nest) {
    nest.test('...should be cloned for descriptors', function (assert) {
      var deepInstance = {e: 'deep'};
      var stamp = compose({
        deepProperties: {
          obj: deepInstance
        }
      });
      var actual = stamp.compose.deepProperties.obj;

      assert.notEqual(actual, deepInstance,
        'deepProperties should not be assigned between descriptors');
      assert.end();
    });

    nest.test('...should be cloned for instances', function (assert) {
      var stamp = compose({
        deepProperties: {
          obj: {e: 'deep'}
        }
      });
      var notExpected = stamp.compose.deepProperties.obj;
      var actual = stamp().obj;

      assert.notEqual(actual, notExpected,
        'deepProperties should not be assigned from descriptor to object instance');
      assert.end();
    });
  });

  test('Deep static properties', function (nest) {
    nest.test('...should be cloned for descriptors', function (assert) {
      var deepInstance = {e: 'deep'};
      var stamp = compose({
        staticDeepProperties: {
          obj: deepInstance
        }
      });
      var actual = stamp.compose.staticDeepProperties.obj;

      assert.notEqual(actual, deepInstance,
        'staticDeepProperties should not be assigned between descriptors');
      assert.end();
    });

    nest.test('...should be cloned for new stamps', function (assert) {
      var stamp = compose({
        staticDeepProperties: {
          obj: {e: 'deep'}
        }
      });
      var notExpected = stamp.compose.staticDeepProperties.obj;
      var actual = stamp.obj;

      assert.notEqual(actual, notExpected,
        'staticDeepProperties should not be assigned from descriptor to stamp');
      assert.end();
    });
  });

};
