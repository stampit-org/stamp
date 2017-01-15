var test = require('tape');

module.exports = function (compose) {

  test('compose function', function (assert) {
    var actual = typeof compose;
    var expected = 'function';

    assert.equal(actual, expected,
      'compose should be a function.');

    assert.end();
  });
};
