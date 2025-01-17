/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { normalize } = require('node:path');
const { readFile } = require('node:fs/promises');

async function readVersion(name) {
  const data = JSON.parse(
    await readFile(normalize(`${__filename}/../../package.json`), {
      encoding: 'utf8',
    }),
  );

  return data && data['devDependencies'] && data['devDependencies'][name];
}

module.exports = {
  readVersion: readVersion,
};
