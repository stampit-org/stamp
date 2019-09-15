const test = require("tape");
const _ = require("lodash");

module.exports = compose => {
  const build = (prop, key, val) => {
    val = val || key;
    const composable = () => {};
    composable.compose = () => {};

    composable.compose[prop] = {};
    composable.compose[prop][val] = val;

    return composable;
  };

  test("compose()", assert => {
    const actual = typeof compose();
    const expected = "function";

    assert.equal(actual, expected, "compose() should return a function");

    assert.end();
  });

  test("Stamp", nest => {
    nest.test("...with no arguments", assert => {
      const actual = typeof compose()();
      const expected = "object";

      assert.equal(actual, expected, "should produce an object instance");

      assert.end();
    });

    nest.test("...with broken descriptor", assert => {
      const stamp = compose();
      stamp.compose = null;

      const expected = {};
      const actual = stamp();

      assert.deepEqual(
        actual,
        expected,
        "should ignore non function initializers"
      );

      assert.end();
    });

    nest.test("should allow late descriptor edition", assert => {
      const stamp = compose();
      stamp.compose.properties = { foo: "exists" };

      const expected = { foo: "exists" };
      const actual = stamp();

      assert.deepEqual(
        actual,
        expected,
        "should allow late addition of metadata"
      );

      assert.end();
    });
  });

  test("Stamp assignments", nest => {
    nest.test("...with properties", assert => {
      const composable = () => {};
      composable.compose = () => {};
      composable.compose.properties = {
        a: "a",
        b: "b"
      };
      const stamp = compose(composable);

      const expected = {
        a: "a",
        b: "b"
      };
      const actual = _.pick(stamp(), _.keys(expected));

      assert.deepEqual(actual, expected, "should create properties");

      assert.end();
    });
  });

  test("Stamp.compose()", nest => {
    nest.test("...type", assert => {
      const actual = typeof compose().compose;
      const expected = "function";

      assert.equal(actual, expected, "should be a function");

      assert.end();
    });

    nest.test("...with no arguments", assert => {
      const actual = typeof compose().compose().compose;
      const expected = "function";

      assert.equal(actual, expected, "should return a new stamp");

      assert.end();
    });

    nest.test("...with base defaults", assert => {
      const stamp1 = compose(build("properties", "a"));
      const stamp2 = compose(build("properties", "b"));
      const finalStamp = stamp1.compose(stamp2);

      const expected = {
        a: "a",
        b: "b"
      };
      const actual = _.pick(finalStamp(), _.keys(expected));

      assert.deepEqual(actual, expected, "should use Stamp as base composable");

      assert.end();
    });
  });
};
