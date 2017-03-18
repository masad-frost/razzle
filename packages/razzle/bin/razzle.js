#!/usr/bin/env node
const minimist = require('minimist');
const argv = minimist(process.argv.slice(2));
const fs = require('fs');
const ncp = require('ncp').ncp;
const chalk = require('chalk');
const { _: [command] } = argv;
const packageJson = require('./../package.json');

const spawn = require('child_process').spawn;
const path = require('path');

if (command === 'dev') {
  spawn('node', [path.resolve(__dirname, '..', 'scripts/dev.js')], {
    stdio: 'inherit'
  });
} else if (command === 'build') {
  spawn('node', [path.resolve(__dirname, '..', 'scripts/build.js')], {
    stdio: 'inherit'
  });
} else if (command === 'new') {
  console.log(chalk.green('Cloning...'));
  const { _: [, dest] } = argv;
  console.log(dest);
  const finalDest = path.resolve(process.cwd(), dest);
  ncp(path.resolve(__dirname, '..', 'template'), finalDest, function(err) {
    console.log('Installing packages...');
    if (err) return console.error(err);
    try {
      fs.renameSync(
        path.resolve(finalDest, '.npmignore'),
        path.resolve(finalDest, '.gitignore')
      );
    } catch (e) {} // if no .npmignore, already .gitignore
    process.chdir(finalDest);
    const pkg = {
      name: dest.toString(),
      version: '0.0.1',
      scripts: {
        start: 'razzle dev',
        build: 'razzle build',
        'start:prod': 'NODE_ENV=production node build/server.js'
      },
      dependencies: {
        express: '^4.15.2',
        react: '16.0.0-alpha.3',
        'react-dom': '16.0.0-alpha.3',
        'react-router-dom': '^4.0.0',
        'serialize-javascript': '^1.3.0'
      },
      devDependencies: {
        razzle: packageJson.version
      }
    };

    fs.writeFileSync('package.json', pkg);

    spawn('yarn', ['install'], { stdio: 'inherit' });
    console.log(chalk.green('Done!'));
    console.log();
    console.log(`   cd ${dest} && yarn start`);
  });
} else if (!command && (argv.v || argv.version)) {
  console.log(chalk.cyan(`Razzle ${packageJson.version}`));
} else {
  console.log(chalk.red('Valid commands: run; build; new'));
}
