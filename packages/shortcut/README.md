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
