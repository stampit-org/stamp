const test = require("tape");

module.exports = compose => {
  test("compose function", assert => {
    const actual = typeof compose;
    const expected = "function";

    assert.equal(actual, expected, "compose should be a function.");

    assert.end();
  });
};
