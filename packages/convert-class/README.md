# @stamp/convert-class

Converts an ES6 class to a stamp respecting the class's inheritance chain. The prototype chain is squashed into the `methods` of a stamp.

`npm i -S @stamp/convert-class`

# Example

```js
class CParent {
  constructor(arg1) {
    this.parentProp = arg1
  }

  commonMethod() { return 'parent' }
  parentMethod() { return 'parent' }

  static commonStaticMethod() { return 'parent' }
  static parentStaticMethod() { return 'parent' }
}

class CChild extends CParent {
  constructor(arg1, arg2) {
    super(arg1)
    this.childProp = arg2
  }

  commonMethod() { return super.commonMethod() } // overriding parent method 
  childMethod() { return 'child' }

  static commonStaticMethod() { return super.commonStaticMethod() } // overriding parent static method
  static childStaticMethod() { return 'child' }
}

const convertClass = require('@stamp/convert-class');

const Stamp = convertClass(CChild);

// parent class method
Stamp.compose.methods.parentMethod === CParent.prototype.parentMethod;
// child class method
Stamp.compose.methods.childMethod === CChild.prototype.childMethod;
// the overridden method
Stamp.compose.methods.commonMethod === CChild.prototype.commonMethod;
// The `super` inside regular method is delegated to parent
Stamp().commonMethod() === (new CChild()).commonMethod() === 'parent';

// parent static method
Stamp.parentStaticMethod === CParent.parentStaticMethod;
// child static method
Stamp.childStaticMethod === CChild.childStaticMethod;
// the overridden static method
Stamp.commonStaticMethod === CChild.commonStaticMethod;
// The `super` inside static methods of child classes is also delegated to parent 
Stamp.commonStaticMethod() === CChild.commonStaticMethod() === 'parent';
```
