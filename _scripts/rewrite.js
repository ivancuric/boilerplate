const fs = require('fs-extra');
const chalk = require('chalk');

fs.move('./temp', './dist', { overwrite: true }, err => {
  if (err) {
    return console.error(err);
  }
  console.log(`Moved temp to dist ${chalk.green('✔')}`);
});
