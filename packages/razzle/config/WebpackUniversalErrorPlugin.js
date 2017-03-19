const chalk = require('chalk');
const clearConsole = require('react-dev-utils/clearConsole');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');

// Not ideal but ok for now. Client & server compilation...
const LIKELY_SAME_COMPILE = 350;
const LIKELY_SAME_ERR = 200;
let prevCompileStartTime = null;
let prevErrorTimestamp = null;
let prevWarnTimestamp = null;

class WebpackUniversalErrorPlugin {
  constructor(options) {
    options = options || {};
    this.target = options.target;
    this.shouldClearConsole = options.clearConsole == null
      ? true
      : Boolean(options.clearConsole);
  }

  clearConsole() {
    if (this.shouldClearConsole) {
      clearConsole();
    }
  }

  apply(compiler) {
    const target = this.target === 'node' ? 'SERVER' : 'CLIENT';
    compiler.plugin('done', stats => {
      const rawMessages = stats.toJson({}, true);
      const messages = formatWebpackMessages(rawMessages);

      if (!messages.errors.length && !messages.warnings.length) {
        const skipMessage = prevCompileStartTime &&
          Date.now() - prevCompileStartTime < LIKELY_SAME_COMPILE;
        prevCompileStartTime = Date.now();
        // if (!skipMessage) {
        this.clearConsole();
        console.log(
          chalk.bgGreen.black(' DONE ') +
            ' ' +
            chalk.green(`Compiled ${target} successfully`)
        );
        console.log();
        // }
      }

      if (messages.errors.length) {
        const skipErr = prevErrorTimestamp &&
          Date.now() - prevErrorTimestamp < LIKELY_SAME_ERR;
        prevErrorTimestamp = Date.now();
        // if (!skipErr) {
        this.clearConsole();
        console.log(
          chalk.bgRed.black(' ERROR ') +
            ' ' +
            chalk.red(`Failed to compile with ${messages.errors.length} errors`)
        );
        console.log();
        messages.errors.forEach(e => console.log(e));
        // }
        return;
      }

      if (messages.warnings.length) {
        const skipErr = prevWarnTimestamp &&
          Date.now() - prevWarnTimestamp < LIKELY_SAME_ERR;
        prevWarnTimestamp = Date.now();

        // if (!skipErr) {
        this.clearConsole();
        console.log(
          chalk.bgYellow.black(' WARNING ') +
            ' ' +
            chalk.res(
              `Failed to compile with ${messages.warnings.length} warnings`
            )
        );
        console.log();
        messages.warnings.forEach(w => console.log(w));
        // }
      }
    });

    compiler.plugin('invalid', params => {
      const skipMessage = prevCompileStartTime &&
        Date.now() - prevCompileStartTime < LIKELY_SAME_COMPILE;
      prevCompileStartTime = Date.now();

      // if (!skipMessage) {
      this.clearConsole();
      console.log(
        chalk.bgCyan.black(' WAIT ') +
          ' ' +
          chalk.cyan(`Compiling ${target}...`)
      );
      console.log();
      // }
    });
  }
}

module.exports = WebpackUniversalErrorPlugin;
