'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const AssetsPlugin = require('assets-webpack-plugin');
const StartServerPlugin = require('start-server-webpack-plugin');

const rootPath = path.resolve(process.cwd());
const buildPath = path.join(rootPath, 'build');
const publicBuildPath = path.join(rootPath, 'public', 'static');
const userNodeModulesPath = path.join(rootPath, 'node_modules');
const pubilicPath = '/';

module.exports = (target = 'web', env = 'dev') => {
  const babelRcPath = path.resolve('.babelrc');
  const hasBabelRc = fs.existsSync(babelRcPath);
  const mainBabelOptions = {
    babelrc: true,
    cacheDirectory: true,
    presets: [],
  };

  if (hasBabelRc) {
    console.log('> Using .babelrc defined in your app root');
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
    devtool: 'cheap-eval-source-map',
    resolve: {
      extensions: ['.js', '.json'],
      modules: [
        userNodeModulesPath,
        path.resolve(__dirname, '../node_modules'),
      ],
    },
    resolveLoader: {
      modules: [
        userNodeModulesPath,
        path.resolve(__dirname, '../node_modules'),
      ],
    },
    module: {
      rules: [
        {
          test: /\.js?$/,
          loader: require.resolve('babel-loader'),
          exclude: [/node_modules/, buildPath],
          options: mainBabelOptions,
        },
        {
          test: /\.(jpg|jpeg|png|gif|eot|ttf|woff|svg|woff2)$/,
          loader: require.resolve('url-loader'),
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
      path: buildPath,
      filename: 'server.js',
    };

    if (IS_DEV) {
      config.watch = true;
      config.entry = ['webpack/hot/poll?1000', './server/index'];
      config.plugins = [
        new StartServerPlugin('server.js'),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            BUILD_TARGET: JSON.stringify('server'),
          },
          ASSETS_MANIFEST: JSON.stringify(
            path.join(buildPath || '', 'assets.json' || '')
          ),
        }),
      ];
    } else {
      config.entry = ['./server/index'];
      config.plugins = [
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            BUILD_TARGET: JSON.stringify('server'),
          },
          ASSETS_MANIFEST: JSON.stringify(
            path.join(buildPath || '', 'assets.json' || '')
          ),
        }),
      ];
    }
  }

  if (IS_WEB) {
    if (IS_DEV) {
      config.entry = {
        client: [
          require.resolve('react-hot-loader/patch'),
          'webpack-dev-server/client?http://localhost:3001',
          'webpack/hot/only-dev-server',
          './client/index',
        ],
      };
      config.output = {
        path: buildPath,
        publicPath: 'http://localhost:3001/static/',
        filename: 'client.js',
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
          path: buildPath,
          filename: 'assets.json',
        }),
        new webpack.DefinePlugin({
          'process.env': {
            BUILD_TARGET: JSON.stringify('client'),
          },
        }),
      ];
    } else {
      config.entry = {
        client: ['./client/index'],
      };
      config.output = {
        path: publicBuildPath,
        publicPath: '/static/',
        filename: '[name]-bundle-[hash].js',
      };
      config.performance = { hints: false };
      config.plugins = [
        new webpack.NamedModulesPlugin(),
        new webpack.optimize.UglifyJsPlugin({
          compress: { screw_ie8: true, warnings: false },
          mangle: { screw_ie8: true },
          output: { comments: false, screw_ie8: true },
          sourceMap: false,
        }),
        new webpack.DefinePlugin({
          'process.env': {
            BUILD_TARGET: JSON.stringify('client'),
          },
        }),
        new AssetsPlugin({
          path: buildPath,
          filename: 'assets.json',
        }),
      ];
    }
  }

  return config;
};
