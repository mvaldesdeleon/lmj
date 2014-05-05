var lmj     = require('../lib/lmj.js');
var util    = require('util');

var options = {};

var routes = {
  'list': doList,
  'log-time': doLogTime,
  'sync': doSync,
  'start': doStart,
  'stop': doStop
};

function route(command, opts) {
  util._extend(options, opts);
  lmj.configure(options);

  routes[command].call(undefined);
}

function doList() {
  switch (options.type) {
    case 'projects':
      lmj.lmt.projects.list(listCallback, options.sync);
      break;
    case 'tasks':
      lmj.lmt.tasks.list(listCallback, options.sync);
      break;
    case 'clients':
      lmj.lmt.clients.list(listCallback, options.sync);
      break;
    case 'clocks':
      lmj.clocks.list();
      break;
  }
}

function doLogTime() {
  // check if we have all the necesary options
  // if not, ask for values or fail
  lmj.lmt.timeEntries.create();
}

function doSync() {
  lmj.lmt.clients.sync();
  lmj.lmt.projects.sync();
  lmj.lmt.tasks.sync();
}

function doStart() {

}

function doStop() {

}

function listCallback(results) {
  console.dir(results);
}

exports = module.exports;

exports.route = route;