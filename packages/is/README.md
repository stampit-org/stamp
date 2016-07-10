# @stamp/is

_Various checking functions used with stamps_

```js
import {
  isObject,
  isFunction,
  isStamp,
  isComposable,
  isDescriptor
} from '@stamp/is';
```

### isObject(arg)
_`@stamp/is/object`_

Checks if passed argument is truthy and is object or a function.

### isFunction(arg)
_`@stamp/is/function`_

Checks if passed argument is a function.

### isStamp(arg)
_`@stamp/is/stamp`_

Checks if passed argument is a function and has a `compose` property.

### isComposable(arg)
_`@stamp/is/composable`_

Checks if passed argument is considered as composable.

### isDescriptor(arg)
_`@stamp/is/descriptor`_

Checks if passed argument is considered a descriptor.
