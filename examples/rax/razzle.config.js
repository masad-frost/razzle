const RaxWebpackPlugin = require('rax-webpack-plugin');

module.exports = {
  modify: (config, { dev }, webpack) => {
    config.plugins.push(
      new RaxWebpackPlugin({
        target: 'bundle',
        externalBuiltinModules: false,
      })
    );
    return config;
  },
};
