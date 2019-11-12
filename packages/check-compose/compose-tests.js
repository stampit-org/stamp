/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-test-callback */
/* eslint-disable jest/no-export */
/* eslint-disable jest/require-top-level-describe */

/* eslint-disable no-plusplus */
/* eslint-disable prefer-rest-params */

'use strict';

const test = require('tape');
const _ = require('lodash');

module.exports = (compose) => {
  test('compose ignores non objects', (assert) => {
    const stamp = compose(0, 'a', null, undefined, {}, NaN, /regexp/);
    const subject = _.values(stamp.compose).filter(_.negate(_.isEmpty));
    const expected = _.values(compose().compose);

    assert.deepEqual(subject, expected, 'should not add any descriptor data');

    assert.end();
  });

  test('compose in order', (assert) => {
    const initOrder = [];
    const getInitDescriptor = (value) => {
      return {
        initializers: [
          () => {
            initOrder.push(value);
          },
        ],
      };
    };

    const stamp = compose(
      compose(getInitDescriptor(0)),
      compose(getInitDescriptor(1), getInitDescriptor(2)).compose(getInitDescriptor(3), getInitDescriptor(4)),
      getInitDescriptor(5)
    );
    stamp();
    const expected = [0, 1, 2, 3, 4, 5];

    assert.deepEqual(initOrder, expected, 'should compose in proper order');

    assert.end();
  });

  test('compose is detachable', (assert) => {
    const detachedCompose = compose().compose;

    assert.notEqual(compose, detachedCompose, 'stamp .compose function must be a different object to "compose"');

    assert.end();
  });

  test('detached compose does not inherit previous descriptor', (assert) => {
    const detachedCompose = compose({ properties: { foo: 1 } }).compose;
    const obj = detachedCompose()();
    let expected;

    assert.equal(obj.foo, expected, 'detached compose method should not inherit parent descriptor data');

    assert.end();
  });

  test('compose is replaceable', (assert) => {
    let counter = 0;

    function newCompose() {
      counter++;
      return compose({ staticProperties: { compose: newCompose } }, this, arguments);
    }

    newCompose()
      .compose()
      .compose();
    const expected = 3;

    assert.equal(counter, expected, 'should inherit new compose function');

    assert.end();
  });

  test('replaced compose method is always a new object', (assert) => {
    function newCompose() {
      return compose({ staticProperties: { compose: newCompose } }, this, arguments);
    }

    const stamp1 = newCompose();
    const compose1 = stamp1.compose;
    const stamp2 = stamp1.compose();
    const compose2 = stamp2.compose;

    assert.notEqual(compose1, compose2, 'should be different objects');

    assert.end();
  });

  test('replaced compose method is always a function', (assert) => {
    function newCompose() {
      return compose({ staticProperties: { compose: 'rubbish' } }, this, arguments);
    }

    const overridenCompose = newCompose().compose().compose;
    const actual = _.isFunction(overridenCompose);
    const expected = true;

    assert.equal(actual, expected, 'should be a function');

    assert.end();
  });

  test('broken stamp', (assert) => {
    const brokenStamp = compose();
    delete brokenStamp.compose;

    const instance = brokenStamp();
    assert.ok(instance);

    assert.end();
  });
};
