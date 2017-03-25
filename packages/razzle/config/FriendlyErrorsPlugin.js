'use strict';

const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

// This is a custom Webpack Plugin that prints out prettier console messages
// and errors depending on webpack compiler events. It runs on the Node.js
// server webpack instance.
class WebpackErrorsPlugin {
  constructor(options) {
    options = options || {};
    this.onSuccessMessage = options.onSuccessMessage;
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      const rawMessages = stats.toJson({}, true);
      const messages = formatWebpackMessages(rawMessages);

      if (!messages.errors.length && !messages.warnings.length) {
        clearConsole();
        console.log(
          chalk.bgGreen.black(' DONE ') +
            ' ' +
            chalk.green(`Compiled successfully`)
        );
        if (this.onSuccessMessage) {
          console.log();
          console.log(this.onSuccessMessage);
          console.log();
        }
      }

      if (messages.errors.length) {
        clearConsole();
        console.log(
          chalk.bgRed.black(' ERROR ') +
            ' ' +
            chalk.red(`Failed to compile with ${messages.errors.length} errors`)
        );
        console.log();
        messages.errors.forEach(e => console.log(e));
        return;
      }

      if (messages.warnings.length) {
        clearConsole();
        console.log(
          chalk.bgYellow.black(' WARNING ') +
            ' ' +
            chalk.res(
              `Failed to compile with ${messages.warnings.length} warnings`
            )
        );
        console.log();
        messages.warnings.forEach(w => console.log(w));
      }
    });

    compiler.plugin('invalid', params => {
      clearConsole();
      console.log(
        chalk.bgBlue.black(' WAIT ') + ' ' + chalk.blue(`Compiling...`)
      );
    });
  }
}

module.exports = WebpackErrorsPlugin;
