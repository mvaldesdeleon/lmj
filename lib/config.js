var util    = require('util');
var helper  = require('../lib/helper.js');

exports = module.exports = new Config();

function Config() {
  var filePath, template;

  // Parse arguments by type. Look for up to two arguments.
  // If it's a string, it's the file path.
  // If it's an object, it's a configuration template.
  // If the same type of argument is supplyed twice, the second value will be discarded.
  var i = 2;
  while (i--) {
    if (typeof arguments[i] === 'string') {
      filePath = arguments[i];
    } else if (typeof arguments[i] === 'object' && arguments[i] !== null) {
      template = arguments[i];
    }
  }

  this._storage = {};
  this._filePath = '';

  if (template) {
    util._extend(this._storage, template);
  }

  if (filePath) {
    loadConfigFile(filePath);
    this._filePath = filePath;
  }
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