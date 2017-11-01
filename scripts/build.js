/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * script to build (transpile) files.
 * By default it transpiles all files for all packages and writes them
 * into `build/` directory.
 * Non-js or files matching IGNORE_PATTERN will be copied without transpiling.
 *
 * Example:
 *  node ./scripts/build.js
 *  node ./scripts/build.js /users/123/jest/packages/jest-111/src/111.js
 *
 * NOTE: this script is node@4 compatible
 */

'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');


const chalk = require('chalk');

const stringLength = require('string-length');
const getPackages = require('./_getPackages');
const nodeBuild = require('./builds/node');
const umdBuild = require('./builds/umd');
const minifiedBuild = require('./builds/minified');

const OK = chalk.reset.inverse.bold.green(' DONE ');
const SRC_DIR = 'src';


const adjustToTerminalWidth = str => {
  const columns = process.stdout.columns || 80;
  const WIDTH = columns - stringLength(OK) + 1;
  const strs = str.match(new RegExp(`(.{1,${WIDTH}})`, 'g'));
  let lastString = strs[strs.length - 1];
  if (lastString.length < WIDTH) {
    lastString += Array(WIDTH - lastString.length).join(chalk.dim('.'));
  }
  return strs
  .slice(0, -1)
  .concat(lastString)
  .join('\n');
};



function buildNodePackage(p) {
  const srcDir = path.resolve(p, SRC_DIR);
  const pattern = path.resolve(srcDir, '**/*');
  const files = glob.sync(pattern, {
    nodir: true,
  });

  process.stdout.write(adjustToTerminalWidth(`${path.basename(p)}\n`));


  nodeBuild(files,srcDir,true);

  process.stdout.write(`${OK}\n`);
}

const distBuilders = [umdBuild.type,minifiedBuild.type]
function buildBrowserPackage(p) {
  const srcDir = path.resolve(p, SRC_DIR);
  const pkgJsonPath = path.resolve(p, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) {
    return;
  }

  let dist = require(pkgJsonPath).dist;
  if (dist) {
    Promise.all(Object.keys(dist).filter(type=>distBuilders.indexOf(type)!==-1).map(type=>{
      const builder =
        umdBuild.type === type?
          umdBuild.builder:
          minifiedBuild.builder;

      return builder(
        p.split(path.sep).pop(),
        path.resolve(srcDir, 'index.js'),
        path.resolve(p, dist[type])
      );
    }))
           .then(() => {
      process.stdout.write(adjustToTerminalWidth(`${path.basename(p)}\n`));
      process.stdout.write(`${OK}\n`);
    })
   .catch(e => {
     console.error(e);
     process.exit(1);
   })
  }
}

const files = process.argv.slice(2);

if (files.length) {
  files.forEach(buildFile);
} else {
  const packages = getPackages();
  process.stdout.write(chalk.inverse(' Building packages \n'));
  packages.forEach(buildNodePackage);
  process.stdout.write('\n');

  if(!process.env.EXCLUDE_DIST || process.env.EXCLUDE_DIST !=='true'){
    process.stdout.write(chalk.inverse(' Building distr packages \n'));
    packages.forEach(buildBrowserPackage);
  }
//
//


}
