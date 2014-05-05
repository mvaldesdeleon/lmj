var lmt     = require('./lmt.js');
var jira    = require('./jira.js');
var clocks  = require('./clocks.js');
var util    = require('util');

var options = {};

function configure(opts) {
  util._extend(options, opts);
  // Attempt to configure the different modules.
  lmt.configure({
    cacheDir: options.cacheDir,
    apiKey: options.lmt.apiKey
  });
  jira.configure({
    cacheDir: options.cacheDir,
    userName: options.jira.userName,
    password: options.jira.password
  });
  clocks.configure({
    cacheDir: options.cacheDir
  });
}

exports = module.exports;

exports.configure  = configure;

exports.lmt     = lmt;
exports.jira    = jira;
exports.clocks  = clocks;