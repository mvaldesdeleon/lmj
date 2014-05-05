var lmt     = require('./lmt.js');
var jira    = require('./jira.js');
var clocks  = require('./clocks.js');

exports = module.exports;

function config(options) {
  // Attempt to configure the different modules.
  lmt.config({
    cacheDir: options.cacheDir,
    apiKey: options.lmt.apiKey
  });
  jira.config({
    cacheDir: options.cacheDir,
    userName: options.jira.userName,
    password: options.jira.password
  });
  clocks.config({
    cacheDir: options.cacheDir
  });
}

exports.config  = config;

exports.lmt     = lmt;
exports.jira    = jira;
exports.clocks  = clocks;