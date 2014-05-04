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
};

exports.invalidArgument = invalidArgument;
exports.getOptions = getOptions;
exports.getCommand = getCommand;