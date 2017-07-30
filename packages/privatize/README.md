# @stamp/privatize

_Makes all properties and optional methods private_

Inspired by the [`private-class`](https://github.com/parro-it/private-class) module. **NOTE!** Requires WeakMap, thus won't work in IE10.

This stamp (aka behavior) will create a proxy object. Its methods would delegate all the calls to the original object instance.

All the properties are made private. Methods privatization is optional and can be done via the `privatizeMethods` static function.

## Usage
```js
import Privatize from '@stamp/privatize';

import Auth from './stamps/auth';

const AuthWithPrivateProperties = Auth.compose(Privatize);

const AuthWithPrivatePropertiesAndMethod = Auth.compose(Privatize).privatizeMethods('setPassword');
```

Or if you don't want to import the stamp you can import only the method:
```js
import {privatizeMethods} from '@stamp/privatize';
const AuthWithPrivatePropertiesAndMethod = Auth.compose(privatizeMethods('setPassword'));
```

## Warning!
Every property you assign in the initializers will be private.
```js
const Original = compose({
  initializers: function () {
    this.foo = 42; // THIS WILL BE PRIVATE
    this.bar = function () {}; // THIS WILL BE PRIVATE TOO
  }
});
Original().foo === undefined; 
Original().bar === undefined; 
```
This is a neat feature since you don't need to use JS closures to hide variables from external users.

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

## Smart use of configuration

If you ever was thinking how cool if it was having `configuration` (and `deepConfiguration`) accessible in your method without explicitly exposing it through initializer, with privatize stamp you can simply do this. First make your own extension to Private stamp.

```js
import Privatize from '@stamp/privatize';
const ConfiguredPrivatize = Privatize.compose({
  initializers: [(_, {stamp, instance}) => {
    instance.stampConfiguration = stamp.compose.configuration;
    instance.stampDeepConfiguration = stamp.compose.deepConfiguration;
  }]
})
export default ConfiguredPrivatize;
```

Then you can use for your other stamps and being able to access configuration within any method while still have it hidden from public sight.

```js
compose(ConfiguredPrivatize, {
    configuration: {
        secret: 'mykey'
    },
    methods: {
        encrypt(value) {
          const { secret } = this.stampConfiguration;
          // run encryption with secret while it's still hidden from outside
        }
    }
})
```
