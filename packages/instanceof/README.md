# @stamp/instanceof

_Enables `obj instanceof MyStamp` in ES6 environments_

```js
const InstanceOf = require('@stamp/InstanceOf');
// or
import InstanceOf from '@stamp/InstanceOf';
```

### Example

Create a stamp:
```js
let MyStamp = compose({
  properties: { ... },
  initializers: [function () { ... }]
});
```

The following doesn't work:
```js
const obj = MyStamp();
obj instanceof MyStamp === false;
```

Compose the `InstanceOf` to your stamp:
```js
MyStamp = MyStamp.compose(InstanceOf);
```

Now it works:
```js
const myObject = MyStamp();
obj instanceof MyStamp === true;
```


### Notes

- We do not recommend to use `instanceof` in JavaScript in general.
