var test = require('tape');

module.exports = function (compose) {

  var assignmentProps = [
    'methods',
    'properties',
    'deepProperties',
    'staticProperties',
    'staticDeepProperties',
    'configuration',
    'deepConfiguration'
  ];

  var build = function (num) {
    var composable = function () {};
    composable.compose = function () {};

    assignmentProps.forEach(function (prop) {
      composable.compose[prop] = {
        override: num
      };
      composable.compose[prop][num] = num;
    });

    return composable;
  };

  // Loop over each property that is copied by assignment and ensure
  // that copy and priority are implemented correctly.
  assignmentProps.forEach(function (prop) {
    test(prop + ' assignment 1', function (assert) {
      var subject = compose(build(1), build(2));
      var props = subject.compose;

      var actual = props[prop][1];
      var expected = 1;

      assert.equal(actual, expected,
        prop + ' should be copied by assignment from first argument');

      assert.end();
    });

    test(prop + ' assignment 2', function (assert) {
      var subject = compose(build(1), build(2));
      var props = subject.compose;

      var actual = props[prop][2];
      var expected = 2;

      assert.equal(actual, expected,
        prop + ' should be copied by assignment from 2nd argument');

      assert.end();
    });

    test(prop + ' assignment 3', function (assert) {
      var subject = compose(build(1), build(2), build(3));
      var props = subject.compose;

      var actual = props[prop][3];
      var expected = 3;

      assert.equal(actual, expected,
        prop + ' should be copied by assignment from subsequent arguments');

      assert.end();
    });

    test(prop + ' assignment priority', function (assert) {
      var subject = compose(build(1), build(2));
      var props = subject.compose;

      var actual = props[prop].override;
      var expected = 2;

      assert.equal(actual, expected,
        prop + ' should be copied by assignment with last-in priority');

      assert.end();
    });
  });

};
