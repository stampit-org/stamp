var test = require('tape');
var _  = require('lodash');

module.exports = function (compose) {

  test('composer arguments', function (t) {
    var executed = 0;
    var passedStamp;
    var stamp = compose({
      composers: [function composers() {
        t.equal(arguments.length, 1, 'have single argument');
        t.ok(_.isPlainObject(arguments[0]), 'argument is an object');
        t.ok(_.isArray(arguments[0].composables), 'composables passed');
        t.equal(arguments[0].composables.length, 1, 'only one composable passed');
        t.ok(_.isPlainObject(arguments[0].composables[0]), 'the composable is a descriptor');
        t.ok(_.isArray(arguments[0].composables[0].composers),
          'first composable have the composers list');
        executed += 1;
        passedStamp = arguments[0].stamp;
      }]
    });

    t.ok(stamp.compose.composers,
      'should add .composers');
    t.equal(stamp.compose.composers.length, 1,
      'should be single composer');
    t.equal(executed, 1,
      'should be executed while composing');
    t.equal(passedStamp, stamp, 'stamp passed');

    t.end();
  });

  test('two composers should be executed on ocmposition', function (t) {
    var executed1 = 0;
    var executed2 = 0;
    var stamp1;
    var stamp2;
    var actualStamp = compose({
      composers: [
        function composer1(ref) {
          var stamp = ref.stamp;

          stamp1 = stamp;
          executed1 += 1;
        },
        function composer2(ref) {
          var stamp = ref.stamp;

          stamp2 = stamp;
          executed2 += 1;
        }
      ]
    });

    t.equal(stamp1, actualStamp, 'stamp passed to first composer');
    t.equal(stamp2, actualStamp, 'stamp passed to second composer');
    t.equal(executed1, 1, 'first composer executed');
    t.equal(executed2, 1, 'second composer executed');

    t.end();
  });

  test('compose({ composers() }).compose({ composers() })', function (t) {
    var executed1 = 0;
    var executed2 = 0;
    var stamp1;
    var stamp2;
    var actualStamp = compose({
      composers: [function composers(ref) {
        var stamp = ref.stamp;

        stamp1 = stamp;
        executed1 += 1;
      }]
    })
      .compose({
        composers: [function composers(ref) {
          var stamp = ref.stamp;

          stamp2 = stamp;
          executed2 += 1;
        }]
      });

    t.equal(stamp1, actualStamp, 'stamp passed to first composer');
    t.equal(stamp2, actualStamp, 'stamp passed to second composer');
    t.equal(executed1, 2, 'first composer executed twice');
    t.equal(executed2, 1, 'second composer executed');

    t.end();
  });

  test('composer returned value replaces stamp', function (t) {
    var replacement = compose();
    var stamp = compose({
      composers: [function composers() {
        return replacement;
      }]
    });

    t.equal(stamp, replacement, 'composer returned value should replace original stamp');

    t.end();
  });

  test('composer returned non-stamp value should be ignored', function (t) {
    var replacement = compose();
    var stamp = compose({
      composers: [function composers() {
        return function () {}; // non-stamp
      }]
    });

    t.notEqual(stamp, replacement, 'composer returned value should not replace original stamp');

    t.end();
  });

  test('first composer returned value passed to the second composer', function (t) {
    var replacement = compose();
    var stamp2;
    compose({
      composers: [function composers() {
        return replacement;
      }]
    }, {
      composers: [function composers() {
        stamp2 = replacement;
      }]
    });

    t.equal(stamp2, replacement, 'second composer should get first composer return value');

    t.end();
  });

  test('composers should be deduped', function (t) {
    var stamp2 = compose();
    var stamp = compose({composers: [function composers() {}]});

    var result = stamp.compose(stamp2).compose({}).compose(stamp);
    var composers = result.compose.composers;
    t.equal(composers.length, 1, 'should dedupe composers');

    t.end();
  });

  test('stamp.compose({ composers() }) passes full composables array', function (t) {
    var run = 0;
    var stamp2 = compose();
    var stamp = compose({
      composers: [function composers(ref) {
        var composables = ref.composables;

        run += 1;
        if (run === 1) {
          t.equal(composables.length, 1, 'creating stamp should pass one composable');
        }
        if (run === 2) {
          t.equal(composables.length, 2, 'inheriting stamp should pass one composable');
          t.equal(composables[0], stamp, 'first composable must be stamp itself');
          t.equal(composables[1], stamp2, 'second composable must be passed');
        }
      }]
    });

    stamp.compose(stamp2);

    t.equal(run, 2, 'should invoke composer twice');

    t.end();
  });
};
