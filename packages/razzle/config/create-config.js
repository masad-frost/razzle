'use strict';

const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const AssetsPlugin = require('assets-webpack-plugin');
const StartServerPlugin = require('start-server-webpack-plugin');
const FriendlyErrorsPlugin = require('./FriendlyErrorsPlugin');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const paths = require('./paths');

module.exports = (target = 'web', env = 'dev', options = {}) => {
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
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
        {
          test: /\.js?$/,
          loader: require.resolve('babel-loader'),
          exclude: [paths.appNodeModules, paths.appBuild],
          options: mainBabelOptions,
        },
        {
          test: /\.(jpg|jpeg|png|gif|eot|svg|ttf|woff|woff2)$/,
          loader: 'url-loader',
          exclude: [paths.appNodeModules, paths.appBuild],
          options: {
            limit: 20000,
          },
        },
        // "postcss" loader applies autoprefixer to our CSS.
        // "css" loader resolves paths in CSS and adds assets as dependencies.
        // "style" loader turns CSS into JS modules that inject <style> tags.
        // In production, we use a plugin to extract that CSS to a file, but
        // in development "style" loader enables hot editing of CSS.
        {
          test: /\.css$/,
          exclude: [paths.appNodeModules, paths.appBuild],
          use: IS_NODE
            ? [
                {
                  loader: 'css-loader',
                  options: {
                    importLoaders: 1,
                  },
                },
              ]
            : IS_DEV
                ? [
                    'style-loader',
                    {
                      loader: 'css-loader',
                      options: {
                        importLoaders: 1,
                      },
                    },
                    {
                      loader: 'postcss-loader',
                      options: {
                        ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                        plugins: () => [
                          autoprefixer({
                            browsers: [
                              '>1%',
                              'last 4 versions',
                              'Firefox ESR',
                              'not ie < 9', // React doesn't support IE8 anyway
                            ],
                          }),
                        ],
                      },
                    },
                  ]
                : ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                      {
                        loader: 'css-loader',
                        options: {
                          importLoaders: 1,
                        },
                      },
                      {
                        loader: 'postcss-loader',
                        options: {
                          ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                          plugins: () => [
                            autoprefixer({
                              browsers: [
                                '>1%',
                                'last 4 versions',
                                'Firefox ESR',
                                'not ie < 9', // React doesn't support IE8 anyway
                              ],
                            }),
                          ],
                        },
                      },
                    ],
                  }),
        },
      ],
    },
  };

  if (IS_NODE) {
    config.node = { console: true, __filename: true, __dirname: true };
    config.externals = [
      nodeExternals({
        whitelist: [
          'webpack/hot/poll?300',
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
          PORT: options.port || 3000,
        },
      }),
    ];

    config.entry = [paths.appServerIndexJs];

    if (IS_DEV) {
      config.watch = true;
      config.entry.unshift('webpack/hot/poll?300');
      config.plugins = [
        ...config.plugins,
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new StartServerPlugin('server.js'),
      ];
    } else {
      config.plugins.push(
        new ExtractTextPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
        })
      );
    }
  }

  if (IS_WEB) {
    config.plugins = [
      new webpack.NamedModulesPlugin(),
      new AssetsPlugin({
        path: paths.appBuild,
        filename: 'assets.json',
      }),
    ];

    if (IS_DEV) {
      config.entry = {
        client: [
          require.resolve('react-hot-loader/patch'),
          `webpack-dev-server/client?http://0.0.0.0:${options.port + 1 || '3001'}`,
          'webpack/hot/only-dev-server',
          paths.appClientIndexJs,
        ],
      };

      config.output = {
        path: paths.appBuildPublic,
        publicPath: `http://0.0.0.0:${options.port + 1 || '3001'}/`,
        pathinfo: true,
        filename: 'static/js/[name].js',
      };
      config.devServer = {
        host: '0.0.0.0',
        port: options.port + 1 || 3001,
        noInfo: true,
        quiet: true,
        historyApiFallback: true,
        hot: true,
      };
      config.plugins = [
        ...config.plugins,
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
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
        ...config.plugins,
        new ExtractTextPlugin({
          filename: IS_DEV
            ? 'static/css/[name].css'
            : 'static/css/[name].[contenthash:8].css',
        }),
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
      ];
    }
  }

  if (IS_DEV && IS_NODE) {
    config.plugins.push(
      new FriendlyErrorsPlugin({
        onSuccessMessage: `Your application is running at http://0.0.0.0:${options.port || 3000}`,
      })
    );
  }

  return config;
};
