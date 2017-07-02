const fs = require('fs-extra');
const chalk = require('chalk');

fs.remove('./temp', err => {
  if (err) {
    return console.error(err);
  }
  console.log(`Removed ${chalk.magenta('/temp')} ${chalk.green('✔')}`);
});
