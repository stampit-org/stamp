var compose = require('@stamp/compose');

const F = compose();
Object.defineProperty(F, 'name', {
  value: 'TEST',
  configurable: true
});
var supported = F.name === 'TEST';
// Check if current environment supports function renaming

if (supported) {
  var Named = require('..');

  describe('@stamp/named', function () {
    it('aaaaa', function () {
      expect(1).toBe(1);
    });
  });
}
