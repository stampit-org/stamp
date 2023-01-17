/* eslint-disable global-require */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-test-return-statement */
/* eslint-disable node/no-unpublished-require */

'use strict';

import checkCompose from '@stamp/check-compose';
import { ComposeMethod } from '..';

describe('@stamp/compose', function () {
  it('passes official tests', async () => {
    return import('..')
      .then(module => {
        if (!module) {
          throw new Error('Module could not be imported')
        }
        const compose = module.default;
        return checkCompose<ComposeMethod>(compose).then(result => {
          const { failures } = result as { failures?: any[] };
          if (failures && failures.length > 0) {
            const errorString = failures
              .map(function (f) {
                return JSON.stringify(f);
              })
              .join('\n');
            throw new Error(errorString);
          }
        });
      });
  });
});
