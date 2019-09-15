const fs = require("fs");
const test = require("tape");
const Promise = require("bluebird");

module.exports = compose => {
  if (typeof compose !== "function")
    throw new Error('"compose" must be a function');

  const files = fs
    .readdirSync(__dirname)
    .filter(RegExp.prototype.test.bind(/.+-tests\.js$/));

  const failures = [];

  return new Promise(resolve => {
    test
      .createStream({ objectMode: true })
      .on("data", assert => {
        if (assert.error) failures.push(assert);
      })
      .on("end", () => {
        resolve({ failures: failures });
      });

    files.forEach(file => {
      require("./" + file)(compose);
    });
  });
};
