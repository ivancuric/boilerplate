const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const CleanObsoleteChunks = require('webpack-clean-obsolete-chunks');
const InterpolateLoaderOptionsPlugin = require('interpolate-loader-options-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const fixSvgDimensions = require('./_scripts/svg-dimension');
const paths = require('./_scripts/paths');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

if (isProd) {
  paths.dist = paths.temp;
}

const basePlugins = [
  new CleanObsoleteChunks(),
  new WebpackNotifierPlugin(),
  new webpack.DefinePlugin({
    'process.env': { NODE_ENV: JSON.stringify(nodeEnv) },
  }),
  new InterpolateLoaderOptionsPlugin({
    loaders: [
      {
        name: 'svgo-loader',
        // 3 is the index of your plugin in the array of plugins.
        // 1 is the index of the class name you want to interpolate.
        include: ['plugins.3.addClassesToSVGElement.classNames.1'],
      },
    ],
  }),
  new ManifestPlugin(),
];

const prodPlugins = [
  new webpack.LoaderOptionsPlugin({
    debug: true,
    minimize: true,
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    output: {
      comments: false,
    },
  }),
];

const svgoPlugins = [
  { removeAttrs: { attrs: ['data-name'] } },
  { removeTitle: true },
  { removeXMLNS: true },
  { addClassesToSVGElement: { classNames: ['svg', '[name]'] } },
  {
    addAttributesToSVGElement: {
      attribute: 'aria-hidden="true"',
    },
  },
];

const config = {
  entry: {
    entry: paths.src.js + 'entry.js',
  },
  output: {
    path: paths.dist.js,
    publicPath: '/static/js/',
    filename: '[name]-[hash].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'raw-loader',
          },
          {
            loader: 'skeleton-loader',
            options: {
              procedure(content) {
                return fixSvgDimensions(content);
              },
            },
          },
          {
            loader: 'svgo-loader',
            options: {
              plugins: svgoPlugins,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    modules: ['node_modules', paths.src.svg, paths.src.js],
  },
  devtool: 'cheap-module-source-map',
  plugins: isProd ? [...basePlugins, ...prodPlugins] : basePlugins,
  performance: {
    hints: isProd ? 'warning' : false,
  },
};

module.exports = config;
