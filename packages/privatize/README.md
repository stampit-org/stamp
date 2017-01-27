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
let accessPassword, accessSetPassword;
const Original = compose({
  properties: {password: '123'},
  methods: {
    setPassword(value) { this.password = value; },
    checkAccess() {
      accessPassword = this.password;
      accessSetPassword = this.setPassword;
    }
  }
});

// Add Privatize behavior, additionally protect the 'setPassword' method 
const Stamp = Original.compose(Privatize).privatizeMethods('setPassword');

// All properties and the method 'setPassword' are undefined
const instance = Stamp();
expect(instance.password).toBeUndefined();
expect(instance.setPassword).toBeUndefined();

// But the 'checkAccess' method have access to the properties and 'setPassword'
instance.checkAccess();
expect(accessPassword).toBe('123');
expect(accessSetPassword).toBe(Original.compose.methods.setPassword);
```
