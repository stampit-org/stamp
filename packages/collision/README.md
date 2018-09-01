# @stamp/collision

_Controls collision behavior: forbid, defer or pipe_

This stamp (aka behavior) will check if there are any conflicts on every `compose` call. 
Throws an `Error` in case of a forbidden collision or ambiguous setup.

## Usage

```js
import Collision from '@stamp/collision';

const ForbidRedrawCollision = Collision.collisionSetup({methods: {redraw: "forbid" }});
```

Or if you don't want to import the stamp you can import only the method:
```js
import {collisionSetup} from '@stamp/collision';
const ForbidRedrawCollision = collisionSetup({methods: {redraw: "forbid" }});
```


The `defer` collects same named methods and wraps them into a single method which returns an array of returned values.
```js
import Collision from '@stamp/collision';

import {Border, Button, Graph} from './drawable/primitives';

const UiComponent = Collision.collisionSetup({methods: {draw: "defer" }})
.compose(Border, Button, Graph);

const component = UiComponent();
const array = component.draw(42); // will draw() all three primitives
```


The `pipe` collects same named methods and wraps them into a single method which pipes method returned values one into another
```js
import Collision from '@stamp/collision';

const UserDetails = stampit({
  props: {
    firstName: "John",
    lastName: "Smith"
  },
  methods: {
    toJSON(previous) {
      return {...previous, firstName: this.firstName, lastName: this.lastName};
    }
  }
});
const UserAuth = stampit({
  props: {
    email: "john@example.com",
    password: "hashedpassword"
  },
  methods: {
    toJSON(previous) {
      return {...previous, email: this.email, password: this.password};
    }
  }
});

const User = Collision.collisionSetup({methods: {toJSON: "pipe" }})
.compose(UserDetails, UserAuth);

const user = User();
const json = user.toJSON();
/*
{ email: 'john@example.com',
  password: 'hashedpassword',
  firstName: 'John',
  lastName: 'Smith' }
*/
```

## API

### Forbid, Defer or Pipe an exclusive method
`stamp.collisionSetup({ [META]: { [NAME]: TYPE } }) -> Stamp`
Where:
* `META` - String, one of "methods", "properties", "deepProperties", "propertyDescriptors", "staticProperties", "staticDeepProperties", "staticPropertyDescriptors", "configuration", "deepConfiguration".
* `NAME` - String, the name of your method, property, etc.
* `TYPE` - String, one of "forbid", "defer", "pipe". 

Example:
```js
MyStamp = MyStamp.collisionSetup({ methods: { setPassword: "forbid" }});
```

### Forbid, Defer or Pipe an all the methods
`stamp.collisionSetup({ [META]: TYPE }) -> Stamp`

Example:
```js
MyStamp = MyStamp.collisionSetup({ methods: "forbid" });
```

### Forbid, Defer or Pipe everything (NOT RECOMMENDED TO USE)
`stamp.collisionSetup(TYPE) -> Stamp`

Example - effectively disables any further composition:
```js
MyStamp = MyStamp.collisionSetup("forbid");
```

### Remove (reset) all the collision settings
```js
MyStamp = MyStamp.setupCollision(null);
```

### Remove (reset) some collision settings
```js
MyStamp = MyStamp.setupCollision({ methods: null });
```



## Example

See the comments in the code:
```js
import compose from '@stamp/compose';
import Collision from '@stamp/collision';
import Privatize from '@stamp/privatize';

// General purpose behavior to defer "draw()" method collisions
const DeferDraw = Collision.collisionSetup({methods: {draw: "defer"}});

const draw1 = jest.fn(); // Spy function
const Border = compose(DeferDraw, {
  methods: {
    draw: draw1
  }
});
const draw2 = jest.fn(); // Spy function
const Button = compose(DeferDraw, {
  methods: {
    draw: draw2
  }
});

// General purpose behavior to privatize the "draw()" method
const PrivateDraw = Privatize.privatizeMethods('draw');

// General purpose behavior to forbid the "redraw()" method collision
const ForbidRedrawCollision = Collision.collisionSetup({methods: {redraw: "forbid"}});

// The aggregating component
const ModalDialog = compose(PrivateDraw) // privatize the "draw()" method
  .compose(Border, Button) // modal will consist of Border and Button
  .compose(ForbidRedrawCollision) // there can be only one "redraw()" method
  .compose({
    methods: {
      // the public method which calls the deferred private methods
      redraw(int) {
        this.draw(int);
      }
    }
  });

// Creating an instance of the stamp
const dialog = ModalDialog();

// Check if the "draw()" method is actually privatized
expect(dialog.draw).toBeUndefined();

// Calling the public method, which calls the deferred private methods
dialog.redraw(42);

// Check if the spy "draw()" deferred functions were actually invoked
expect(draw1).toBeCalledWith(42);
expect(draw2).toBeCalledWith(42);

// Make sure the ModalDialog throws every time on the "redraw()" collisions
const HaveRedraw = compose({methods: {redraw() {}}});
expect(() => compose(ModalDialog, HaveRedraw)).toThrow();
```
