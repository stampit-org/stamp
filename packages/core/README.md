# @stamp/core

_Core functions for creating stamps_

```js
const {assign, merge} = require('@stamp/core');
// or
import {assign, merge} from '@stamp/core';
```

### assign(dst, ...sources)
_`@stamp/core/assign`_

Mutates destination object with shallow assign of passed source objects. Returns destination object.

### merge(dst, ...sources)
_`@stamp/core/merge`_

* Mutates destination object by deeply merging passed source objects.
* Arrays are concatenated, not overwritten.
* Everything else but plain objects are copied by reference.

Returns destination object/array or a new object/array in case it was not.
