'use strict';

const babel = require('babel-core');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const micromatch = require('micromatch');

const BUILD_DIR = 'build';
const IGNORE_PATTERN = '**/__tests__/**';
const JS_FILES_PATTERN = '**/*.js';
const PACKAGES_DIR = path.resolve(__dirname, '../../packages');

const INLINE_REQUIRE_BLACKLIST = /packages\/expect|(jest-(circus|diff|get-type|jasmine2|matcher-utils|message-util|regex-util|snapshot))|pretty-format\//;

const transformOptions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../..', '.babelrc'), 'utf8')
);
transformOptions.babelrc = false;


function buildFiles(files, srcDir, silent){
  files.forEach(file => buildFile(file,srcDir,silent));
};

function getPackageName(file) {
  return path.relative(PACKAGES_DIR, file).split(path.sep)[0];
}

function getBuildPath(file, srcDir, buildFolder) {
  const pkgName = getPackageName(file);
  const pkgSrcPath = path.resolve(PACKAGES_DIR, pkgName, srcDir);
  const pkgBuildPath = path.resolve(PACKAGES_DIR, pkgName, buildFolder);
  const relativeToSrcPath = path.relative(pkgSrcPath, file);
  return path.resolve(pkgBuildPath, relativeToSrcPath);
}

function buildFile(file, srcDir,  silent) {
  const destPath = getBuildPath(file,srcDir, BUILD_DIR);

  mkdirp.sync(path.dirname(destPath));
  if (micromatch.isMatch(file, IGNORE_PATTERN)) {
    silent ||
    process.stdout.write(
      chalk.dim('  \u2022 ') +
      path.relative(PACKAGES_DIR, file) +
      ' (ignore)\n'
    );
  } else if (!micromatch.isMatch(file, JS_FILES_PATTERN)) {
    fs.createReadStream(file).pipe(fs.createWriteStream(destPath));
    silent ||
    process.stdout.write(
      chalk.red('  \u2022 ') +
      path.relative(PACKAGES_DIR, file) +
      chalk.red(' \u21D2 ') +
      path.relative(PACKAGES_DIR, destPath) +
      ' (copy)' +
      '\n'
    );
  } else {
    const options = Object.assign({}, transformOptions);
    options.plugins = options.plugins.slice();

    if (!INLINE_REQUIRE_BLACKLIST.test(file)) {
      // Remove normal plugin.
      options.plugins = options.plugins.filter(
        plugin =>
          !(
            Array.isArray(plugin) &&
            plugin[0] === 'transform-es2015-modules-commonjs'
          )
      );
      options.plugins.push([
        'transform-inline-imports-commonjs',
        {
          allowTopLevelThis: true,
        },
      ]);
    }

    const transformed = babel.transformFileSync(file, options).code;
    fs.writeFileSync(destPath, transformed);
    silent ||
    process.stdout.write(
      chalk.green('  \u2022 ') +
      path.relative(PACKAGES_DIR, file) +
      chalk.green(' \u21D2 ') +
      path.relative(PACKAGES_DIR, destPath) +
      '\n'
    );
  }
}

module.exports=buildFiles;
