#! /usr/bin/env node
const webpack = require('webpack');
const createConfig = require('./create-config');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const chalk = require('chalk');

const serverConfig = createConfig('node', 'prod');
const clientConfig = createConfig('web', 'prod');

const compiler = webpack([clientConfig, serverConfig]);

compiler.plugin('invalid', () => {
  console.log(chalk.cyan('Compiling...'));
});

compiler.plugin('done', stats => {
  const rawMessages = stats.toJson({}, true);
  const messages = formatWebpackMessages(rawMessages);
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

compiler.run((err, stats) => {
  if (err) {
    console.log(err);
  }
});
