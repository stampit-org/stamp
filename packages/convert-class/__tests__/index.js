const compose = require('@stamp/compose');
const convertClass = require('..');

describe('@stamp/convert-class', function () {
  it('does not throw', function () {
    expect(Object.keys(convertClass().compose)).toHaveLength(0);
    expect(Object.keys(convertClass(null).compose)).toHaveLength(0);
    expect(Object.keys(convertClass(NaN).compose)).toHaveLength(0);
    expect(Object.keys(convertClass(-0).compose)).toHaveLength(0);
    expect(Object.keys(convertClass(1).compose)).toHaveLength(0);
    expect(Object.keys(convertClass(() => {}).compose)).toHaveLength(0);
  });

  it('converts a simple class', function () {
    class C1 {
      constructor (arg1) {
        this.prop1 = arg1;
      }

      // prop1 = ''

      method1 () {
        return this.prop1;
      }

      static sm1 () {}
    }

    const S = convertClass(C1);

    expect(S.name).toBe('C1');
    expect(S.compose.initializers.length).toBe(1);
    expect(S.compose.methods.method1).toBe(C1.prototype.method1);
    expect(S.compose.staticProperties.sm1).toBe(C1.sm1);
    expect(S('parent').method1()).toBe((new C1('parent')).method1());
  });

  it('converts a child class', function () {
    class C1 {
      constructor (arg1) {
        this.prop1 = arg1;
      }

      // prop1 = ''

      method1 () {
        return this.prop1;
      }

      static sm1 () {}
    }

    class C2 extends C1 {
      constructor (arg1, arg2) {
        super(arg1);
        this.prop2 = arg2;
      }

      // prop2 = ''

      method2 () {
        return this.prop2;
      }

      static sm2 () {}
    }

    const S = convertClass(C2);

    expect(S.name).toBe('C2');
    expect(S.compose.initializers.length).toBe(1);
    expect(S.compose.methods.method1).toBe(C1.prototype.method1);
    expect(S.compose.methods.method2).toBe(C2.prototype.method2);
    expect(S.compose.staticProperties.sm1).toBe(C1.sm1);
    expect(S.compose.staticProperties.sm2).toBe(C2.sm2);
    expect(S('parent', 'child').method1()).toBe((new C2('parent', 'child')).method1());
    expect(S('parent', 'child').method2()).toBe((new C2('parent', 'child')).method2());

  });

  it('should take override into account', function () {
    class C1 {
      constructor (arg1) {
        this.prop1 = arg1;
      }

      // prop1 = ''

      method () {
        return this.prop1;
      }

      static sm () {}
    }

    class C2 extends C1 {
      constructor (arg1, arg2) {
        super(arg1);
        this.prop2 = arg2;
      }

      // prop2 = ''

      method () {
        return this.prop2;
      }

      static sm () {}
    }

    const S = convertClass(C2);

    expect(S.compose.methods.method).not.toBe(C1.prototype.method);
    expect(S.compose.methods.method).toBe(C2.prototype.method);
    expect(S.compose.staticProperties.sm).not.toBe(C1.sm);
    expect(S.compose.staticProperties.sm).toBe(C2.sm);
  });

  it('result can be composed', function () {
    class C1 {
      constructor (arg1) {
        this.prop1 = arg1;
      }

      // prop1 = ''

      method1 () {
        return this.prop1;
      }

      static sm1 () {}
    }

    class C2 extends C1 {
      constructor (arg1, arg2) {
        super(arg1);
        this.prop2 = arg2;
      }

      // prop2 = ''

      method2 () {
        return this.prop2;
      }

      static sm2 () {}
    }

    const S1 = convertClass(C1);
    const S2 = convertClass(C2);

    expect(S1.compose({ properties: { p: 1 } })().p).toBe(1);
    expect(S2.compose({ methods: { m () {return 1;} } })().m()).toBe(1);
    expect(S2.compose({ initializers: [() => 1] })()).toBe(1);
    expect(S2.compose({ initializers: [() => 1] })()).toBe(1);
    expect(compose({ initializers: [() => null] }, S2)()).toBe(null);
  });

  it('super is delegated in method and static methods', function () {
    class C1 {
      constructor (arg1) {
        this.prop1 = arg1;
      }

      // prop1 = ''

      method () {
        return 'parent';
      }

      static sm () {
        return 'parent';
      }
    }

    class C2 extends C1 {
      constructor (arg1, arg2) {
        super(arg1);
        this.prop2 = arg2;
      }

      // prop2 = ''

      method () {
        return super.method(); // calling the parent method
      }

      static sm () {
        return super.sm(); // calling the parent method
      }
    }

    const S = convertClass(C2);

    expect(S().method()).toBe('parent');
    expect(S().method).toBe((new C2()).method);
    expect(S().method).not.toBe((new C1()).method);

    expect(S.sm()).toBe('parent');
    expect(S.sm).toBe(C2.sm);
    expect(S.sm).not.toBe(C1.sm);
  });
});
