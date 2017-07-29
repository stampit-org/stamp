# @stamp/arg-over-prop

_Assign properties passed to the stamp factory_

## Usage

```js
import ArgOverProp from '@stamp/arg-over-prop';

const StampA = compose({
    properties: {
        foo: 1
    }
})
.compose(ArgOverProp).argOverProp('foo');

const instance1 = StampA(); // { foo: 1 }
const instance2 = StampA({ foo: 999 }); // { foo: 999 }
```

A shorter but identical version of the same `StampA`:
```js
const StampA = ArgOverProp.argOverProp({foo: 1});
```

Basically, the `arg-over-prop` stamp sets properties in an initializer.
The code below is what the `StampA` becomes.
```js
const StampA = compose({
    properties: {
        foo: 1
    },
    initializers: [function (opts) {
        this.foo = opts.foo;
    }]
})
```


## Example

```js
import ArgOverProp from '@stamp/arg-over-prop';

const HasColor = ArgOverProp.argOverProp('color', 'background');
const HasPoint = ArgOverProp.argOverProp({ x: 0, y: 0 });

const ColorPoint = compose(HasColor, HasPoint);

const point = ColorPoint({ color: 'blue', x: 15 });

console.log(point.color); // "blue"
console.log(point.background); // undefined
console.log(point.x); // 15
console.log(point.y); // 0
```
