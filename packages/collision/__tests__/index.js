/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-function */

'use strict';

const compose = require('@stamp/compose');
const Collision = require('..');

const Different = compose({
  methods: {
    whatever() {},
  },
});

describe('@stamp/collision', () => {
  describe('methods', () => {
    describe('collision static methods', () => {
      const Unconfigured = Collision.collisionSetup(null);

      const foo1 = () => {};
      const foo2 = () => {};
      const fnList = [foo1, foo2];
      const domain = 'methods';

      it('wrong parameters', () => {
        expect(() => Unconfigured.collisionGetAggregates(domain)).toThrow();
        expect(() => Unconfigured.collisionHasAggregates(domain)).toThrow();
        expect(() => Unconfigured.collisionSetAggregates(fnList, domain)).toThrow();
      });

      it('collisionGetAggregates unconfigured', () => {
        expect(Unconfigured.collisionGetAggregates(domain, 'foo')).toBeUndefined();
      });

      it('collisionHasAggregates unconfigured', () => {
        expect(Unconfigured.collisionHasAggregates(domain, 'foo')).toStrictEqual(false);
      });

      it('collisionSetAggregates unconfigured', () => {
        expect(() => Unconfigured.collisionSetAggregates(fnList, domain, 'foo')).toThrow();
      });

      it('configured + no proxy function', () => {
        const Configured = Collision.collisionSetup({ methods: { map: ['foo'] } });

        expect(() => Configured.collisionSetAggregates(fnList, domain, 'foo')).toThrow();
        expect(Configured.collisionGetAggregates(domain, 'foo')).toBeUndefined();
        expect(Configured.collisionHasAggregates(domain, 'foo')).toStrictEqual(false);
      });

      it('configured + proxy function', () => {
        const Configured = Collision.collisionSetup({ methods: { map: ['foo'] } }).compose({
          methods: {
            foo: foo1,
          },
        });

        expect(() => Configured.collisionSetAggregates(fnList, domain, 'foo')).toThrow();
        expect(Configured.collisionGetAggregates(domain, 'foo')).toBeUndefined();
        expect(Configured.collisionHasAggregates(domain, 'foo')).toStrictEqual(false);
      });

      it('configured + 2 proxy functions', () => {
        const Configured1 = Collision.collisionSetup({ methods: { map: ['foo'] } })
          .compose({
            methods: {
              foo: foo1,
            },
          })
          .compose({
            methods: {
              foo: foo2,
            },
          });

        const Configured2 = compose(Configured1);
        const Configured3 = compose(Configured1);

        const newFnList = [foo2, foo1];

        expect(Configured1.collisionGetAggregates(domain, 'foo')).toStrictEqual(fnList);
        expect(Configured1.collisionHasAggregates(domain, 'foo')).toStrictEqual(true);
        expect(() => Configured2.collisionSetAggregates([foo1], domain, 'foo')).not.toThrow();
        expect(() => Configured2.collisionSetAggregates([foo2], domain, 'foo')).toThrow();
        expect(() => Configured3.collisionSetAggregates([foo2], domain, 'foo')).not.toThrow();
        expect(() => Configured3.collisionSetAggregates([foo1], domain, 'foo')).toThrow();
        expect(() => Configured1.collisionSetAggregates(newFnList, domain, 'foo')).not.toThrow();
        expect(Configured1.collisionGetAggregates(domain, 'foo')).not.toStrictEqual(fnList);
        expect(Configured1.collisionGetAggregates(domain, 'foo')).toStrictEqual(newFnList);
        expect(Configured1.collisionHasAggregates(domain, 'foo')).toStrictEqual(true);
      });
    });

    describe('map', () => {
      const draw1 = jest.fn();
      draw1.mockReturnValue({ a: '1' });
      const Aggregate1 = compose(
        {
          methods: {
            draw: draw1,
          },
        },
        Collision.collisionSetup({ methods: { map: ['draw'] } })
      );

      const draw2 = jest.fn();
      draw2.mockReturnValue({ b: '2' });
      const Aggregate2 = Collision.collisionSetup({ methods: { map: ['draw'] } }).compose({
        methods: {
          draw: draw2,
        },
      });

      const drawRegular = jest.fn();
      drawRegular.mockReturnValue({ r: 'R' });
      const Regular = compose({
        methods: {
          draw: drawRegular,
        },
      });

      const mockList = [draw1, draw2, drawRegular];

      it('aggregates two stamps', () => {
        const StampCombined = compose(Aggregate1, Aggregate2);

        const myMockList = mockList.slice(0, 2);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ a: '1' }, { b: '2' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', () => {
        const StampCombined = compose(Aggregate2, Regular);

        const myMockList = mockList.slice(1);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ b: '2' }, { r: 'R' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of one', () => {
        const StampCombined = compose(Regular, Aggregate2);

        const myMockList = [drawRegular, draw2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ r: 'R' }, { b: '2' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);

        const myMockList = mockList;
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ a: '1' }, { b: '2' }, { r: 'R' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate + regular + aggregate', async () => {
        const StampCombined = compose(compose(Aggregate1), Regular, compose(Aggregate2));

        const myMockList = [draw1, drawRegular, draw2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ a: '1' }, { r: 'R' }, { b: '2' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));

        const myMockList = [drawRegular, draw2, draw1];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ r: 'R' }, { b: '2' }, { a: '1' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate without conflicts', () => {
        expect(() => {
          compose(Aggregate1, Aggregate2, Regular, Different);
        }).not.toThrow();
        expect(() => {
          compose(Different, Regular, Aggregate2, Aggregate1);
        }).not.toThrow();
      });

      it('forbid', () => {
        const Forbid = compose(
          {
            methods: {
              draw() {},
            },
          },
          Collision.collisionSetup({ methods: { forbid: ['draw'] } })
        );

        expect(() => {
          compose(Forbid, Aggregate1);
        }).toThrow();
        expect(() => {
          compose(Aggregate1, Forbid);
        }).toThrow();

        expect(() => {
          compose(Regular, Forbid);
        }).toThrow();
        expect(() => {
          compose(Forbid, Regular);
        }).toThrow();
      });
    });

    describe('reduce', () => {
      function makePushFunction(name) {
        const fn = function push(accumulator, currentValue, index, array) {
          accumulator.push(push.pushValue);
          return accumulator;
        };
        Object.defineProperty(fn, 'pushValue', { value: name, configurable: false });
        return fn;
      }

      const push1 = jest.fn(makePushFunction('1'));
      const Aggregate1 = compose(
        {
          methods: {
            push: push1,
          },
        },
        Collision.collisionSetup({ methods: { reduce: ['push'] } })
      );

      const push2 = jest.fn(makePushFunction('2'));
      const Aggregate2 = Collision.collisionSetup({ methods: { reduce: ['push'] } }).compose({
        methods: {
          push: push2,
        },
      });

      const pushRegular = jest.fn(makePushFunction('R'));
      const Regular = compose({
        methods: {
          push: pushRegular,
        },
      });

      const mockList = [push1, push2, pushRegular];

      it('aggregates two stamps', () => {
        const StampCombined = compose(Aggregate1, Aggregate2);

        const myMockList = mockList.slice(0, 2);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['1', '2']);

        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', () => {
        const StampCombined = compose(Aggregate2, Regular);

        const myMockList = mockList.slice(1);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['2', 'R']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of one', () => {
        const StampCombined = compose(Regular, Aggregate2);

        const myMockList = [pushRegular, push2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['R', '2']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);

        const myMockList = mockList;
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['1', '2', 'R']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate + regular + aggregate', async () => {
        const StampCombined = compose(compose(Aggregate1), Regular, compose(Aggregate2));

        const myMockList = [push1, pushRegular, push2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['1', 'R', '2']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));

        const myMockList = [pushRegular, push2, push1];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['R', '2', '1']);
        mockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate without conflicts', () => {
        expect(() => {
          compose(Aggregate1, Aggregate2, Regular, Different);
        }).not.toThrow();
        expect(() => {
          compose(Different, Regular, Aggregate2, Aggregate1);
        }).not.toThrow();
      });

      it('forbid', () => {
        const Forbid = compose(
          {
            methods: {
              push() {},
            },
          },
          Collision.collisionSetup({ methods: { forbid: ['push'] } })
        );

        expect(() => {
          compose(Forbid, Aggregate1);
        }).toThrow();
        expect(() => {
          compose(Aggregate1, Forbid);
        }).toThrow();

        expect(() => {
          compose(Regular, Forbid);
        }).toThrow();
        expect(() => {
          compose(Forbid, Regular);
        }).toThrow();
      });
    });

    describe('reduceThis', () => {
      function makeReplaceThisFunction(value) {
        const fn = function replaceThis() {
          const node = {
            value: replaceThis.value,
          };
          return node;
        };
        Object.defineProperty(fn, 'value', { value, configurable: false });
        return fn;
      }

      const replaceThis1 = jest.fn(makeReplaceThisFunction('1'));
      const Aggregate1 = compose(
        {
          properties: {
            value: undefined,
          },
          methods: {
            replaceThis: replaceThis1,
          },
        },
        Collision.collisionSetup({ methods: { reduce: ['replaceThis'] } })
      );

      const replaceThis2 = jest.fn(makeReplaceThisFunction('2'));
      const Aggregate2 = Collision.collisionSetup({ methods: { reduce: ['replaceThis'] } }).compose({
        methods: {
          replaceThis: replaceThis2,
        },
      });

      const replaceThisRegular = jest.fn(makeReplaceThisFunction('R'));
      const Regular = compose({
        methods: {
          replaceThis: replaceThisRegular,
        },
      });

      const mockList = [replaceThis1, replaceThis2, replaceThisRegular];

      it('aggregates two stamps', () => {
        const StampCombined = compose(Aggregate1, Aggregate2);

        const myMockList = mockList.slice(0, 2);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '2' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', () => {
        const StampCombined = compose(Aggregate2, Regular);

        const myMockList = mockList.slice(1);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: 'R' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of one', () => {
        const StampCombined = compose(Regular, Aggregate2);

        const myMockList = [replaceThisRegular, replaceThis2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '2' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);

        const myMockList = mockList;
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: 'R' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate + regular + aggregate', async () => {
        const StampCombined = compose(compose(Aggregate1), Regular, compose(Aggregate2));

        const myMockList = [replaceThis1, replaceThisRegular, replaceThis2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '2' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));

        const myMockList = [replaceThisRegular, replaceThis2, replaceThis1];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '1' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate without conflicts', () => {
        expect(() => {
          compose(Aggregate1, Aggregate2, Regular, Different);
        }).not.toThrow();
        expect(() => {
          compose(Different, Regular, Aggregate2, Aggregate1);
        }).not.toThrow();
      });

      it('forbid', () => {
        const Forbid = compose(
          {
            methods: {
              replaceThis() {},
            },
          },
          Collision.collisionSetup({ methods: { forbid: ['replaceThis'] } })
        );

        expect(() => {
          compose(Forbid, Aggregate1);
        }).toThrow();
        expect(() => {
          compose(Aggregate1, Forbid);
        }).toThrow();

        expect(() => {
          compose(Regular, Forbid);
        }).toThrow();
        expect(() => {
          compose(Forbid, Regular);
        }).toThrow();
      });
    });

    describe('mapAsync', () => {
      function makeDrawAsyncFunction(returnValue) {
        const fn = async function draw() {
          return returnValue;
        };
        Object.defineProperty(fn, 'pushValue', { value: returnValue, configurable: false });
        return fn;
      }

      const draw1 = jest.fn(makeDrawAsyncFunction({ a: '1' }));
      const Aggregate1 = compose(
        {
          methods: {
            draw: draw1,
          },
        },
        Collision.collisionSetup({ methods: { mapAsync: ['draw'] } })
      );

      const draw2 = jest.fn(makeDrawAsyncFunction({ b: '2' }));
      const Aggregate2 = Collision.collisionSetup({ methods: { mapAsync: ['draw'] } }).compose({
        methods: {
          draw: draw2,
        },
      });

      const drawRegular = jest.fn(makeDrawAsyncFunction({ r: 'R' }));
      const Regular = compose({
        methods: {
          draw: drawRegular,
        },
      });

      const mockList = [draw1, draw2, drawRegular];

      it('aggregates two stamps', async () => {
        const StampCombined = compose(Aggregate1, Aggregate2);

        const myMockList = mockList.slice(0, 2);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.draw();

        // eslint-disable-next-line jest/no-test-return-statement
        expect(result).toStrictEqual([{ a: '1' }, { b: '2' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', async () => {
        const StampCombined = compose(Aggregate2, Regular);

        const myMockList = mockList.slice(1);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.draw();

        expect(result).toStrictEqual([{ b: '2' }, { r: 'R' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of one', async () => {
        const StampCombined = compose(Regular, Aggregate2);

        const myMockList = [drawRegular, draw2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.draw();

        expect(result).toStrictEqual([{ r: 'R' }, { b: '2' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', async () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);

        const myMockList = mockList;
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.draw();

        expect(result).toStrictEqual([{ a: '1' }, { b: '2' }, { r: 'R' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate + regular + aggregate', async () => {
        const StampCombined = compose(compose(Aggregate1), Regular, compose(Aggregate2));

        const myMockList = [draw1, drawRegular, draw2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.draw();

        expect(result).toStrictEqual([{ a: '1' }, { r: 'R' }, { b: '2' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));

        const myMockList = [drawRegular, draw2, draw1];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'draw');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.draw();

        expect(result).toStrictEqual([{ r: 'R' }, { b: '2' }, { a: '1' }]);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate without conflicts', () => {
        expect(() => {
          compose(Aggregate1, Aggregate2, Regular, Different);
        }).not.toThrow();
        expect(() => {
          compose(Different, Regular, Aggregate2, Aggregate1);
        }).not.toThrow();
      });

      it('forbid', () => {
        const Forbid = compose(
          {
            methods: {
              draw() {},
            },
          },
          Collision.collisionSetup({ methods: { forbid: ['draw'] } })
        );

        expect(() => {
          compose(Forbid, Aggregate1);
        }).toThrow();
        expect(() => {
          compose(Aggregate1, Forbid);
        }).toThrow();

        expect(() => {
          compose(Regular, Forbid);
        }).toThrow();
        expect(() => {
          compose(Forbid, Regular);
        }).toThrow();
      });
    });

    describe('reduceAsync', () => {
      function makePushAsyncFunction(name) {
        const fn = async function push(accumulatorPromise, currentValue, index, array) {
          return accumulatorPromise.then((accumulator) => {
            accumulator.push(push.pushValue);
            return accumulator;
          });
        };
        Object.defineProperty(fn, 'pushValue', { value: name, configurable: false });
        return fn;
      }

      const push1 = jest.fn(makePushAsyncFunction('1'));
      const Aggregate1 = compose(
        {
          methods: {
            push: push1,
          },
        },
        Collision.collisionSetup({ methods: { reduceAsync: ['push'] } })
      );

      const push2 = jest.fn(makePushAsyncFunction('2'));
      const Aggregate2 = Collision.collisionSetup({ methods: { reduceAsync: ['push'] } }).compose({
        methods: {
          push: push2,
        },
      });

      const pushRegular = jest.fn(makePushAsyncFunction('R'));
      const Regular = compose({
        methods: {
          push: pushRegular,
        },
      });

      const mockList = [push1, push2, pushRegular];

      it('aggregates two stamps', async () => {
        const StampCombined = compose(Aggregate1, Aggregate2);

        const myMockList = mockList.slice(0, 2);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['1', '2']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', async () => {
        const StampCombined = compose(Aggregate2, Regular);

        const myMockList = mockList.slice(1);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['2', 'R']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of one', async () => {
        const StampCombined = compose(Regular, Aggregate2);

        const myMockList = [pushRegular, push2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['R', '2']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', async () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);

        const myMockList = mockList;
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['1', '2', 'R']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate + regular + aggregate', async () => {
        const StampCombined = compose(compose(Aggregate1), Regular, compose(Aggregate2));

        const myMockList = [push1, pushRegular, push2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['1', 'R', '2']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));

        const myMockList = [pushRegular, push2, push1];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'push');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['R', '2', '1']);
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate without conflicts', () => {
        expect(() => {
          compose(Aggregate1, Aggregate2, Regular, Different);
        }).not.toThrow();
        expect(() => {
          compose(Different, Regular, Aggregate2, Aggregate1);
        }).not.toThrow();
      });

      it('forbid', () => {
        const Forbid = compose(
          {
            methods: {
              push() {},
            },
          },
          Collision.collisionSetup({ methods: { forbid: ['push'] } })
        );

        expect(() => {
          compose(Forbid, Aggregate1);
        }).toThrow();
        expect(() => {
          compose(Aggregate1, Forbid);
        }).toThrow();

        expect(() => {
          compose(Regular, Forbid);
        }).toThrow();
        expect(() => {
          compose(Forbid, Regular);
        }).toThrow();
      });
    });

    describe('reduceThisAsync', () => {
      function makeReplaceThisFunction(value) {
        const fn = async function replaceThis() {
          const node = {
            value: replaceThis.value,
          };
          return node;
        };
        Object.defineProperty(fn, 'value', { value, configurable: false });
        return fn;
      }

      const replaceThis1 = jest.fn(makeReplaceThisFunction('1'));
      const Aggregate1 = compose(
        {
          properties: {
            value: undefined,
          },
          methods: {
            replaceThis: replaceThis1,
          },
        },
        Collision.collisionSetup({ methods: { reduceThisAsync: ['replaceThis'] } })
      );

      const replaceThis2 = jest.fn(makeReplaceThisFunction('2'));
      const Aggregate2 = Collision.collisionSetup({ methods: { reduceThisAsync: ['replaceThis'] } }).compose({
        methods: {
          replaceThis: replaceThis2,
        },
      });

      const replaceThisRegular = jest.fn(makeReplaceThisFunction('R'));
      const Regular = compose({
        methods: {
          replaceThis: replaceThisRegular,
        },
      });

      const mockList = [replaceThis1, replaceThis2, replaceThisRegular];

      it('aggregates two stamps', async () => {
        const StampCombined = compose(Aggregate1, Aggregate2);

        const myMockList = mockList.slice(0, 2);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '2' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', async () => {
        const StampCombined = compose(Aggregate2, Regular);

        const myMockList = mockList.slice(1);
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: 'R' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of one', async () => {
        const StampCombined = compose(Regular, Aggregate2);

        const myMockList = [replaceThisRegular, replaceThis2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '2' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', async () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);

        const myMockList = mockList;
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: 'R' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate + regular + aggregate', async () => {
        const StampCombined = compose(compose(Aggregate1), Regular, compose(Aggregate2));

        const myMockList = [replaceThis1, replaceThisRegular, replaceThis2];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '2' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));

        const myMockList = [replaceThisRegular, replaceThis2, replaceThis1];
        const aggregates = StampCombined.collisionGetAggregates('methods', 'replaceThis');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '1' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate without conflicts', async () => {
        expect(() => {
          compose(Aggregate1, Aggregate2, Regular, Different);
        }).not.toThrow();
        expect(() => {
          compose(Different, Regular, Aggregate2, Aggregate1);
        }).not.toThrow();
      });

      it('forbid', () => {
        const Forbid = compose(
          {
            methods: {
              replaceThis() {},
            },
          },
          Collision.collisionSetup({ methods: { forbid: ['replaceThis'] } })
        );

        expect(() => {
          compose(Forbid, Aggregate1);
        }).toThrow();
        expect(() => {
          compose(Aggregate1, Forbid);
        }).toThrow();

        expect(() => {
          compose(Regular, Forbid);
        }).toThrow();
        expect(() => {
          compose(Forbid, Regular);
        }).toThrow();
      });
    });

    it('collisionProtectAnyMethod', () => {
      const FooBar = compose(
        {
          methods: {
            foo() {},
            bar() {},
          },
        },
        Collision.collisionProtectAnyMethod()
      );
      const Foo = compose(
        {
          methods: {
            foo() {},
          },
        },
        Collision.collisionProtectAnyMethod()
      );
      const Bar = compose(
        {
          methods: {
            bar() {},
          },
        },
        Collision.collisionProtectAnyMethod()
      );

      expect(() => {
        compose(FooBar, Foo);
      }).toThrow();
      expect(() => {
        compose(Foo, FooBar);
      }).toThrow();
      expect(() => {
        compose(FooBar, Bar);
      }).toThrow();
      expect(() => {
        compose(Bar, FooBar);
      }).toThrow();
      expect(() => {
        compose(Foo, Bar);
      }).not.toThrow();
      expect(() => {
        compose(Bar, Foo);
      }).not.toThrow();
    });

    it('collisionProtectAnyMethod multiple times same stamp', () => {
      const Base = compose(
        {
          methods: {
            foo() {},
            bar() {},
          },
        },
        Collision.collisionProtectAnyMethod()
      );
      const Stamp1 = compose(Base);
      const Stamp2 = compose(Base);
      const Stamp3 = compose(Base);

      expect(() => {
        compose(Stamp1, Stamp2);
      }).not.toThrow();
      expect(() => {
        compose(Stamp1, Stamp2, Stamp3);
      }).not.toThrow();
      expect(() => {
        compose(Stamp1).compose(Stamp2, Stamp3);
      }).not.toThrow();
      expect(() => {
        compose(Stamp1, Stamp2).compose(Stamp3);
      }).not.toThrow();
    });

    it('collisionProtectAnyMethod + allow', () => {
      const FooBar = compose(
        {
          methods: {
            foo() {},
            bar() {},
          },
        },
        Collision.collisionProtectAnyMethod({ methods: { allow: ['foo'] } })
      );
      const Foo = compose(
        {
          methods: {
            foo() {},
          },
        },
        Collision.collisionProtectAnyMethod()
      );
      const Bar = compose(
        {
          methods: {
            bar() {},
          },
        },
        Collision.collisionProtectAnyMethod()
      );

      expect(() => {
        compose(FooBar, Foo);
      }).not.toThrow();
      expect(() => {
        compose(Foo, FooBar);
      }).not.toThrow();
      expect(() => {
        compose(FooBar, Bar);
      }).toThrow();
      expect(() => {
        compose(Bar, FooBar);
      }).toThrow();
      expect(() => {
        compose(Foo, Bar);
      }).not.toThrow();
      expect(() => {
        compose(Bar, Foo);
      }).not.toThrow();
    });

    it('forbid + allow', () => {
      expect(() => {
        Collision.collisionSetup({ methods: { allow: ['foo'], forbid: ['foo'] } });
      }).toThrow(/Collision/);
    });

    it('can be used as a standalone function', () => {
      const { collisionSetup } = Collision;
      expect(() => {
        collisionSetup({ methods: { allow: ['foo'], forbid: ['foo'] } });
      }).toThrow(/Collision/);
    });

    it('forbid without conflicts', () => {
      const Forbid = compose(
        {
          methods: {
            draw() {},
          },
        },
        Collision.collisionSetup({ methods: { forbid: ['draw'] } })
      );
      const Regular = compose({
        methods: {
          whatever() {},
        },
      });

      expect(() => {
        compose(Forbid, Regular);
      }).not.toThrow();
      expect(() => {
        compose(Regular, Forbid);
      }).not.toThrow();
    });

    it('collisionSettingsReset', () => {
      const Forbid = compose(
        {
          methods: {
            draw() {},
          },
        },
        Collision.collisionSetup({ methods: { forbid: ['draw'] } })
      );
      const Resetted1 = Forbid.collisionSettingsReset();
      const Aggregate = compose(
        {
          methods: {
            draw() {},
          },
        },
        Collision.collisionSetup({ methods: { map: ['draw'] } })
      );
      const Resetted2 = Aggregate.collisionSettingsReset();
      const Regular = compose({
        methods: {
          draw() {},
        },
      });

      expect(() => {
        compose(Resetted1, Resetted2);
      }).not.toThrow();
      expect(() => {
        compose(Resetted1, Regular);
      }).not.toThrow();
      expect(() => {
        compose(Resetted2, Resetted1);
      }).not.toThrow();
      expect(() => {
        compose(Regular, Resetted1);
      }).not.toThrow();
    });

    it('broken metadata', () => {
      const UndefinedMethod = Collision.collisionSetup({ methods: { forbid: ['foo'] } }).compose({
        methods: {
          draw: null,
        },
      });

      const NoAggregate = compose(Collision, {
        methods: {
          draw() {},
        },
      });
      NoAggregate.compose.deepConfiguration = {
        ...NoAggregate.compose.deepConfiguration,
        ...{ Collision: { map: undefined } },
      };

      const NoForbid = compose(Collision, {
        methods: {
          draw() {},
        },
      });
      NoAggregate.compose.deepConfiguration = {
        ...NoAggregate.compose.deepConfiguration,
        ...{ Collision: { forbid: undefined } },
      };

      expect(() => {
        compose(UndefinedMethod, NoForbid);
      }).not.toThrow();
      expect(() => {
        compose(UndefinedMethod, NoAggregate);
      }).not.toThrow();
    });
  });

  describe('initializers', () => {
    describe('collision static methods', () => {
      const Unconfigured = Collision.collisionSetup(null);

      const foo1 = async () => {};
      const foo2 = async () => {};
      const fnList = [foo1, foo2];
      const domain = 'initializers';

      it('wrong parameters', () => {
        expect(() => Unconfigured.collisionGetAggregates(domain, 'foo')).toThrow();
        expect(() => Unconfigured.collisionHasAggregates(domain, 'foo')).toThrow();
        expect(() => Unconfigured.collisionSetAggregates(fnList, domain, 'foo')).toThrow();
      });

      it('collisionGetAggregates unconfigured', () => {
        expect(Unconfigured.collisionGetAggregates(domain)).toBeUndefined();
      });

      it('collisionHasAggregates unconfigured', () => {
        expect(Unconfigured.collisionHasAggregates(domain)).toStrictEqual(false);
      });

      it('collisionSetAggregates unconfigured', () => {
        expect(() => Unconfigured.collisionSetAggregates(fnList, domain)).toThrow();
      });

      it('configured + no proxy function', () => {
        const Configured = Collision.collisionSetup({ initializers: { async: true } });

        expect(() => Configured.collisionSetAggregates(fnList, domain)).toThrow();
        expect(Configured.collisionGetAggregates(domain)).toBeUndefined();
        expect(Configured.collisionHasAggregates(domain)).toStrictEqual(false);
      });

      it('configured + proxy function', () => {
        const Configured = Collision.collisionSetup({ initializers: { async: true } }).compose({
          initializers: [foo1],
        });

        const myFnList1 = [foo1];
        const myFnList2 = [foo2];

        expect(Configured.collisionGetAggregates(domain)).toStrictEqual(myFnList1);
        expect(Configured.collisionHasAggregates(domain)).toStrictEqual(true);
        expect(() => Configured.collisionSetAggregates(fnList, domain)).toThrow();
        expect(Configured.collisionGetAggregates(domain)).toStrictEqual(myFnList1);
        expect(Configured.collisionHasAggregates(domain)).toStrictEqual(true);

        expect(() => Configured.collisionSetAggregates(myFnList2, domain)).toThrow();
        expect(Configured.collisionGetAggregates(domain)).toStrictEqual(myFnList1);
        expect(Configured.collisionHasAggregates(domain)).toStrictEqual(true);
      });

      it('configured + 2 proxy functions', () => {
        const Configured1 = Collision.collisionSetup({ initializers: { async: true } })
          .compose({
            initializers: [foo1],
          })
          .compose({
            initializers: [foo2],
          });

        const Configured2 = compose(Configured1);
        const Configured3 = compose(Configured1);

        const newFnList = [foo2, foo1];

        expect(Configured1.collisionGetAggregates(domain)).toStrictEqual(fnList);
        expect(Configured1.collisionHasAggregates(domain)).toStrictEqual(true);
        expect(() => Configured2.collisionSetAggregates([foo1], domain)).not.toThrow();
        expect(() => Configured2.collisionSetAggregates([foo2], domain)).toThrow();
        expect(() => Configured3.collisionSetAggregates([foo2], domain)).not.toThrow();
        expect(() => Configured3.collisionSetAggregates([foo1], domain)).toThrow();
        expect(() => Configured1.collisionSetAggregates(newFnList, domain)).not.toThrow();
        expect(Configured1.collisionGetAggregates(domain)).not.toStrictEqual(fnList);
        expect(Configured1.collisionGetAggregates(domain)).toStrictEqual(newFnList);
        expect(Configured1.collisionHasAggregates(domain)).toStrictEqual(true);
      });
    });

    describe('async', () => {
      function makeInitAsyncFunction(name) {
        const fn = async function init() {
          return {
            value: init.value,
          };
        };
        Object.defineProperty(fn, 'value', { value: name, configurable: false });
        return fn;
      }

      const init1 = jest.fn(makeInitAsyncFunction('1'));
      init1.mockName('init1');
      const Aggregate1 = compose(
        {
          initializers: [init1],
        },
        Collision.collisionSetup({ initializers: { async: true } })
      );

      const init2 = jest.fn(makeInitAsyncFunction('2'));
      init2.mockName('init2');
      const Aggregate2 = Collision.collisionSetup({ initializers: { async: true } }).compose({
        initializers: [init2],
      });

      const initRegular = jest.fn(makeInitAsyncFunction('R'));
      initRegular.mockName('initRegular');
      const Regular = compose({
        initializers: [initRegular],
      });

      const initRejects = jest.fn(async () => {
        throw new Error('No way, man!');
      });
      initRejects.mockName('initRejects');
      const Rejects = compose({
        initializers: [initRejects],
      });

      const initSync = jest.fn(() => {
        return {
          value: 'S',
        }
      });
      initSync.mockName('initSync');
      const Sync = compose({
        initializers: [initSync],
      });

      const initSyncRejects = jest.fn(() => {
          throw new Error('No way, man!');
      });
      initSyncRejects.mockName('initSyncRejects');
      const SyncRejects = compose({
        initializers: [initSyncRejects],
      });

      const mockList = [init1, init2, initRegular];

      it('aggregates two stamps', async () => {
        const StampCombined = compose(Aggregate1, Aggregate2);

        const myMockList = mockList.slice(0, 2);
        const aggregates = StampCombined.collisionGetAggregates('initializers');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '2' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', async () => {
        const StampCombined = compose(Aggregate2, Regular);

        const myMockList = mockList.slice(1);
        const aggregates = StampCombined.collisionGetAggregates('initializers');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: 'R' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', async () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);

        const myMockList = mockList;
        const aggregates = StampCombined.collisionGetAggregates('initializers');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: 'R' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate + regular + aggregate', async () => {
        const StampCombined = compose(compose(Aggregate1), Regular, compose(Aggregate2));

        const myMockList = [init1, initRegular, init2];
        const aggregates = StampCombined.collisionGetAggregates('initializers');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '2' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));

        const myMockList = [initRegular, init2, init1];
        const aggregates = StampCombined.collisionGetAggregates('initializers');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '1' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate without conflicts', () => {
        expect(() => {
          compose(Aggregate1, Aggregate2, Regular, Different);
        }).not.toThrow();
        expect(() => {
          compose(Different, Regular, Aggregate2, Aggregate1);
        }).not.toThrow();
      });

      it('collisionSettingsReset', () => {
        expect(() => {
          Aggregate1.collisionSettingsReset();
        }).toThrow();
      });

      it('a single initializer is still aggregated', () => {
        const aggregates = Aggregate1.collisionGetAggregates('initializers') || [];
        expect(aggregates).toHaveLength(1);
      });

      it('initializers are deduped', () => {
        const stamp = compose(Aggregate1, Aggregate1);
        const aggregates = stamp.collisionGetAggregates('initializers') || [];
        expect(aggregates).toHaveLength(1);
      });

      it('chain starts with sync initializer', async () => {
        const StampCombined = compose(Sync, Aggregate2, Aggregate1);

        const myMockList = [initSync, init2, init1];
        const aggregates = StampCombined.collisionGetAggregates('initializers');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '1' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('mid-chain sync initializer', async () => {
        const StampCombined = compose(Aggregate2, Sync, Aggregate1);

        const myMockList = [init2, initSync, init1];
        const aggregates = StampCombined.collisionGetAggregates('initializers');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '1' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('chain ends with sync initializer', async () => {
        const StampCombined = compose(Aggregate2, Aggregate1, Sync);

        const myMockList = [init2, init1, initSync];
        const aggregates = StampCombined.collisionGetAggregates('initializers');
        expect(aggregates).toStrictEqual(myMockList);

        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: 'S' });
        myMockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('first promise rejects', async () => {
        const StampCombined = compose(Regular, compose(Rejects, Aggregate2, Aggregate1));
        return expect(StampCombined()).rejects.toThrow()
          .then(() => {
            expect(initRejects).toHaveBeenCalled();
            expect(init2).not.toHaveBeenCalled();
            expect(init1).not.toHaveBeenCalled();
            [init1, init2, initRejects].forEach(fn => fn.mockClear());
          });
      });

      it('mid-chain promise rejects', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Rejects, Aggregate1));
        return expect(StampCombined()).rejects.toThrow()
          .then(() => {
            expect(init2).toHaveBeenCalled();
            expect(initRejects).toHaveBeenCalled();
            expect(init1).not.toHaveBeenCalled();
            [init1, init2, initRejects].forEach(fn => fn.mockClear());
          });
      });

      it('last promise rejects', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1, Rejects));
        return expect(StampCombined()).rejects.toThrow()
          .then(() => {
            expect(init2).toHaveBeenCalled();
            expect(init1).toHaveBeenCalled();
            expect(initRejects).toHaveBeenCalled();
            [init1, init2, initRejects].forEach(fn => fn.mockClear());
          });
      });

      it('first sync initializer rejects', async () => {
        const StampCombined = compose(Regular, compose(SyncRejects, Aggregate2, Aggregate1));
        return expect(StampCombined()).rejects.toThrow()
          .then(() => {
            expect(initSyncRejects).toHaveBeenCalled();
            expect(init2).not.toHaveBeenCalled();
            expect(init1).not.toHaveBeenCalled();
            [init1, init2, initRejects].forEach(fn => fn.mockClear());
          });
      });

      it('mid-chain sync initializer rejects', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, SyncRejects, Aggregate1));
        return expect(StampCombined()).rejects.toThrow()
          .then(() => {
            expect(init2).toHaveBeenCalled();
            expect(initSyncRejects).toHaveBeenCalled();
            expect(init1).not.toHaveBeenCalled();
            [init1, init2, initRejects].forEach(fn => fn.mockClear());
          });
      });

      it('last sync initializer rejects', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1, SyncRejects));
        return expect(StampCombined()).rejects.toThrow()
          .then(() => {
            expect(init2).toHaveBeenCalled();
            expect(init1).toHaveBeenCalled();
            expect(initSyncRejects).toHaveBeenCalled();
            [init1, init2, initRejects].forEach(fn => fn.mockClear());
          });
      });
    });
  });
});
