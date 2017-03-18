#!/usr/bin/env node
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const fs = require('fs');
const ncp = require('ncp').ncp;
const chalk = require('chalk');
const { _: [command] } = argv;
const packageJson = require('./../package.json');

const spawn = require('execa');
const path = require('path');

if (command === 'dev') {
  spawn('node', [path.resolve(__dirname, '..', 'scripts/dev.js')], {
    stdio: 'inherit',
  });
} else if (command === 'build') {
  spawn('node', [path.resolve(__dirname, '..', 'scripts/build.js')], {
    stdio: 'inherit',
  });
} else if (command === 'new') {
  console.log(chalk.green('Cloning...'));
  const { _: [, dest] } = argv;
  const finalDest = path.resolve(process.cwd(), dest);
  ncp(path.resolve(__dirname, '..', 'template'), finalDest, function(err) {
    console.log(chalk.green('Installing packages...'));
    if (err) return console.error(err);
    try {
      fs.renameSync(
        path.resolve(finalDest, '.npmignore'),
        path.resolve(finalDest, '.gitignore')
      );
    } catch (e) {} // if no .npmignore, already .gitignore
    process.chdir(finalDest);
    spawn('yarn', ['install'], { stdio: 'inherit' })
      .then(() => {
        console.log();
        console.log(chalk.yellow(`
8888888b.                             888            Λ         
888   Y88b                            888           <8>   Λ    
888    888                            888            V    8    
888   d88P  8888b.  88888888 88888888 888  .d88b.        d8b   
8888888P"      "88b    d88P     d88P  888 d8P  Y8b    <od888bo>
888 T88b   .d888888   d88P     d88P   888 88888888       T8P   
888  T88b  888  888  d88P     d88P    888 Y8b.        Λ   8    
888   T88b "Y888888 88888888 88888888 888  "Y8888    <8>  V    
                                                      V                
`));
        console.log();
        console.log(chalk.green(`   Your new Razzle project is ready!`));
        console.log();
        console.log(chalk.cyan(`   cd ${dest} && yarn start`));
        console.log();
      })
      .catch(e => {
        console.error(e);
      });
  });
} else if (!command && (argv.v || argv.version)) {
  console.log(chalk.cyan(`Razzle ${packageJson.version}`));
} else {
  console.log(chalk.red('Valid commands: run; build; new'));
}
