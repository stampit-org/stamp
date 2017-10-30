var test = require('tape');

module.exports = function (compose) {

  [0, 1, null, NaN, 'string', true, false].forEach(function (obj) {
    test('initializer returns ' + obj, function (assert) {
      compose({
        initializers: [
          function () {
            return obj;
          },
          function (options, o) {
          var instance = o.instance;
            var actual = typeof instance;
            var expected = typeof obj;

            assert.equal(actual, expected,
              'initializer return value should replace instance');

            assert.end();
          }
        ]
      })();
    });
  });


  test('initializer returns undefined', function (assert) {
    compose({
      initializers: [
        function () {
          return undefined;
        },
        function (options, o) {
          var instance = o.instance;
          var actual = typeof instance;
          var expected = 'object';

          assert.equal(actual, expected,
            'initializer return value should not replace instance');

          assert.end();
        }
      ]
    })();
  });

  test('instance replacement', function (assert) {
    var message = 'instance replaced';
    var newInstance = {
      message: message
    };

    var obj = compose({
      initializers: [
        function () {
          return newInstance;
        }
      ]
    })();

    var actual = obj.message;
    var expected = message;

    assert.equal(actual, expected,
      'the replaced instance value should be returned from the stamp');

    assert.end();
  });

};
