/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { normalize } = require('node:path');
const { exec } = require('node:child_process');
const { sortPatternsFile } = require('./sort-patterns-file');
const { print } = require('./print');
const packageJson = require('./../package.json');
const config = require('./../scripts.config.json');

async function format() {
  const prettierVersion = packageJson.devDependencies.prettier;
  const sortPackageJsonVersion =
    packageJson.devDependencies['sort-package-json'];
  const directory = normalize(`${__filename}/../../`);

  const patterns = `${[...config.format.jsons, ...config.format.sources]
    .map((pattern) => `"${normalize(directory + '/' + pattern)}"`)
    .join(' ')}`.trimEnd();

  const sortPackageJsonCommand = `npx sort-package-json@${sortPackageJsonVersion} "./package.json"`;
  const prettierCommand = `npx prettier@${prettierVersion} --write ${patterns}`;
  const command = `${sortPackageJsonCommand} && ${prettierCommand}`;

  exec(command, (error, stdout, stderr) => print(error, stdout, stderr));

  config.format.patterns.forEach((pattern) =>
    sortPatternsFile(normalize(`${directory}/${pattern}`)),
  );
}

format();
