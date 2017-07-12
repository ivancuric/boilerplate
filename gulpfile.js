/*eslint comma-dangle: ["error", {"functions": "never"}]*/

const assets = require('postcss-assets');
const autoprefixer = require('autoprefixer');
const bs = require('browser-sync').create();
const cssnano = require('cssnano');
const data = require('gulp-data');
const flexbugs = require('postcss-flexbugs-fixes');
const fs = require('fs-extra');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const inlineSvg = require('postcss-inline-svg');
const md = require('markdown-it')();
const mqpacker = require('css-mqpacker');
const notify = require('gulp-notify');
const flatmap = require('gulp-flatmap');
const path = require('path');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rev = require('gulp-rev');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const SVGO = require('svgo');
const template = require('gulp-template');
const watch = require('gulp-watch');

const fixSvgDimensions = require('./_scripts/svg-dimension');

// Paths
const paths = require('./_scripts/paths');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

if (isProduction) {
  paths.dist = paths.temp;
}

// generic gulp error handler
const errorHandler = notify.onError(error => `Error: ${error.message}`);

// sass configuration
const sassConfig = { includePaths: ['./node_modules/'] };

// svgo settings
const coreSvgoPlugins = [
  { removeAttrs: { attrs: ['data-name'] } },
  { removeTitle: true }
];

// runs svg through svgo
const optimizeSvg = (svgString, plugins) => {
  const svgo = new SVGO({ plugins });

  let optimizedSvg;
  svgo.optimize(svgString, output => (optimizedSvg = output.data));
  return optimizedSvg;
};

// get svg in template
const getSvg = filename => {
  const plugins = coreSvgoPlugins;
  const classNames = ['svg', filename];

  plugins.push(
    { removeXMLNS: true },
    { addClassesToSVGElement: { classNames } },
    { addAttributesToSVGElement: { attribute: 'aria-hidden="true"' } }
  );
  const svgString = fs.readFileSync(`${paths.src.svg}${filename}.svg`, 'utf-8');

  return optimizeSvg(fixSvgDimensions(svgString), plugins);
};

// precompile svg located in /dist
gulp.task('svg', () => {
  gulp
    .src(paths.src.svg + '**/*.svg')
    .pipe(
      flatmap((stream, file) => {
        const filename = path.basename(file.path, '.svg');
        const plugins = coreSvgoPlugins;
        const classNames = ['svg', filename];
        plugins.push({ addClassesToSVGElement: { classNames } });
        file.contents = new Buffer(
          optimizeSvg(fixSvgDimensions(file.contents.toString('utf8')), plugins)
        );
        return stream;
      })
    )
    .pipe(gulp.dest(paths.dist.svg));
});

// write hashed assets in html
const getHash = filename => {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(paths.dist.root + 'manifest.json', 'utf8')
    );
    if (manifest[filename]) {
      return manifest[filename];
    }
    return filename;
  } catch (err) {
    return filename;
  }
};

// markdown
const markdownToHtml = filename => {
  const markdownString = fs.readFileSync(
    `${paths.src.markdown}${filename}.md`,
    'utf-8'
  );
  return md.render(markdownString);
};

// template underline link
const makeUnderline = copy => {
  const string = `<span class="underliner" aria-hidden="true" data-content="${copy}"></span>${copy}`;
  return string;
};

// dynamic data for templates
const dataGetter = () => ({
  md: markdownToHtml,
  svg: getSvg,
  hash: getHash,
  ul: makeUnderline
});

// build html
gulp.task('html', () =>
  gulp
    .src([paths.src.html + '**/*'])
    .pipe(plumber())
    .pipe(data(dataGetter))
    .pipe(template())
    .pipe(gulp.dest(paths.dist.html))
    .on('end', () => bs.reload())
);

function encode(data) {
  const optimized = optimizeSvg(
    fixSvgDimensions(decodeURI(data)),
    coreSvgoPlugins
  );
  return encodeURI(optimized);
}

// postcss postCssProc
const postCssProc = [
  autoprefixer(),
  flexbugs(),
  assets({ loadPaths: [paths.src.assets] }),
  inlineSvg({ path: paths.src.assets, encode })
];

if (isProduction) {
  postCssProc.push(mqpacker());
  postCssProc.push(
    cssnano({
      options: {
        sourcemap: false,
        autoprefixer: false
      }
    })
  );
}

// compile scss for dev
gulp.task('styles', () =>
  gulp
    .src(paths.src.styles + '**/*.scss')
    .pipe(plumber({ errorHandler }))
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(sass(sassConfig))
    .pipe(postcss(postCssProc))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist.styles))
    .pipe(bs.stream({ match: '/**/*.css' }))
);

// compile scss for production
gulp.task('styles-production', () =>
  gulp
    .src(paths.src.styles + '**/*.scss')
    .pipe(plumber({ errorHandler }))
    .pipe(rename({ extname: '.css' }))
    .pipe(rev())
    .pipe(sassGlob())
    .pipe(sass(sassConfig))
    .pipe(postcss(postCssProc))
    .pipe(gulp.dest(paths.dist.styles))
    .pipe(rev.manifest({ path: 'manifest.json' }))
    .pipe(gulp.dest(paths.dist.root))
);

// build / move all assets (raster & svg)
gulp.task('assets', () => {
  runSequence('svg', 'raster', 'fonts');
});

// build non-svg assets
gulp.task('raster', () =>
  gulp
    .src([
      paths.src.assets + '**/*',
      `!${paths.src.assets}fonts`,
      `!${paths.src.assets}fonts/**`,
      `!${paths.src.assets}svg`,
      `!${paths.src.assets}svg/**`
    ])
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist.assets))
);

// move fonts
gulp.task('fonts', () =>
  gulp
    .src(paths.src.assets + 'fonts/**')
    .pipe(plumber())
    .pipe(gulp.dest(paths.dist.assets + 'fonts'))
);

// browsersync
gulp.task('serve', () => {
  bs.init({
    proxy: 'localhost:8000',
    ghostMode: false,
    notify: false,
    ui: false,
    open: false
  });
});

// watch
gulp.task('watch', () => {
  watch(paths.src.styles + '**/*.scss', () => gulp.start('styles'));
  watch(
    [
      paths.src.html + '**/*.html',
      paths.src.markdown + '**/*.md',
      paths.dist.js + '**/*.js'
    ],
    () => gulp.start('html')
  );
});

// default
gulp.task('default', () => {
  runSequence('styles', 'html', 'watch', 'serve');
});
