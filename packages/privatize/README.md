# @stamp/privatize

_Makes all properties and optional methods private_

Inspired by the [`private-class`](https://github.com/parro-it/private-class) module.

This stamp (aka behavior) will create a proxy object. Its methods would delegate all the calls to the original object instance.

All the properties are made private. Methods privatization is optional and can be done via the `privatizeMethods` static function.

## Usage
```js
import Privatize from '@stamp/privatize';

import Auth from './stamps/auth';

const AuthWithPrivateProperties = Auth.compose(Privatize);

const AuthWithPrivatePropertiesAndMethod = Auth.compose(Privatize).privatizeMethods('setPassword');
```

## Example
```js
let accessFoo, accessBar;
const Original = compose({
  properties: {foo: 1},
  methods: {
    bar() {},
    checkAccess() {
      accessFoo = this.foo;
      accessBar = this.bar;
    }
  }
});

// Add Privitize behavior, additionally protect the 'bar' method 
const Stamp = Original.compose(Privatize).privatizeMethods('bar');

// The properties and the method 'bar' are undefined
const instance = Stamp();
expect(instance.foo).toBeUndefined();
expect(instance.bar).toBeUndefined();

// But the 'checkAccess' method have access to the properties and 'bar'
instance.checkAccess();
expect(accessFoo).toBe(1);
expect(accessBar).toBe(Original.compose.methods.bar);
```
