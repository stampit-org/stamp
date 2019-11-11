/* eslint-disable global-require */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-test-return-statement */
/* eslint-disable node/no-unpublished-require */

'use strict';

const checkCompose = require('@stamp/check-compose');

describe('@stamp/compose', function() {
  it('passes official tests', function() {
    const compose = require('..');
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
