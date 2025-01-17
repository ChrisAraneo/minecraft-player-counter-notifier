/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { normalize } = require('node:path');
const { exec } = require('node:child_process');
const { readVersion } = require('./read-version');
const { sortPatternsFile } = require('./sort-patterns-file');
const { print } = require('./print');

const JSON_FILES = ['tsconfig.json', 'package.json', 'src/config.json', '.prettierrc.json'];

const SOURCE_FILES = ['*.{ts,js,mjs,cjs}', 'src/**/*.ts'];

async function format(prettierVersion, sortPackageJsonVersion) {
  const directory = normalize(`${__filename}/../../`);

  const patterns = `${[...JSON_FILES, ...SOURCE_FILES]
    .map((pattern) => `"${normalize(directory + '/' + pattern)}"`)
    .join(' ')}`.trimEnd();

  const sortPackageJsonCommand = `npx sort-package-json@${sortPackageJsonVersion} "./package.json"`;
  const prettierCommand = `npx prettier@${prettierVersion} --write ${patterns}`;
  const command = `${sortPackageJsonCommand} && ${prettierCommand}`;

  exec(command, (error, stdout, stderr) => print(error, stdout, stderr));

  sortPatternsFile(normalize(`${directory}/.prettierignore`));
  sortPatternsFile(normalize(`${directory}/.gitignore`));
}

async function main() {
  const prettierVersion = await readVersion('prettier');
  const sortPackageJsonVersion = await readVersion('sort-package-json');

  format(prettierVersion, sortPackageJsonVersion);
}

main();

module.exports = {
  formatPackage: format,
};
