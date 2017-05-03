# @stamp/eventemittable

_Node.js' EventEmitter as a stamp_

```js
const EventEmittable = require('@stamp/eventemittable');
// or
import EventEmittable from '@stamp/eventemittable';
```

### Example

Create event emitter object:
```js
const emitter = EventEmittable();
```

Create a Stamp which implements Node.js' `EventEmitter` API via composition:
```js
import stampit from '@stamp/it';

const MyStamp = stampit({
  methods: {
   foo () {
     this.emit('foo', 'bar');
   }
  }
})
  .compose(EventEmittable);

const myObject = MyStamp();
myObject.on('foo', value => {
  console.log(`value: ${value}`);
});
myObject.foo(); // prints "value: bar"
```

### Notes

- For portability, this package consumes the userland `EventEmitter` implementation of the [events](https://npm.im/events) package.
- `domain`s are not supported.
