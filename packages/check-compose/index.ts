/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

'use strict';

import fs from 'fs';
import ttest from 'tape';

function checkCompose<CM>(compose: CM) {
  if (typeof compose !== 'function') throw new Error('"compose" must be a function');

  const files = fs.readdirSync(__dirname).filter(RegExp.prototype.test.bind(/.+-tests\.js$/));

  const failures: any[] = [];

  return new Promise((resolve) => {
    ttest
      .createStream({ objectMode: true })
      .on('data', (assert) => {
        if (assert.error) failures.push(assert);
      })
      .on('end', () => {
        resolve({ failures });
      });

    files.forEach((file) => {
      require(`./${file}`)(compose);
    });
  });
};

export default checkCompose;

module.exports = checkCompose;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: checkCompose });
