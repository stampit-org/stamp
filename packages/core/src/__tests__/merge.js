var merge = require('../merge');

describe('Deep merge', function () {

  describe('argument safety', function () {

    it('returns first argument', function () {
      var obj = {};
      var actual = merge(obj, {});
      var expected = obj;

      expect(actual).toBe(expected,
        'should return the first argument');
    });

    it('makes first argument an object if any', function () {
      var NULL = null;
      var actual = typeof merge(NULL, {});
      var expected = 'object';

      expect(actual).toBe(expected,
        'should return object if first argument is not');
    });

    it('should work fine if source is undefined', function () {
      var obj = {};
      var actual = merge(obj, undefined);
      var expected = {};

      expect(actual).toEqual(expected,
        'should return object if first argument is not');
    });
  });

  describe('objects', function () {

    var build = function (num) {
      var obj = {a: {merge: {}}};
      obj.a[num] = num;
      obj.a.merge[num] = num;

      return obj;
    };

    it('merge 1', function () {
      var actual = merge(build(1));
      var expected = build(1);

      expect(actual).toEqual(expected,
        'should not touch the first argument');
    });

    it('merge 2', function () {
      var subject = merge(build(1), build(2));

      var actual = subject.a[2];
      var expected = 2;

      expect(actual).toBe(expected,
        'should be merged from 2nd argument');
    });

    it('merge 3', function () {
      var subject = merge(build(1), build(2), build(3));

      var actual = subject.a[3];
      var expected = 3;

      expect(actual).toBe(expected,
        'should be merged from subsequent arguments');
    });

    it('merge collision', function () {
      var actual = merge(
        {
          a: {b: 1}
        },
        {
          a: {b: 2}
        }).a;
      var expected = {b: 2};

      expect(actual).toEqual(expected,
        'conflicts should be merged with last-in priority.');
    });
  });


  describe('functions', function () {

    it('should assign functions source', function () {
      function F() {}

      var actual = merge(
        {
          a: {b: 1}
        },
        {
          a: F
        }).a;
      var expected = F;

      expect(actual).toBe(expected,
        'function must be assigned');
    });

    it('should not merge to a function', function () {
      function F() {}

      F.x = 1;
      var actual = merge(
        {
          a: F
        },
        {
          a: {b: 1}
        }).a;
      var expected = {b: 1};

      expect(actual).toEqual(expected,
        'function must be overwritten with plain object');
    });
  });


  describe('array', function () {

    var noop = function () {};
    var _ = function () {};
    _.a = 42;

    it('array replaces object', function () {
      var a = {
        foo: {
          bar: 'bam'
        }
      };
      var b = {
        foo: ['a', 'b', 'c']
      };
      var expected = ['a', 'b', 'c'];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
      expect(actual).not.toBe(b.foo, 'array replacing object should be deep merged: c.foo !== b.foo');

    });

    it('object replaces array', function () {
      var a = {
        foo: ['a', 'b', 'c']
      };
      var b = {
        foo: {
          bar: 'bam'
        }
      };
      var expected = {
        bar: 'bam'
      };

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);

      expect(actual).not.toBe(b.foo, 'object replacing array should be deep merged: c.foo !== b.foo');
    });

    it('array concat', function () {
      var a = {
        foo: [1, 2, 3]
      };
      var b = {
        foo: ['a', 'b', 'c']
      };
      var expected = [1, 2, 3, 'a', 'b', 'c'];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
      expect(actual).not.toBe(b.foo, 'array should be deep merged from right: c.foo === b.foo');
    });

    it('number replaces array', function () {
      var a = {
        foo: [1, 2, 3]
      };
      var b = {
        foo: 99
      };
      var expected = 99;

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces number', function () {
      var a = {
        foo: 99
      };
      var b = {
        foo: [1, 2, 3]
      };
      var expected = [1, 2, 3];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('string replaces array', function () {
      var a = {
        foo: [1, 2, 3]
      };
      var b = {
        foo: 'abc'
      };
      var expected = 'abc';

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces string', function () {
      var a = {
        foo: 'abc'
      };
      var b = {
        foo: [1, 2, 3]
      };
      var expected = [1, 2, 3];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('boolean true replaces array', function () {
      var a = {
        foo: [1, 2, 3]
      };
      var b = {
        foo: true
      };
      var expected = true;

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces boolean true', function () {
      var a = {
        foo: true
      };
      var b = {
        foo: [1, 2, 3]
      };
      var expected = [1, 2, 3];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('boolean false replaces array', function () {
      var a = {
        foo: [1, 2, 3]
      };
      var b = {
        foo: false
      };
      var expected = false;

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces boolean false', function () {
      var a = {
        foo: false
      };
      var b = {
        foo: [1, 2, 3]
      };
      var expected = [1, 2, 3];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('null replaces array', function () {
      var a = {
        foo: [1, 2, 3]
      };
      var b = {
        foo: null
      };
      var expected = null;

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toBe(expected, expectedMsg);
    });

    it('array replaces null', function () {
      var a = {
        foo: null
      };
      var b = {
        foo: [1, 2, 3]
      };
      var expected = [1, 2, 3];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('array replaces undefined', function () {
      var a = {};
      var b = {
        foo: [1, _, noop]
      };
      var expected = [1, _, noop];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('undefined does not replace array', function () {
      var a = {
        foo: [1, _, noop]
      };
      var b = {
        foo: undefined
      };
      var expected = [1, _, noop];

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toEqual(expected, expectedMsg);
    });

    it('number replace array', function () {
      var a = {
        foo: [1, 2, 3]
      };
      var b = {
        foo: 42
      };
      var expected = 42;

      var actual = merge(a, b).foo;
      var expectedMsg = 'result expected  : ' + JSON.stringify(expected);

      expect(actual).toBe(expected, expectedMsg);
    });
  });
});
