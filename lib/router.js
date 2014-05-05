var lmj     = require('../lib/lmj.js');

exports = module.exports

var routes = {
  'list': doList,
  'log-time': doLogTime,
  'sync': doSync,
  'start': doStart,
  'stop': doStop
};

function doList(options) {
  switch (options.type) {
    case 'projects':
      lmj.lmt.projects.list();
      break;
    case 'tasks':
      lmj.lmt.tasks.list();
      break;
    case 'clocks':
      lmj.clocks.list();
      break;
  }
}

function doLogTime(options) {

}

function doSync(options) {

}

function doStart(options) {

}

function doStop(options) {

}

function route(command, options) {
  lmj.config(options);

  routes[command].call(undefined, options);
}

exports.route = route;