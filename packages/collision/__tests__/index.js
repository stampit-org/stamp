/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-function */

'use strict';

const compose = require('@stamp/compose');
const Collision = require('..');

// interface Draws {
//   draw(): void;
// }

// interface DrawsAsync {
//   draw(): Promise<void>;
// }

// interface DrawsStamp extends Stamp {
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   (options?: object, ...args: unknown[]): Draws;
// }

// interface DrawsAsyncStamp extends Stamp {
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   (options?: object, ...args: unknown[]): DrawsAsync;
// }

// interface Reduces {
//   push(accumulator: string[]): string[];
//   replaceThis(this: any): any;
// }

// interface PushesAsync {
//   push(accumulator: string[]): Promise<string[]>;
//   replaceThis(this: any): Promise<any>;
// }

// interface ReducerStamp extends Stamp {
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   (options?: object, ...args: unknown[]): Reduces;
// }

// interface PushesAsyncStamp extends Stamp {
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   (options?: object, ...args: unknown[]): PushesAsync;
// }

// type HasPushValue = { pushValue: string };
// type HasValue = { value: string };

// type PushFunction = ReducerFunction & HasPushValue;
// type ReplaceThisFunction = ThisReducerFunction & HasValue;

// type PushAsyncFunction = ReducerAsyncFunction & HasPushValue;
// type ReplaceThisAsyncFunction = ThisReducerAsyncFunction & HasValue;

// type AsyncInitializer = Initializer;

// interface Node {
//   value: string;
// }

const Different = compose({
  methods: {
    whatever() {},
  },
});

