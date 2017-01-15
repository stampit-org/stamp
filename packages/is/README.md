# @stamp/is

_Various checking functions used with stamps_

```js
import {isStamp, isDescriptor, isComposable} from '@stamp/is';
// or
const {isStamp, isDescriptor, isComposable} = require('@stamp/is');
```

### isStamp(arg)
_`@stamp/is/stamp`_

Checks if passed argument is a function and has a `.compose()` property.

### isDescriptor(arg)
_`@stamp/is/descriptor`_

Checks if passed argument is considered a descriptor.

### isComposable(arg)
_`@stamp/is/composable`_

Checks if passed argument is considered as composable (aka stamp or descriptor).
