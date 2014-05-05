var util    = require('util');
var helper  = require('../lib/helper.js');

exports = module.exports = new Config();

exports.Config = Config;

function Config() {
  this._storage = {};
  this._filePath = '';
}

Config.prototype.load = function() {
  var opts;

  if (typeof arguments[0] === 'string') {
    try {
      opts = helper.loadFileJSON(arguments[0]);
      this._filePath = arguments[0];
    } catch (err) {
      return err;
    }
  } else if (typeof arguments[0] === 'object' && arguments[0] !== null) {
    opts = arguments[0];
  }

  util._extend(this._storage, opts);

  return true;
};

Config.prototype.save = function(filePath, prettyPrint) {
  filePath = filePath || this._filePath;

  try {
    helper.saveFileJSON(filePath, this._storage, prettyPrint);
    this._filePath = filePath;
  } catch (err) {
    return err;
  }

  return true;
};

Config.prototype.get = function() {
  return util._extend({}, this._storage);
};