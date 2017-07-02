const path = require('path');

// resource paths
const DIR_SRC = path.join(__dirname, '..', 'src');
const DIR_DIST = path.join(__dirname, '..', 'dist');
const DIR_TEMP = path.join(__dirname, '..', 'temp');

// prettier-ignore
exports.src = {
  assets  : DIR_SRC + '/assets/',
  html    : DIR_SRC + '/html/',
  js      : DIR_SRC + '/js/',
  markdown: DIR_SRC + '/markdown/',
  styles  : DIR_SRC + '/styles/',
  svg     : DIR_SRC + '/assets/svg/',
};

// prettier-ignore
exports.dist = {
  assets: DIR_DIST + '/public/assets/',
  html  : DIR_DIST + '/html/',
  js    : DIR_DIST + '/public/js/',
  styles: DIR_DIST + '/public/styles/',
  svg   : DIR_DIST + '/public/assets/svg/',
  root  : DIR_DIST + '/',
};

// prettier-ignore
exports.temp = {
  assets: DIR_TEMP + '/public/assets/',
  html  : DIR_TEMP + '/html/',
  js    : DIR_TEMP + '/public/js/',
  styles: DIR_TEMP + '/public/styles/',
  svg   : DIR_TEMP + '/public/assets/svg/',
  root  : DIR_TEMP + '/',
};
