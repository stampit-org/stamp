<img src="https://raw.githubusercontent.com/stampit-org/stampit-logo/master/stampit-logo.png" alt="stampit" width="320" />
# @stamp/it

_Utility belt implementation of the [compose](https://github.com/stampit-org/stamp-specification) standard_

This module is the new cool modern version of the [`stampit`](https://github.com/stampit-org/stampit) module. Consider `@stamp/it` as stampit v4.

## Usage

Install:
```bash
$ npm i -S @stamp/it 
```

Import:
```js
import stampit from '@stamp/it'
```

Or import utility functions only:
```js
import {
    methods,
    
    props,
    properties,
    
    statics,
    staticProperties,
    
    conf,
    configuration,
    
    deepProps,
    deepProperties,
    
    deepStatics,
    staticDeepProperties,
    
    deepConf,
    deepConfiguration,
    
    init,
    initializers,
    
    composers,
    
    propertyDescriptors,
    
    staticPropertyDescriptors
} from '@stamp/it'

const Stamp1 = methods({ foo() {} })
const Stamp2 = props({ bar: 'my bar' })
const Stamp3 = conf({ my: 'configuration' })
const Stamp4 = init(function (options, {stamp, instance, args}) {
  console.log('bla')
})
```

## API

### Arguments

See more examples in [this blog post](https://medium.com/@koresar/fun-with-stamps-episode-1-stamp-basics-e0627d81efe0).

Create a new empty stamp:
```js
const S1 = stampit()
```

Create a new stamp with a method:
```js
const S2 = stampit({
  methods: {
    myMethod() { }
  }
})
```

Create a new stamp with a property:
```js
const S3 = stampit({
  props: { // or properties:
    myProperty: 42
  }
})
```

Create a new stamp with a static property:
```js
const S4 = stampit({
  statics: { // or staticProperties:
    myStaticProperty: 42
  }
})
```

Create a new stamp with initializer(s):
```js
const S5 = stampit({
  init: function () { console.log('hi form initializer') }
})
// or
const S6 = stampit({
  init: [ // or initializers:
    function () { },
    function () { }
  ]
})
```

Create a new stamp with a configuration:
```js
const S7 = stampit({
  conf: { // or configuration:
    myConfiguration: { anything: 'here' }
  }
})
```

Compose the stamps above together:
```js
const Stamp = compose(S1, S2, S3, S4, S5, S6, S7)
console.log(Stamp)
// { compose: [function] { properties, methods, staticProperties, initializers, configuration } }

const obj = Stamp()
console.log(obj)
// { myProperty: 42 }
console.log(Object.getPrototypeOf(obj))
// { myMethod: [function] }
```

See more examples in [this blog post](https://medium.com/@koresar/fun-with-stamps-episode-1-stamp-basics-e0627d81efe0).


### Static methods

#### The Stamp.create() static method 

Calling `Stamp.create()` is identical to calling `Stamp()`.

#### Shortcut static methods

All stamps receive few static properties.
These are taken from the [`@stamp/shortcut`](https://github.com/stampit-org/stamp/blob/master/packages/shortcut/README.md) stamp.
For example:
```js
stampit()
  .props({ foo: 'foo' })
  .deepConf({ things: ['bar'] })
  .methods({ baz() {} })
  // etc
```


### Shortcut exported methods

The module exports a range of shortcut methods. 
These are taken from the [`@stamp/shortcut`](https://github.com/stampit-org/stamp/blob/master/packages/shortcut/README.md) stamp.
```js
import {methods, props, init, statics, /* etc */} from '@stamp/it'
```
Each returns a stampit-flavoured stamp. 

NOTE! Unlike the [`@stamp/shortcut`](https://www.npmjs.com/package/@stamp/shortcut) module, all the exported functions of `@stamp/it` are stampit-flavoured. Meaning that:
```js
import {methods} from '@stamp/it'
const Stamp = methods({ foo() {} })
.props({bar: 1})                    // THIS WILL WORK
.statics({baz: 2})                  // AND THIS WILL WORK TOO 
```
