# @stamp/fp-constructor

_Adds the Stamp.constructor property referencing Stamp itself_

By composing the `@stamp/fp-constructor` into your stamp
```js
MyStamp = MyStamp.compose(FpConstructor);
```
you get the static method `.constructor`:
```js
MyStamp.constructor === MyStamp // true
```

## Usage

```js
import FpConstructor from '@stamp/fp-constructor';

MyStamp = MyStamp.compose(FpConstructor);
```

## API

### Static methods

#### methods
`stamp.constructor(...args) -> Object`
