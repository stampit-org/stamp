/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

'use strict';

const fs = require('fs');
const test = require('tape');

module.exports = (compose) => {
  if (typeof compose !== 'function') throw new Error('"compose" must be a function');

  const files = fs.readdirSync(__dirname).filter(RegExp.prototype.test.bind(/.+-tests\.js$/));

  const failures = [];

  return new Promise((resolve) => {
    test
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
