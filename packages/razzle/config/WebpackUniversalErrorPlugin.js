const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

let isFirst = true;

class WebpackUniversalErrorPlugin {
  constructor(options) {
    options = options || {};
    this.target = options.target === 'web' ? 'Client' : 'Server';
    this.env = options.env || 'dev';
  }

  apply(compiler) {
    compiler.plugin('done', stats => {
      const rawMessages = stats.toJson({}, true);
      const messages = formatWebpackMessages(rawMessages);

      if (this.target === 'Server' && this.env === 'dev' && isFirst) {
        isFirst = false;
        return;
      }

      if (!messages.errors.length && !messages.warnings.length) {
        console.log(
          chalk.bgGreen.black(' DONE ') +
            ' ' +
            chalk.green(`Compiled ${this.target} successfully`)
        );
      }

      if (messages.errors.length) {
        console.log(
          chalk.bgRed.black(' ERROR ') +
            ' ' +
            chalk.red(
              `Failed to compile ${this.target} with ${messages.errors.length} errors`
            )
        );
        console.log();
        messages.errors.forEach(e => console.log(e));
        return;
      }

      if (messages.warnings.length) {
        console.log(
          chalk.bgYellow.black(' WARNING ') +
            ' ' +
            chalk.res(
              `Failed to compile ${this.target} with ${messages.warnings.length} warnings`
            )
        );
        console.log();
        messages.warnings.forEach(w => console.log(w));
      }
    });

    compiler.plugin('invalid', params => {
      console.log(
        chalk.bgCyan.black(' WAIT ') +
          ' ' +
          chalk.cyan(`Compiling ${this.target}...`)
      );
    });
  }
}

module.exports = WebpackUniversalErrorPlugin;
