var test = require('tape');
var _ = require('lodash');

module.exports = function (compose) {

  test('compose ignores non objects', function (assert) {
    var stamp = compose(0, 'a', null, undefined, {}, NaN, /regexp/);
    var subject = _.values(stamp.compose).filter(_.negate(_.isEmpty));
    var expected = _.values(compose().compose);

    assert.deepEqual(subject, expected,
      'should not add any descriptor data');

    assert.end();
  });

  test('compose in order', function (assert) {
    var initOrder = [];
    var getInitDescriptor = function (value) {
      return {initializers: [function () {initOrder.push(value);}]};
    };

    var stamp = compose(
      compose(getInitDescriptor(0)),
      compose(getInitDescriptor(1), getInitDescriptor(2))
        .compose(getInitDescriptor(3), getInitDescriptor(4)),
      getInitDescriptor(5)
    );
    stamp();
    var expected = [0, 1, 2, 3, 4, 5];

    assert.deepEqual(initOrder, expected,
      'should compose in proper order');

    assert.end();
  });

  test('compose is detachable', function (assert) {
    var detachedCompose = compose().compose;

    assert.notEqual(compose, detachedCompose,
      'stamp .compose function must be a different object to "compose"');

    assert.end();
  });

  test('detached compose does not inherit previous descriptor', function (assert) {
    var detachedCompose = compose({properties: {foo: 1}}).compose;
    var obj = detachedCompose()();
    var expected;

    assert.equal(obj.foo, expected,
      'detached compose method should not inherit parent descriptor data');

    assert.end();
  });

  test('compose is replaceable', function (assert) {
    var counter = 0;

    function newCompose() {
      counter++;
      return compose({staticProperties: {compose: newCompose}}, this, arguments);
    }

    newCompose().compose().compose();
    var expected = 3;

    assert.equal(counter, expected,
      'should inherit new compose function');

    assert.end();
  });

  test('replaced compose method is always a new object', function (assert) {
    function newCompose() {
      return compose({staticProperties: {compose: newCompose}}, this, arguments);
    }

    var stamp1 = newCompose();
    var compose1 = stamp1.compose;
    var stamp2 = stamp1.compose();
    var compose2 = stamp2.compose;

    assert.notEqual(compose1, compose2, 'should be different objects');

    assert.end();
  });

  test('replaced compose method is always a function', function (assert) {
    function newCompose() {
      return compose({staticProperties: {compose: 'rubbish'}}, this, arguments);
    }

    var overridenCompose = newCompose().compose().compose;
    var actual = _.isFunction(overridenCompose);
    var expected = true;

    assert.equal(actual, expected, 'should be a function');

    assert.end();
  });

};