describe('@stamp/collision', () => {
  describe('methods', () => {
    describe('map', () => {
      const draw1 = jest.fn();
      draw1.mockReturnValue({ a: 1 });
      const Aggregate1 = compose(
        {
          methods: {
            draw: draw1,
          },
        },
        Collision.collisionSetup({ methods: { map: ['draw'] } })
      );

      const draw2 = jest.fn();
      draw2.mockReturnValue({ b: 2 });
      const Aggregate2 = Collision.collisionSetup({ methods: { map: ['draw'] } }).compose({
        methods: {
          draw: draw2,
        },
      });

      const draw3 = jest.fn();
      draw3.mockReturnValue({ c: 3 });
      const Regular = compose({
        methods: {
          draw: draw3,
        },
      });

      const mockList = [draw1, draw2, draw3];

      it('aggregates two stamps', () => {
        const StampCombined = compose(Aggregate1, Aggregate2);
        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ a: 1 }, { b: 2 }]);
        mockList.slice(0, 2).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', () => {
        const StampCombined = compose(Aggregate2, Regular);
        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ b: 2 }, { c: 3 }]);
        mockList.slice(1).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of one', () => {
        const StampCombined = compose(Regular, Aggregate2);
        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ c: 3 }, { b: 2 }]);
        mockList.slice(1).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);
        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
        mockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', () => {
        const StampCombined = compose(Regular, compose(Aggregate1, Aggregate2));
        const obj = StampCombined();

        const result = obj.draw();

        expect(result).toStrictEqual([{ c: 3 }, { a: 1 }, { b: 2 }]);
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

      const push3 = jest.fn(makePushFunction('3'));
      const Regular = compose({
        methods: {
          push: push3,
        },
      });

      const mockList = [push1, push2, push3];

      it('aggregates two stamps', () => {
        const StampCombined = compose(Aggregate1, Aggregate2);
        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['1', '2']);

        mockList.slice(0, 2).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', () => {
        const StampCombined = compose(Aggregate2, Regular);
        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['2', '3']);
        mockList.slice(1).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);
        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['1', '2', '3']);
        mockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));
        const obj = StampCombined();

        const result = obj.push([]);

        expect(result).toStrictEqual(['3', '2', '1']);
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

      const replaceThis3 = jest.fn(makeReplaceThisFunction('3'));
      const Regular = compose({
        methods: {
          replaceThis: replaceThis3,
        },
      });

      const mockList = [replaceThis1, replaceThis2, replaceThis3];

      it('aggregates two stamps', () => {
        const StampCombined = compose(Aggregate1, Aggregate2);
        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '2' });
        mockList.slice(0, 2).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', () => {
        const StampCombined = compose(Aggregate2, Regular);
        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '3' });
        mockList.slice(1).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);
        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '3' });
        mockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));
        const obj = StampCombined();

        const result = obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '1' });
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
      const draw1 = jest.fn();
      draw1.mockReturnValue({ a: 1 });
      const Aggregate1 = compose(
        {
          methods: {
            async draw() {
              return draw1();
            },
          },
        },
        Collision.collisionSetup({ methods: { mapAsync: ['draw'] } })
      );

      const draw2 = jest.fn();
      draw2.mockReturnValue({ b: 2 });
      const Aggregate2 = Collision.collisionSetup({ methods: { mapAsync: ['draw'] } }).compose({
        methods: {
          async draw() {
            return draw2();
          },
        },
      });

      const draw3 = jest.fn();
      draw3.mockReturnValue({ c: 3 });
      const Regular = compose({
        methods: {
          async draw() {
            return draw3();
          },
        },
      });

      const mockList = [draw1, draw2, draw3];

      it('aggregates two stamps', async () => {
        const StampCombined = compose(Aggregate1, Aggregate2);
        const obj = StampCombined();

        const result = await obj.draw();

        // eslint-disable-next-line jest/no-test-return-statement
        expect(result).toStrictEqual([{ a: 1 }, { b: 2 }]);
        mockList.slice(0, 2).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', async () => {
        const StampCombined = compose(Aggregate2, Regular);
        const obj = StampCombined();

        const result = await obj.draw();

        expect(result).toStrictEqual([{ b: 2 }, { c: 3 }]);
        mockList.slice(1).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', async () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);
        const obj = StampCombined();

        const result = await obj.draw();

        expect(result).toStrictEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
        mockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));
        const obj = StampCombined();

        const result = await obj.draw();

        expect(result).toStrictEqual([{ c: 3 }, { b: 2 }, { a: 1 }]);
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

      const push3 = jest.fn(makePushAsyncFunction('3'));
      const Regular = compose({
        methods: {
          push: push3,
        },
      });

      const mockList = [push1, push2, push3];

      it('aggregates two stamps', async () => {
        const StampCombined = compose(Aggregate1, Aggregate2);
        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['1', '2']);
        mockList.slice(0, 2).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', async () => {
        const StampCombined = compose(Aggregate2, Regular);
        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['2', '3']);
        mockList.slice(1).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', async () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);
        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['1', '2', '3']);
        mockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));
        const obj = StampCombined();

        const result = await obj.push([]);

        expect(result).toStrictEqual(['3', '2', '1']);
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

      const replaceThis3 = jest.fn(makeReplaceThisFunction('3'));
      const Regular = compose({
        methods: {
          replaceThis: replaceThis3,
        },
      });

      const mockList = [replaceThis1, replaceThis2, replaceThis3];

      it('aggregates two stamps', async () => {
        const StampCombined = compose(Aggregate1, Aggregate2);
        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '2' });
        mockList.slice(0, 2).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', async () => {
        const StampCombined = compose(Aggregate2, Regular);
        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '3' });
        mockList.slice(1).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', async () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);
        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '3' });
        mockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));
        const obj = StampCombined();

        const result = await obj.replaceThis.apply({ value: '0' });

        expect(result).toStrictEqual({ value: '1' });
        mockList.forEach((fn) => {
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
      const Aggregate1 = compose(
        {
          initializers: [init1],
        },
        Collision.collisionSetup({ initializers: { async: true } })
      );

      const init2 = jest.fn(makeInitAsyncFunction('2'));
      const Aggregate2 = Collision.collisionSetup({ initializers: { async: true } }).compose({
        initializers: [init2],
      });

      const init3 = jest.fn(makeInitAsyncFunction('3'));
      const Regular = compose({
        initializers: [init3],
      });

      const mockList = [init1, init2, init3];

      it('aggregates two stamps', async () => {
        const StampCombined = compose(Aggregate1, Aggregate2);
        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '2' });
        mockList.slice(0, 2).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of one + regular', async () => {
        const StampCombined = compose(Aggregate2, Regular);
        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '3' });
        mockList.slice(1).forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('aggregate of two + regular', async () => {
        const StampCombined = compose(compose(Aggregate1, Aggregate2), Regular);
        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '3' });
        mockList.forEach((fn) => {
          expect(fn).toHaveBeenCalled();
          fn.mockClear();
        });
      });

      it('regular + aggregate of two', async () => {
        const StampCombined = compose(Regular, compose(Aggregate2, Aggregate1));
        const obj = await StampCombined();

        expect(obj).toStrictEqual({ value: '1' });
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

      it('collisionSettingsReset', () => {
        expect(() => {
          Aggregate1.collisionSettingsReset();
        }).toThrow();
      });
    });
  });
});
