#!/usr/bin/env node

/* eslint-disable global-require */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-process-exit */
/* eslint-disable import/no-dynamic-require */

'use strict';

(() => {
  const path = require('path');
  const composeImplementationFiles = process.argv.slice(2);
  if (!composeImplementationFiles.length) {
    console.log(`usage: ${path.basename(process.argv[1])} COMPOSE_FILE_NAMES...`);
    process.exit(1);
    // return;
  }

  const importedImplementations = composeImplementationFiles.map((file) => {
    try {
      return require(file);
    } catch (_err) {
      try {
        // eslint-disable-next-line no-param-reassign
        file = path.resolve(process.cwd(), file);
        return require(file);
      } catch (err) {
        console.error(`${err}\nFailed to read JavaScript file ${file}`);
        process.exit(1);
      }
    }
  });

  importedImplementations.forEach((imported, index) => {
    const compose =
      typeof imported === 'function'
        ? imported
        : typeof imported.default === 'function'
        ? imported.default
        : typeof imported.compose === 'function'
        ? imported.compose
        : undefined;
    if (!compose) {
      console.error(`The file ${composeImplementationFiles[index]} should export the "compose" function.`);
      process.exit(1);
      // return;
    }

    require('../')(compose).then((result) => {
      const { failures } = result;
      if (failures && failures.length > 0) {
        console.error(require('prettyjson').render(failures));
        process.exit(1);
      }
    });
  });
})();
