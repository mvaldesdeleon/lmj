var helper  = require('./helper.js');
var util    = require('util');

var options = {};

function configure(opts) {
  util._extend(options, opts);
}

function Clocks() {

}

Clocks.prototype.list = function(sync) {

};

exports = module.exports = new Clocks();

exports.configure = configure;