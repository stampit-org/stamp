# @stamp/core

_Core functions for creating stamps_

```js
import {
  assign,
  merge,
  slice,
  values,
} from '@stamp/core';
```

### assign(dst, ...sources)
_`@stamp/core/assign`_

Mutates destination object with shallow assign of passed source objects. Returns destination object.

### merge(dst, ...sources)
_`@stamp/core/merge`_

Mutates destination object by deeply merging passed source objects. Arrays are concatenated, not overwritten. Returns destination object.

### slice(array)
_`@stamp/core/slice`_

Common function found in `Array.prototype.slice`.

### values(object)
_`@stamp/core/values`_

Uses `Object.values` if available, otherwise own implementation with same functionality is used.
