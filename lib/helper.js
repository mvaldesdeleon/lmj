var fs    = require('fs');
var path  = require('path');

exports = module.exports

// Display an error message appropriate for invalid argument values.
function invalidArgument(name, value){
  console.error();
  console.error("  error: invalid value for argument `%s': %s", name, value);
  console.error();
  process.exit(1);
}

function getOptions(command) {
  var opts = {};

  // For ease of use. This way you can safely call getOptions on whatever getCommand returns.
  if (typeof command !== 'object' || command === null) return opts;

  if (Array.isArray(command.options)) {
    command.options.forEach(function(option) {
      var name = option.name();
      opts[ name ] = typeof command[ name ] === 'function' ? command[ name ].call(command) : command[ name ];
    });
  }
  if (Array.isArray(command._options)) {
    command._options.forEach(function(option) {
      var name = option;
      opts[ name ] = typeof command[ name ] === 'function' ? command[ name ].call(command) : command[ name ];
    });
  }

  return opts;
}

function getCommand(command) {
  var i = 0, l = command.args.length;

  while (i < l && typeof command.args[i] !== 'object') {
    i++;
  }

  return i < l ? command.args[i] : null;
}

function getHomeDir() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function normalizePath(rawPath) {
  return path.normalize(rawPath).replace(/^~/, getHomeDir());
}

function loadFileJSON(filePath) {
  filePath = normalizePath(filePath);
  return JSON.parse( fs.readFileSync(filePath, {encoding: 'utf8'}) );
}

function saveFileJSON(filePath, opts, prettyPrint) {
  filePath = normalizePath(filePath);
  fs.writeFileSync(filePath, JSON.stringify(opts, prettyPrint === true ? null : undefined, prettyPrint === true ? 4 : undefined), {encoding: 'utf8'});
}

exports.invalidArgument = invalidArgument;
exports.getOptions      = getOptions;
exports.getCommand      = getCommand;

exports.getHomeDir    = getHomeDir;
exports.normalizePath = normalizePath;
exports.loadFileJSON  = loadFileJSON;
exports.saveFileJSON  = saveFileJSON;