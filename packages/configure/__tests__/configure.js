/* eslint-disable jest/no-truthy-falsy */
/* eslint-disable jest/require-to-throw-message */
/* eslint-disable func-names */
/* eslint-disable no-return-assign */

'use strict';

const compose = require('@stamp/compose');
const Configure = require('..');

describe('configure', function() {
  it('should allow composition', function() {
    const MyStamp = compose(
      Configure,
      {
        methods: {
          foo() {
            return 'bar';
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.foo()).toBe('bar');
  });

  it('should keep config property private to outside access', function() {
    const MyStamp = compose(Configure);

    const objectInstance = MyStamp();
    expect(objectInstance.config).toBeUndefined();
  });

  it('should make config property accessible from methods', function() {
    const MyStamp = compose(
      Configure,
      {
        methods: {
          read() {
            return this.config;
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.read()).toBeTruthy();
  });

  it('should assign values from stamp configuration to config property', function() {
    const MyStamp = compose(
      Configure,
      {
        configuration: {
          test: 'foo',
        },
        methods: {
          read() {
            return this.config;
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.read().test).toBe('foo');
  });

  it('should assign values from stamp deepConfiguration to config property', function() {
    const MyStamp = compose(
      Configure,
      {
        deepConfiguration: {
          test: ['foo', 'bar'],
        },
        methods: {
          read() {
            return this.config;
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.read().test).toStrictEqual(['foo', 'bar']);
  });

  it('should take configuration over deepConfiguration when name conflict', function() {
    const MyStamp = compose(
      Configure,
      {
        configuration: {
          test: 'foo',
        },
        deepConfiguration: {
          test: ['foo', 'bar'],
        },
        methods: {
          read() {
            return this.config;
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.read().test).toStrictEqual('foo');
  });

  it('should forbid any mutations to config object', function() {
    const MyStamp = compose(
      Configure,
      {
        configuration: {
          test: 'foo',
        },
        methods: {
          write() {
            return (this.config.test = 'bar');
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.write).toThrow();
  });
});

describe('configure.noPrivatize()', function() {
  it('should allow composition', function() {
    const MyStamp = compose(
      Configure.noPrivatize(),
      {
        methods: {
          foo() {
            return 'bar';
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.foo()).toBe('bar');
  });

  it('should make config property accessible to outside access', function() {
    const MyStamp = compose(Configure.noPrivatize());

    const objectInstance = MyStamp();
    expect(objectInstance.config).toStrictEqual({});
  });

  it('should make config property accessible from methods', function() {
    const MyStamp = compose(
      Configure.noPrivatize(),
      {
        methods: {
          read() {
            return this.config;
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.read()).toBeTruthy();
  });

  it('should assign values from stamp configuration to config property', function() {
    const MyStamp = compose(
      Configure.noPrivatize(),
      {
        configuration: {
          test: 'foo',
        },
        methods: {
          read() {
            return this.config;
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.read().test).toBe('foo');
  });

  it('should assign values from stamp deepConfiguration to config property', function() {
    const MyStamp = compose(
      Configure.noPrivatize(),
      {
        deepConfiguration: {
          test: ['foo', 'bar'],
        },
        methods: {
          read() {
            return this.config;
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.read().test).toStrictEqual(['foo', 'bar']);
  });

  it('should take configuration over deepConfiguration when name conflict', function() {
    const MyStamp = compose(
      Configure.noPrivatize(),
      {
        configuration: {
          test: 'foo',
        },
        deepConfiguration: {
          test: ['foo', 'bar'],
        },
        methods: {
          read() {
            return this.config;
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.read().test).toStrictEqual('foo');
  });

  it('should forbid any mutations to config object', function() {
    const MyStamp = compose(
      Configure.noPrivatize(),
      {
        configuration: {
          test: 'foo',
        },
        methods: {
          write() {
            return (this.config.test = 'bar');
          },
        },
      }
    );

    const objectInstance = MyStamp();
    expect(objectInstance.write).toThrow();
  });
});
