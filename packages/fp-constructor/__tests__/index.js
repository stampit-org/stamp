'use strict';

const compose = require('@stamp/compose');
const FpConstructor = require('..');

describe('@stamp/fp-constructor Stamp.of', function() {
  it('should add .of static method referring to the stamp', function() {
    const Stamp = compose(FpConstructor);

    expect(Stamp.of).toBe(Stamp);
  });

  it('should refer to the correct stamp regardless of other stamps in the composition', function() {
    const Stamp = compose({ staticProperties: { of: 1 } })
      .compose({ staticProperties: { of: 2 } }, FpConstructor, { staticProperties: { of: 3 } })
      .compose({ staticProperties: { of: 4 } });

    expect(Stamp.of).toBe(Stamp);
  });
});

describe('@stamp/fp-constructor instance.constructor', function() {
  it('should add .constructor method to the stamp', function() {
    const Stamp = compose(FpConstructor);
    const instance = Stamp();

    expect(instance.constructor).toBe(Stamp);
  });

  it('should not be an own prop on the instance', function() {
    const Stamp = compose(FpConstructor);
    const instance = Stamp();

    expect(Object.getPrototypeOf(instance).constructor).toBe(Stamp);
  });

  it('should refer to the correct stamp regardless of other stamps in the composition', function() {
    const Stamp = compose({ methods: { constructor: 1 } })
      .compose({ methods: { constructor: 2 } }, FpConstructor, { methods: { constructor: 3 } })
      .compose({ methods: { constructor: 4 } });
    const instance = Stamp();

    expect(instance.constructor).toBe(Stamp);
  });

  it('should not break other methods', function() {
    const foo = function foo() {};
    const bar = function bar() {};
    const Stamp = compose({ methods: { foo } })
      .compose(FpConstructor)
      .compose({ methods: { bar } });
    const instance = Stamp();

    expect(instance.foo).toBe(foo);
    expect(instance.bar).toBe(bar);
  });
});

describe('@stamp/fp-constructor Stamp.constructor (deprecated)', function() {
  it('should add .constructor static method referring to the stamp', function() {
    const Stamp = compose(FpConstructor);

    expect(Stamp.constructor).toBe(Stamp);
  });
});
