
Package.describe({
  name: 'lxo:toolkit',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'A library of frequently used methods',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.addFiles('toolkit.js');
  api.export('prettify', ['client', 'server']);
  api.export('prettifyHTML', ['client']);
  api.export('getAll', ['client']);
  api.export('getQuery', ['client']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('lxo:toolkit');
  api.addFiles('toolkit-tests.js');
});
