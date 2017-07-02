const fs = require('fs-extra');
const chalk = require('chalk');

fs.remove('./dist', err => {
  if (err) {
    return console.error(err);
  }
  console.log(`Removed ${chalk.magenta('/dist')} ${chalk.green('✔')}`);
});
