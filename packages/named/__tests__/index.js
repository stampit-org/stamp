var compose = require('@stamp/compose');
var Named = require('..');

// Check if current environment supports function renaming
var supported = false;
const F = compose();
try {
  Object.defineProperty(F, 'name', {
    value: 'TEST'
  });
} catch (err) {}
supported = F.name === 'TEST';

function checkFunctionName(func, name) {
  if (supported) expect(func.name).toBe(name);
}

describe('@stamp/named', function () {
  it('setName sets the name', function () {
    const S = compose(Named).setName('foo');
    checkFunctionName(S, 'foo');
  });
});
