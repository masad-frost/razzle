#! /usr/bin/env node

require('dotenv').config();
const webpack = require('webpack');
const createConfig = require('../config/create-config');
const devServer = require('webpack-dev-server');
const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');

process.noDeprecation = true; // turns off that loadQuery clutter.

let razzle = {};

// Check for razzle.config.js file
try {
  razzle = require(path.resolve(process.cwd(), 'razzle.config.js'));
} catch (e) {}

// Create dev configs using our config factory, passing in razzle file as
// options.
let clientConfig = createConfig('web', 'dev', razzle);
let serverConfig = createConfig('node', 'dev', razzle);

// Check if razzle.config has a modify function. If it does, call it on the
// configs we just created.
if (razzle.modify) {
  clientConfig = razzle.modify(
    clientConfig,
    { target: 'web', dev: true },
    webpack
  );
  serverConfig = razzle.modify(
    serverConfig,
    { target: 'node', dev: true },
    webpack
  );
}

// Compile our assets with webpack
const clientCompiler = webpack(clientConfig);
const serverCompiler = webpack(serverConfig);

// Create a new instance of Webpack-dev-server for our client assets.
// This will actually run on a different port than the users app.
const clientDevServer = new devServer(clientCompiler, clientConfig.devServer);

// Optimistically, we make the console look exactly like the output of our
// FriendlyErrorsPlugin during compilation, so the user has immediate feedback.
clearConsole();
console.log(
  chalk.bgBlue(`${chalk.black(' WAIT ')}`) + ' ' + chalk.blue('Compiling...')
);

// Start Webpack-dev-server
clientDevServer.listen(
  (razzle.options && razzle.options.port + 1) || 3001,
  err => {
    if (err) {
      console.error(err);
    }
  }
);

// Start our server webpack instance in watch mode.
serverCompiler.watch(
  {
    quiet: true,
    stats: 'none',
    // Tell it to ignore changes to the assets manifest during dev. It doesn't
    // change.
    ignored: 'build/assets.json',
  },
  stats => {}
);
