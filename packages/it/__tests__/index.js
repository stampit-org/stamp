var checkCompose = require('@stamp/check-compose');

describe('@stamp/compose', function () {
  it('passes official tests', function () {
    var compose = require('..');
    return checkCompose(compose)
      .then(function (result) {
        var failures = result.failures;
        if (failures && failures.length > 0) {
          var errorString = failures.map(function (f) {
            return JSON.stringify(f);
          }).join('\n');
          throw new Error(errorString);
        }
      });
  });
});
