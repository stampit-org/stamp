# @stamp/named

_Changes the `Stamp.name` property using the [new ES6 feature](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name)._

See supported platforms [here](http://kangax.github.io/compat-table/es6/#test-function_name_property). TL;DR: node>=6.5, iOS>=10, Edge, FF, Chrome, Safari

# Example

```js
const MyRegularStamp = compose(...);
console.log(MyRegularStamp.name); // 'Stamp'

import Named from '@stamp/named';

const MyNamedStamp = MyRegularStamp.compose(Named).setName('MyNamedStamp');
console.log(MyNamedStamp.name); // 'MyNamedStamp'


// All derived stamps will also be named 'MyNamedStamp' until changed:
let Stamp2 = compose(..., MyNamedStamp, ...);
console.log(Stamp2.name); // WARNING! Still 'MyNamedStamp' !!!

// Overwriting the name
Stamp2 = Stamp2.setName('Stamp2');
console.log(Stamp2.name); // 'Stamp2' :)
```
