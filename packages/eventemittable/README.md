# @stamp/eventemittable

_Node.js' EventEmitter as a stamp_

```js
const EventEmittable = require('@stamp/eventemittable');
// or
import EventEmittable from '@stamp/eventemittable';
```

### Example

Create a Stamp which implements Node.js' `EventEmitter` API via composition:

```js
import EventEmittable from '@stamp/eventemittable';
import stampit from '@stamp/it';

const MyStamp = stampit({
  methods: {
   foo () {
     this.emit('foo', 'bar');
   }
  }
})
  .compose(EventEmittable);

const myStamp = MyStamp();
myStamp.on('foo', value => {
  console.log(`value: ${value}`);
});
myStamp.foo(); // prints "value: bar"
```

### Notes

- For portability, this package consumes the userland `EventEmitter` implementation of the [events](https://npm.im/events) package.
- `domain`s are not supported.
- `EventEmittable`'s methods are given precedence in the case of name collisions during composition.  In other words, if you must re-implement `on()` or another method, do it *after* composing.
- Any static methods of the `EventEmitter` implementation are not available.
