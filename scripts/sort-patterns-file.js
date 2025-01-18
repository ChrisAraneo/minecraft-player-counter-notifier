/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */

const { normalize } = require('node:path');
const { readFile, writeFile } = require('node:fs/promises');

async function sortPatternsFile(path) {
  let data;

  try {
    data = await readFile(normalize(path), {
      encoding: 'utf8',
    });
  } catch {
    data = null;
  }

  if (data === null) {
    return;
  }

  const result = data
    .replaceAll('\r', '\n')
    .split('\n')
    .filter((line) => line)
    .map((line) => ({
      line,
      normalized: normalize(`${__filename}/../../${line}`),
    }));

  result.sort((a, b) => a.normalized.localeCompare(b.normalized));

  return writeFile(
    normalize(path),
    result.map((item) => item.line.trim()).join('\n') + '\n',
  );
}

module.exports = {
  sortPatternsFile: sortPatternsFile,
};
