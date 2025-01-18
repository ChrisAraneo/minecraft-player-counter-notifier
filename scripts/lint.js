/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { normalize } = require('node:path');
const { exec } = require('node:child_process');
const { print } = require('./print');
const packageJson = require('./../package.json');
const config = require('./../scripts.config.json');

async function lint() {
  const eslintVersion = packageJson.devDependencies.eslint;
  const directory = normalize(`${__filename}/../../`);

  const patterns = `${[...config.lint.jsons, ...config.lint.sources]
    .map((pattern) => `"${normalize(directory + '/' + pattern)}"`)
    .join(' ')}`.trimEnd();

  const command = `npx eslint@${eslintVersion} ${patterns} --fix`;

  exec(command, (error, stdout, stderr) => print(error, stdout, stderr, true));
}

lint();
