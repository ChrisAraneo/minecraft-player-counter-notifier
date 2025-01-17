/* eslint-disable no-undef */

function print(error, stdout, stderr, printStdErr) {
  if (error) {
    console.error(`exec error: ${error}`);
  }

  if (stdout.length && stdout.trim().length) {
    console.log(stdout);
  }

  if (printStdErr && stderr) {
    console.error(stderr);
  }
}

module.exports = {
  print: print,
};
