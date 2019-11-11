'use strict';

const merge = require('../merge');

describe('deep merge', function() {
  describe('argument safety', function() {
    it('returns first argument', function() {
      const obj = {};
      const actual = merge(obj, {});
      const expected = obj;

      expect(actual).toBe(expected, 'should return the first argument');
    });

    it('makes first argument an object if any', function() {
      const NULL = null;
      const actual = typeof merge(NULL, {});
      const expected = 'object';

      expect(actual).toBe(expected, 'should return object if first argument is not');
    });

    it('should work fine if source is undefined', function() {
      const obj = {};
      const actual = merge(obj, undefined);
      const expected = {};

      expect(actual).toEqual(expected, 'should return object if first argument is not');
    });
  });

  describe('objects', function() {
    const build = function(num) {
      const obj = { a: { merge: {} } };
      obj.a[num] = num;
      obj.a.merge[num] = num;

      return obj;
    };

    it('merge 1', function() {
      const actual = merge(build(1));
      const expected = build(1);

      expect(actual).toEqual(expected, 'should not touch the first argument');
    });

    it('merge 2', function() {
      const subject = merge(build(1), build(2));

      const actual = subject.a[2];
      const expected = 2;

      expect(actual).toBe(expected, 'should be merged from 2nd argument');
    });

    it('merge 3', function() {
      const subject = merge(build(1), build(2), build(3));

      const actual = subject.a[3];
      const expected = 3;

      expect(actual).toBe(expected, 'should be merged from subsequent arguments');
    });

    it('merge collision', function() {
      const actual = merge(
        {
          a: { b: 1 },
        },
        {
          a: { b: 2 },
        }
      ).a;
      const expected = { b: 2 };

      expect(actual).toEqual(expected, 'conflicts should be merged with last-in priority.');
    });
  });

  describe('functions', function() {
    it('should assign functions source', function() {
      function F() {}

      const actual = merge(
        {
          a: { b: 1 },
        },
        {
          a: F,
        }
      ).a;
      const expected = F;

      expect(actual).toBe(expected, 'function must be assigned');
    });

    it('should not merge to a function', function() {
      function F() {}

      F.x = 1;
      const actual = merge(
        {
          a: F,
        },
        {
          a: { b: 1 },
        }
      ).a;
      const expected = { b: 1 };

      expect(actual).toEqual(expected, 'function must be overwritten with plain object');
    });
  });

  describe('array', function() {
    const noop = function() {};
    const _ = function() {};
    _.a = 42;

    it('array replaces object', function() {
      const a = {
        foo: {
          bar: 'bam',
        },
      };
      const b = {
        foo: ['a', 'b', 'c'],
      };
      const expected = ['a', 'b', 'c'];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
      expect(actual).not.toBe(b.foo, 'array replacing object should be deep merged: c.foo !== b.foo');
    });

    it('object replaces array', function() {
      const a = {
        foo: ['a', 'b', 'c'],
      };
      const b = {
        foo: {
          bar: 'bam',
        },
      };
      const expected = {
        bar: 'bam',
      };

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);

      expect(actual).not.toBe(b.foo, 'object replacing array should be deep merged: c.foo !== b.foo');
    });

    it('array concat', function() {
      const a = {
        foo: [1, 2, 3],
      };
      const b = {
        foo: ['a', 'b', 'c'],
      };
      const expected = [1, 2, 3, 'a', 'b', 'c'];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
      expect(actual).not.toBe(b.foo, 'array should be deep merged from right: c.foo === b.foo');
    });

    it('number replaces array', function() {
      const a = {
        foo: [1, 2, 3],
      };
      const b = {
        foo: 99,
      };
      const expected = 99;

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces number', function() {
      const a = {
        foo: 99,
      };
      const b = {
        foo: [1, 2, 3],
      };
      const expected = [1, 2, 3];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('string replaces array', function() {
      const a = {
        foo: [1, 2, 3],
      };
      const b = {
        foo: 'abc',
      };
      const expected = 'abc';

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces string', function() {
      const a = {
        foo: 'abc',
      };
      const b = {
        foo: [1, 2, 3],
      };
      const expected = [1, 2, 3];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('boolean true replaces array', function() {
      const a = {
        foo: [1, 2, 3],
      };
      const b = {
        foo: true,
      };
      const expected = true;

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces boolean true', function() {
      const a = {
        foo: true,
      };
      const b = {
        foo: [1, 2, 3],
      };
      const expected = [1, 2, 3];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('boolean false replaces array', function() {
      const a = {
        foo: [1, 2, 3],
      };
      const b = {
        foo: false,
      };
      const expected = false;

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces boolean false', function() {
      const a = {
        foo: false,
      };
      const b = {
        foo: [1, 2, 3],
      };
      const expected = [1, 2, 3];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('null replaces array', function() {
      const a = {
        foo: [1, 2, 3],
      };
      const b = {
        foo: null,
      };
      const expected = null;

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces null', function() {
      const a = {
        foo: null,
      };
      const b = {
        foo: [1, 2, 3],
      };
      const expected = [1, 2, 3];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('array replaces undefined', function() {
      const a = {};
      const b = {
        foo: [1, _, noop],
      };
      const expected = [1, _, noop];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('undefined does not replace array', function() {
      const a = {
        foo: [1, _, noop],
      };
      const b = {
        foo: undefined,
      };
      const expected = [1, _, noop];

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('number replace array', function() {
      const a = {
        foo: [1, 2, 3],
      };
      const b = {
        foo: 42,
      };
      const expected = 42;

      const actual = merge(a, b).foo;
      const expectedMsg = `result expected  : ${JSON.stringify(expected)}`;

      expect(actual).toBe(expected, expectedMsg);
    });
  });
});
