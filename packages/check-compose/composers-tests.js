'use strict';

const test = require('tape');
const _ = require('lodash');

module.exports = (compose) => {
  test('composer arguments', (t) => {
    let executed = 0;
    let passedStamp;
    function composer(...args) {
      t.equal(args.length, 1, 'have single argument');
      t.ok(_.isPlainObject(args[0]), 'argument is an object');
      t.ok(_.isArray(args[0].composables), 'composables passed');
      const composers = args[0].composables.reduce((all, c) => {
        const descr = c.compose || c;
        if (_.isArray(descr.composers)) return all.concat(descr.composers);
        return all;
      }, []);
      t.ok(_.isArray(composers), 'have the composers list');
      t.ok(_.includes(composers, composer), 'our composer is present');
      executed += 1;
      passedStamp = args[0].stamp;
    }
    const stamp = compose({
      composers: [composer],
    });

    t.ok(stamp.compose.composers, 'should add .composers');
    t.ok(_.includes(stamp.compose.composers, composer), 'should include our composer');
    t.equal(executed, 1, 'should be executed while composing');
    t.equal(passedStamp, stamp, 'stamp passed');

    t.end();
  });

  test('two composers should be executed on composition', (t) => {
    let executed1 = 0;
    let executed2 = 0;
    let stamp1;
    let stamp2;
    const actualStamp = compose({
      composers: [
        function composer1(ref) {
          const { stamp } = ref;

          stamp1 = stamp;
          executed1 += 1;
        },
        function composer2(ref) {
          const { stamp } = ref;

          stamp2 = stamp;
          executed2 += 1;
        },
      ],
    });

    t.equal(stamp1, actualStamp, 'stamp passed to first composer');
    t.equal(stamp2, actualStamp, 'stamp passed to second composer');
    t.equal(executed1, 1, 'first composer executed');
    t.equal(executed2, 1, 'second composer executed');

    t.end();
  });

  test('compose({ composers() }).compose({ composers() })', (t) => {
    let executed1 = 0;
    let executed2 = 0;
    let stamp1;
    let stamp2;
    const actualStamp = compose({
      composers: [
        function composers(ref) {
          const { stamp } = ref;

          stamp1 = stamp;
          executed1 += 1;
        },
      ],
    }).compose({
      composers: [
        function composers(ref) {
          const { stamp } = ref;

          stamp2 = stamp;
          executed2 += 1;
        },
      ],
    });

    t.equal(stamp1, actualStamp, 'stamp passed to first composer');
    t.equal(stamp2, actualStamp, 'stamp passed to second composer');
    t.equal(executed1, 2, 'first composer executed twice');
    t.equal(executed2, 1, 'second composer executed');

    t.end();
  });

  test('composer returned value replaces stamp', (t) => {
    const replacement = compose();
    const stamp = compose({
      composers: [
        function composers() {
          return replacement;
        },
      ],
    });

    t.equal(stamp, replacement, 'composer returned value should replace original stamp');

    t.end();
  });

  test('composer returned non-stamp value should be ignored', (t) => {
    const replacement = compose();
    const stamp = compose({
      composers: [
        function composers() {
          return () => {}; // non-stamp
        },
      ],
    });

    t.notEqual(stamp, replacement, 'composer returned value should not replace original stamp');

    t.end();
  });

  test('first composer returned value passed to the second composer', (t) => {
    const replacement = compose();
    let stamp2;
    compose(
      {
        composers: [
          function composers() {
            return replacement;
          },
        ],
      },
      {
        composers: [
          function composers() {
            stamp2 = replacement;
          },
        ],
      }
    );

    t.equal(stamp2, replacement, 'second composer should get first composer return value');

    t.end();
  });

  test('composers should be deduped', (t) => {
    const stamp2 = compose();
    const stamp = compose({ composers: [function composers() {}] });

    const result = stamp
      .compose(stamp2)
      .compose({})
      .compose(stamp);
    const { composers } = result.compose;
    t.equal(_.uniq(composers).length, composers.length, 'should dedupe composers');

    t.end();
  });

  test('stamp.compose({ composers() }) passes full composables array', (t) => {
    let run = 0;
    const stamp2 = compose();
    function composer(...args) {
      const { composables } = args[0];

      run += 1;

      const composers = args[0].composables.reduce((all, c) => {
        const descr = c.compose || c;
        if (_.isArray(descr.composers)) return all.concat(descr.composers);
        return all;
      }, []);

      if (run === 1) {
        t.ok(_.includes(composers, composer), 'our composer is present');
      }
      if (run === 2) {
        t.ok(_.includes(composers, composer), 'inheriting stamp should still pass our composer');
        t.ok(_.includes(composables, stamp), 'composables must contain stamp itself'); // eslint-disable-line no-use-before-define
        t.ok(_.includes(composables, stamp2), 'composables must contain second stamp too');
      }
    }
    const stamp = compose({
      composers: [composer],
    });

    stamp.compose(stamp2);

    t.equal(run, 2, 'should invoke composer twice');

    t.end();
  });
};
