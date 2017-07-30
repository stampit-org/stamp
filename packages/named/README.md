# @stamp/named

_Changes the `Stamp.name` property using the [new ES6 feature](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name)._

[Supported platforms](http://kangax.github.io/compat-table/es6/#test-function_name_property_isn't_writable,_is_configurable): node>=4, iOS>=10, Edge, FF, Chrome, Safari

If used in a non-supported environment (node <v4, or IE any version) then nothing will throw. But the `Stamp.name` will always be `"Stamp"`.

# Example

Default behaviour (without this stamp):
```js
const MyRegularStamp = compose(...);
console.log(MyRegularStamp.name); // 'Stamp'
```

New behaviour:
```js
import Named from '@stamp/named';

const MyNamedStamp = MyRegularStamp.compose(Named).setName('MyNamedStamp');
```

Or if you don't want to import the stamp you can import only the method:
```js
import {setName} from '@stamp/named';
const MyNamedStamp = MyRegularStamp.compose(setName('MyNamedStamp'));
```

Then stamp receives a different name instead of the default "Stamp":
```js
console.log(MyNamedStamp.name); // 'MyNamedStamp'
```

Derived stamps behaviour:
```js
// All derived stamps will also be named 'MyNamedStamp' until changed:
let Stamp2 = compose(..., MyNamedStamp, ...);
console.log(Stamp2.name); // WARNING! Still 'MyNamedStamp' !!!

// Overwriting the name
Stamp2 = Stamp2.setName('Stamp2');
console.log(Stamp2.name); // 'Stamp2' :)
```
