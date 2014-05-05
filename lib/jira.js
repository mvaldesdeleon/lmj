var helper  = require('./helper.js');
var util    = require('util');

var options = {};

function configure(opts) {
  util._extend(options, opts);
}

exports = module.exports;

exports.configure = configure;