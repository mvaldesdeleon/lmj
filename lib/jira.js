var helper  = require('./helper.js');
var util    = require('util');

exports = module.exports;

exports.configure = configure;

var options = {};

function configure(opts) {
  util._extend(options, opts);
}