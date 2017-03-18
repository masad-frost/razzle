#! /usr/bin/env node
const webpack = require('webpack');
const createConfig = require('./create-config');
const devServer = require('webpack-dev-server');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const chalk = require('chalk');

let serverConfig = createConfig('node', 'dev');
let clientConfig = createConfig('web', 'dev');

let razzle = {};
try {
  razzle = require(path.resolve(process.cwd(), 'razzle.config.js'));
} catch (e) {}
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

const serverCompiler = webpack(serverConfig);

serverCompiler.plugin('invalid', function() {
  console.log(chalk.cyan('Compiling...'));
});

serverCompiler.plugin('done', function(stats) {
  var rawMessages = stats.toJson({}, true);
  var messages = formatWebpackMessages(rawMessages);
  if (!messages.errors.length && !messages.warnings.length) {
    console.log(chalk.green('Compiled successfully!'));
  }
  if (messages.errors.length) {
    console.log(chalk.red('Failed to compile.'));
    messages.errors.forEach(e => console.log(e));
    return;
  }
  if (messages.warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.'));
    messages.warnings.forEach(w => console.log(w));
  }
});

serverCompiler.watch(
  {
    noInfo: true,
    stats: 'none',
  },
  (err, stats) => {
    if (err) {
      console.log(err);
    }
  }
);

const clientCompiler = webpack(clientConfig);
const clientDevServer = new devServer(clientCompiler, clientConfig.devServer);

clientDevServer.listen(3001, () => {
  console.log('Starting server on http://localhost:3001');
});
