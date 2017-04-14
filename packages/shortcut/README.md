# @stamp/shortcut

_Adds few handy static methods for simpler composition_

By composing the `@stamp/shortcut` into your stamp
```js
MyStamp = MyStamp.compose(Shortcut);
```
you get few static methods. So, instead of typing
```js
MyStamp.compose({ deepProperties: bla });
```
you will be able to write
```js
MyStamp.deepProps(bla);

```

## Usage

```js
import Shortcut from '@stamp/shortcut';

const MyStamp = Shortcut
  .methods({ myMethod() {} })
  .props({ foo: 'foo' })
  .deepProps({ deepFoo: { foo: 'foo 2' } })
  .statics({ bar: 'bar' })
  .deepStatics({ deepBar: { bar: 'bar 2' } })
  .conf({ something: 'something' })
  .deepConf({ deepSomething: { something: 'something' } })
  .init((arg, {stamp, args, instance}) => { /* initializer */ })
  .composers(({stamp, composables}) => { /* composer */ });
```

Or you can import each individual shortcut function:
```js
import {
  methods, props, deepProps, statics, deepStatics, conf, deepConf, init, composers
} from '@stamp/shortcut';

const Stamp1 = methods({
  method1() { }
});
const Stamp2 = props({
  prop2: 2
});
const Stamp3 = init(function () {
  console.log(3);
});
// etc
```

In this case the functions will not add any static shortcut methods to your stamps, meaning that the following will throw:
```js
methods({ method1() {} }).props(); // Error: undefined "props" is not a function
init(function () {}).init(); // Error: undefined "init" is not a function
// etc
```


## API

### Static methods

#### methods
`stamp.methods(Object) -> Stamp`

#### props
`stamp.props(Object) -> Stamp`

#### deepProps
`stamp.deepProps(Object) -> Stamp`

#### statics
`stamp.statics(Object) -> Stamp`

#### deepStatics
`stamp.deepStatics(Object) -> Stamp`

#### conf
`stamp.conf(Object) -> Stamp`

#### deepConf
`stamp.deepConf(Object) -> Stamp`

#### init
`stamp.init(...Function) -> Stamp`

#### composers
`stamp.composers(...Function) -> Stamp`
