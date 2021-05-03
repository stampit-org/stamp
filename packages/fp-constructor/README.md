# @stamp/fp-constructor

- _Adds the `Stamp.of` static property referencing Stamp itself_
- _Adds the `instance.constructor` property referencing Stamp itself_

By composing the `@stamp/fp-constructor` into your stamp
```js
MyStamp = MyStamp.compose(FpConstructor);
```
you get the static method `.of`:
```js
MyStamp.of === MyStamp; // true
```

and the instance method, `.constructor`:
```js
instance = MyStamp(/* ...options */);
instance.constructor === MyStamp; // true
```

## Motivation

Frequently, it's desirable to instantiate a new instance of a given data type inside a generic function. However, JavaScript lacks a built-in way to do that which is reliable. Classes throw errors if you leave off `new`, and arrow function factories will throw if you try to instantiate an instance with `new`, and there's no standard way to inject a value into the new data type.

The `Stamp.of()` is a standard way to create a new value of a given stamp where the calling conventions are unambiguous: It does not require `new`, and you inject the value by passing the necessary arguments directly into the `.of()` static method.

Having the `.of()` method only solves half of the problem, though. You still need a way got get a handle on the stamp from an object instance. You can do that with the `instance.constructor()` method.

Here's an example of what you can do with the combination. The following `empty()` utility will return an empty instance of whatever supporting data type you pass in, including standard JavaScript arrays:

```js
const empty = ({ constructor } = {}) => constructor.of ?
  constructor.of() :
  undefined
;

const foo = [23];

console.log(
  empty(foo) // []
);
```

All [applicative functors](https://github.com/fantasyland/fantasy-land#applicative) in JavaScript should implement `.of()`.

## Usage

```js
import FpConstructor from '@stamp/fp-constructor';

MyStamp = MyStamp.compose(FpConstructor);
```

## API

### Static methods

#### methods
`stamp.of(...args) => Object`

### Instance methods

### methods
`instance.constructor(...args) => Object`
