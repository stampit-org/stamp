# @stamp/named

_Changes the `Stamp.name` property using the [new ES6 feature](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name)._

Supported platforms: node>=4, iOS>=10, Edge, FF, Chrome, Safari

If used in a non-supported environment (node <v4, or IE any version) then nothing will throw. But the `Stamp.name` will always be `"Stamp"`.

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
