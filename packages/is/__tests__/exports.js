describe('exports', function () {
  it('isComposable', function () {
    expect(require('../composable')).toBe(require('../').isComposable);
  });

  it('isDescriptor', function () {
    expect(require('../descriptor')).toBe(require('../').isDescriptor);
  });

  it('isStamp', function () {
    expect(require('../stamp')).toBe(require('../').isStamp);
  });
});
