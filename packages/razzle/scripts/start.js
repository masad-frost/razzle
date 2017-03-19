#! /usr/bin/env node

require('dotenv').config();
const webpack = require('webpack');
const createConfig = require('../config/create-config');
const devServer = require('webpack-dev-server');
const chalk = require('chalk');

process.noDeprecation = true; // turns off that loadQuery clutter.

let razzle = {};
try {
  razzle = require(path.resolve(process.cwd(), 'razzle.config.js'));
} catch (e) {}

let clientConfig = createConfig('web', 'dev', razzle);
let serverConfig = createConfig('node', 'dev', razzle);

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

const clientCompiler = webpack(clientConfig);
const clientDevServer = new devServer(clientCompiler, clientConfig.devServer);

clientDevServer.listen(
  (razzle.options && razzle.options.port + 1) || 3001,
  err => {
    buildServer();
  }
);

// setTimeout(buildServer, 1000);

function buildServer() {
  const serverCompiler = webpack(serverConfig);
  serverCompiler.watch(
    {
      noInfo: true,
      stats: 'none',
    },
    () => undefined
  );
}
