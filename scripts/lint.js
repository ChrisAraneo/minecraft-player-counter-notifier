/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { normalize } = require('node:path');
const { exec } = require('node:child_process');
const { readVersion } = require('./read-version');
const { print } = require('./print');

const JSON_FILES = ['tsconfig.json'];

const SOURCE_FILES = ['*.{ts,js,mjs,cjs}', 'src/**/*.ts'];

async function lint(eslintVersion) {
  const directory = normalize(`${__filename}/../../`);

  const patterns = `${[...JSON_FILES, ...SOURCE_FILES]
    .map((pattern) => `"${normalize(directory + '/' + pattern)}"`)
    .join(' ')}`.trimEnd();

  const command = `npx eslint@${eslintVersion} ${patterns} --fix`;

  exec(command, (error, stdout, stderr) => print(error, stdout, stderr, true));
}

async function main() {
  const eslintVersion = await readVersion('eslint');

  lint(eslintVersion);
}

main();

module.exports = {
  lintPackage: lint,
};
