var fs    = require('fs');
var path  = require('path');

// Display an error message appropriate for invalid argument values.
function invalidArgument(name, value){
  console.error();
  console.error("  error: invalid value for argument `%s': %s", name, value);
  console.error();
}

function genericError(message){
  console.error();
  console.error("  error: %s", message);
  console.error();
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

function makePath(path) {
  path = normalizePath(path);

  var dirs = path.split('/');
  var i = 0;
  var currentPath = dirs[0].length === 0 ? ++i && '/' : '';

  for (var l = dirs.length; i < l; i++) {
    if (dirs[i].length === 0) continue;

    currentPath = currentPath + dirs[i];

    try {
      fs.mkdirSync(currentPath, 0755);
    } catch(err) {
      if (err.code !== 'EEXIST') {
        return err;
      }
    }

    currentPath = currentPath + '/';
  }

  return true;
}

function loadFileJSON(filePath) {
  filePath = normalizePath(filePath);
  return JSON.parse( fs.readFileSync(filePath, {encoding: 'utf8'}) );
}

function saveFileJSON(filePath, opts, prettyPrint) {
  filePath = normalizePath(filePath);
  fs.writeFileSync(filePath, JSON.stringify(opts, prettyPrint === true ? null : undefined, prettyPrint === true ? 4 : undefined), {encoding: 'utf8'});
}

// ###############################################################
// ###############################################################

exports = module.exports;

exports.genericError    = genericError;
exports.invalidArgument = invalidArgument;
exports.getOptions      = getOptions;
exports.getCommand      = getCommand;

exports.getHomeDir    = getHomeDir;
exports.normalizePath = normalizePath;
exports.makePath      = makePath;
exports.loadFileJSON  = loadFileJSON;
exports.saveFileJSON  = saveFileJSON;