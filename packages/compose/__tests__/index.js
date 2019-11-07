/* eslint-disable func-names */

// eslint-disable-next-line node/no-unpublished-require
const checkCompose = require('@stamp/check-compose');

describe('@stamp/compose', function() {
  // eslint-disable-next-line jest/expect-expect
  it('passes official tests', function() {
    // eslint-disable-next-line global-require
    const compose = require('..');
    // eslint-disable-next-line jest/no-test-return-statement
    return checkCompose(compose).then(function(result) {
      const { failures } = result;
      if (failures && failures.length > 0) {
        const errorString = failures
          .map(function(f) {
            return JSON.stringify(f);
          })
          .join('\n');
        throw new Error(errorString);
      }
    });
  });
});
