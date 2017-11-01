var compose = require('@stamp/compose');
var Configure = require('..');

describe('Configure', function () {
  it('should allow composition', function () {
    var MyStamp = compose(Configure, {
      methods: {
        foo: function () {
          return 'bar'
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.foo()).toBe('bar');
  });

  it('should keep config property private to outside access', function () {
    var MyStamp = compose(Configure);

    var objectInstance = MyStamp();
    expect(objectInstance.config).toBeUndefined();
  })

  it('should make config property accessible from methods', function () {
    var MyStamp = compose(Configure, {
      methods: {
        read: function () {
          return this.config
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.read()).toBeTruthy();
  })

  it('should assign values from stamp configuration to config property', function () {
    var MyStamp = compose(Configure, {
      configuration: {
        test: 'foo',
      },
      methods: {
        read: function () {
          return this.config
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.read().test).toBe('foo')
  })

  it('should assign values from stamp deepConfiguration to config property', function () {
    var MyStamp = compose(Configure, {
      deepConfiguration: {
        test: ['foo', 'bar'],
      },
      methods: {
        read: function () {
          return this.config
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.read().test).toEqual(['foo', 'bar'])
  })

  it('should take configuration over deepConfiguration when name conflict', function () {
    var MyStamp = compose(Configure, {
      configuration: {
        test: 'foo',
      },
      deepConfiguration: {
        test: ['foo', 'bar'],
      },
      methods: {
        read: function () {
          return this.config
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.read().test).toEqual('foo')
  })

  it('should forbid any mutations to config object', function () {
    var MyStamp = compose(Configure, {
      configuration: {
        test: 'foo',
      },
      methods: {
        write: function () {
          return this.config.test = 'bar'
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.write).toThrow()
  })

});

describe('Configure.noPrivatize()', function () {
  it('should allow composition', function () {
    var MyStamp = compose(Configure.noPrivatize(), {
      methods: {
        foo: function () {
          return 'bar'
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.foo()).toBe('bar');
  });

  it('should make config property accessible to outside access', function () {
    var MyStamp = compose(Configure.noPrivatize());

    var objectInstance = MyStamp();
    expect(objectInstance.config).toEqual({});
  })

  it('should make config property accessible from methods', function () {
    var MyStamp = compose(Configure.noPrivatize(), {
      methods: {
        read: function () {
          return this.config
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.read()).toBeTruthy();
  })

  it('should assign values from stamp configuration to config property', function () {
    var MyStamp = compose(Configure.noPrivatize(), {
      configuration: {
        test: 'foo',
      },
      methods: {
        read: function () {
          return this.config
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.read().test).toBe('foo')
  })

  it('should assign values from stamp deepConfiguration to config property', function () {
    var MyStamp = compose(Configure.noPrivatize(), {
      deepConfiguration: {
        test: ['foo', 'bar'],
      },
      methods: {
        read: function () {
          return this.config
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.read().test).toEqual(['foo', 'bar'])
  })

  it('should take configuration over deepConfiguration when name conflict', function () {
    var MyStamp = compose(Configure.noPrivatize(), {
      configuration: {
        test: 'foo',
      },
      deepConfiguration: {
        test: ['foo', 'bar'],
      },
      methods: {
        read: function () {
          return this.config
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.read().test).toEqual('foo')
  })

  it('should forbid any mutations to config object', function () {
    var MyStamp = compose(Configure.noPrivatize(), {
      configuration: {
        test: 'foo',
      },
      methods: {
        write: function () {
          return this.config.test = 'bar'
        }
      }
    });

    var objectInstance = MyStamp();
    expect(objectInstance.write).toThrow()
  })

});
