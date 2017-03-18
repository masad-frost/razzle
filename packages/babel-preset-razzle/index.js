'use strict';

const preset = {
  presets: [
    [
      require('babel-preset-env').default,
      {
        // Webpack takes care of modules, so we don't have to.
        modules: false,
      },
    ],
    require('babel-preset-react'),
  ],
  plugins: [
    // class { handleThing = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),

    // The following two plugins use Object.assign directly, instead of Babel's
    // extends helper. Note that this assumes `Object.assign` is available.
    // { ...todo, completed: true }
    [
      require.resolve('babel-plugin-transform-object-rest-spread'),
      {
        useBuiltIns: true,
      },
    ],

    require.resolve('babel-plugin-syntax-dynamic-import'),
  ],
};

if (process.env.NODE_ENV === 'test' || process.env.BABEL_ENV === 'test') {
  preset.plugins.push.apply(preset.plugins, [
    // We always include this plugin regardless of environment
    // because of a Babel bug that breaks object rest/spread without it:
    // https://github.com/babel/babel/issues/4851
    require.resolve('babel-plugin-transform-es2015-parameters'),

    // Jest needs this to work properly with import/export syntax
    [
      require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
      { loose: true },
    ],
    [
      // Compiles import() to a deferred require()
      require.resolve('babel-plugin-dynamic-import-node'),
    ],
  ]);
}

module.exports = preset;
