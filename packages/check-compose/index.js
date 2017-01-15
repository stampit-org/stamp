var fs = require('fs');
var test = require('tape');
var Promise = require('bluebird');

module.exports = function (compose) {
  if (typeof compose !== 'function')
    throw new Error('"compose" must be a function');

  var files = fs.readdirSync(__dirname)
    .filter(RegExp.prototype.test.bind(/.+-tests\.js$/));

  var failures = [];

  return new Promise(function (resolve) {
    test.createStream({objectMode: true})
      .on('data', function (assert) {
        if (assert.error)
          failures.push(assert);
      })
      .on('end', function () {
        resolve({failures: failures});
      });

    files.forEach(function (file) {
      require('./' + file)(compose);
    });
  });
};

