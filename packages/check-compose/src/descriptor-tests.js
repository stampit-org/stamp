var test = require('tape');
var _ = require('lodash');

module.exports = function (compose) {

  test('compose function pojo (Plain Old JavaScript Object)', function (nest) {
    var objDescriptors = [
      'properties',
      'deepProperties',
      'staticProperties',
      'staticDeepProperties',
      'propertyDescriptors',
      'staticPropertyDescriptors',
      'configuration'
    ];

    objDescriptors.forEach(function (descriptorName) {
      nest.test('...with pojo descriptor.' + descriptorName, function (assert) {
        var descriptor = {};
        descriptor[descriptorName] = {
          a: {
            b: 'b'
          }
        };

        var actual = compose(descriptor).compose[descriptorName].a;
        var expected = {b: 'b'};

        assert.deepEqual(actual, expected,
          'should create ' + descriptorName + ' descriptor');

        assert.end();
      });
    });

  });

  test('compose function pojo', function (nest) {

    nest.test('...with pojo descriptor.methods', function (assert) {
      var a = function a() {
        return 'a';
      };

      var actual = Object.getPrototypeOf(compose({
        methods: {a: a}
      })());

      var expected = {a: a};

      assert.deepEqual(actual, expected,
        'should create methods descriptor');

      assert.end();
    });

    nest.test('...with pojo descriptor.initializers', function (assert) {
      var a = function a() {
        return 'a';
      };

      var actual = compose({
        initializers: [a]
      }).compose.initializers;


      assert.ok(_.includes(actual, a),
        'should have initializers descriptor');

      assert.end();
    });
  });

};
