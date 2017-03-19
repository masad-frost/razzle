'use strict';

const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const AssetsPlugin = require('assets-webpack-plugin');
const StartServerPlugin = require('start-server-webpack-plugin');
const WebpackFriendlyErrors = require('friendly-errors-webpack-plugin');
const paths = require('./paths');

module.exports = (target = 'web', env = 'dev') => {
  const hasBabelRc = fs.existsSync(paths.appBabelRc);
  const mainBabelOptions = {
    babelrc: true,
    cacheDirectory: true,
    presets: [],
  };

  if (hasBabelRc) {
    console.log('Using .babelrc defined in your app root');
  } else {
    mainBabelOptions.presets.push(require.resolve('../babel'));
  }

  const IS_NODE = target === 'node';
  const IS_WEB = target === 'web';
  const IS_PROD = env === 'prod';
  const IS_DEV = env === 'dev';
  process.env.NODE_ENV = IS_PROD ? 'production' : 'development';

  let config = {
    context: process.cwd(),
    target: target,
    devtool: IS_PROD ? 'source-map' : 'cheap-eval-source-map',
    resolve: {
      extensions: ['.js', '.json'],
      modules: ['node_modules'].concat(paths.nodePaths),
    },
    resolveLoader: {
      modules: [paths.appNodeModules, paths.ownNodeModules],
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          loader: require.resolve('babel-loader'),
          exclude: [/node_modules/, paths.appBuild],
          options: mainBabelOptions,
        },
        {
          test: /\.(jpg|jpeg|png|gif|eot|svg|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 20000,
          },
        },
      ],
    },
  };

  if (IS_NODE) {
    config.node = { console: true, __filename: true, __dirname: true };
    config.externals = [
      nodeExternals({
        whitelist: [
          'webpack/hot/poll?1000',
          /\.(eot|woff|woff2|ttf|otf)$/,
          /\.(svg|png|jpg|jpeg|gif|ico)$/,
          /\.(mp4|mp3|ogg|swf|webp)$/,
          /\.(css|scss|sass|sss|less)$/,
        ],
      }),
    ];

    config.output = {
      path: paths.appBuild,
      filename: 'server.js',
    };

    config.plugins = [
      new webpack.NamedModulesPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
          BUILD_TARGET: JSON.stringify('server'),
          RAZZLE_ASSETS_MANIFEST: JSON.stringify(paths.appManifest),
          RAZZLE_PUBLIC_DIR: JSON.stringify(
            IS_PROD ? paths.appBuildPublic : paths.appPublic
          ),
        },
      }),
    ];

    config.entry = [paths.appServerIndexJs];

    if (IS_DEV) {
      config.watch = true;
      config.entry.unshift('webpack/hot/poll?1000');
      config.plugins = [
        ...config.plugins,
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new StartServerPlugin('server.js'),
      ];
    }
  }

  if (IS_WEB) {
    if (IS_DEV) {
      config.entry = {
        client: [
          require.resolve('react-hot-loader/patch'),
          `webpack-dev-server/client?http://localhost:3001`,
          'webpack/hot/only-dev-server',
          paths.appClientIndexJs,
        ],
      };
      config.output = {
        path: paths.appBuildPublic,
        publicPath: 'http://localhost:3001/',
        pathinfo: true,
        filename: 'static/js/[name].js',
      };
      config.devServer = {
        host: 'localhost',
        port: 3001,
        quiet: true,
        historyApiFallback: true,
        hot: true,
      };
      config.plugins = [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new AssetsPlugin({
          path: paths.appBuild,
          filename: 'assets.json',
        }),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('development'),
            BUILD_TARGET: JSON.stringify('client'),
          },
        }),
      ];
    } else {
      config.entry = {
        client: [paths.appClientIndexJs],
      };
      config.output = {
        path: paths.appBuildPublic,
        publicPath: '/',
        filename: 'static/js/[name].[chunkhash:8].js',
        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
      };
      config.performance = { hints: false };
      config.plugins = [
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify('production'),
            BUILD_TARGET: JSON.stringify('client'),
          },
        }),
        new webpack.optimize.UglifyJsPlugin({
          compress: { screw_ie8: true, warnings: false },
          mangle: { screw_ie8: true },
          output: { comments: false, screw_ie8: true },
          sourceMap: false,
        }),
        new AssetsPlugin({
          path: paths.appBuild,
          filename: 'assets.json',
        }),
      ];
    }
  }

  if (IS_DEV && IS_NODE) {
    config.plugins.push(new WebpackFriendlyErrors());
  }

  return config;
};
