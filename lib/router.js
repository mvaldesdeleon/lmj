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

// ###############################################################
// ###############################################################

function doList() {
  switch (options.type) {
    case 'projects':
      lmj.lmt.projects.list(listProjectsCallback, options.sync);
      break;
    case 'tasks':
      lmj.lmt.tasks.list(listTasksCallback, options.sync);
      break;
    case 'clients':
      lmj.lmt.clients.list(listClientsCallback, options.sync);
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
  // create with name or without name
}

function doStop() {

}

// ###############################################################
// ###############################################################

var defaultTable = {
  'Id': 'id',
  'Name': 'name'
};

function repeat(str, times) {
  return Array(times+1).join(str);
}

function printTable(rows, spec) {
  var printArray = function(array) {
    array.forEach(function(row, index) {
      var line = '';
      for (var key in spec) {
        line = line + row[spec[key]] + '\t';
      }
      console.log(line.slice(0, -1));
    });
  };


  var line = '';

  for (var key in spec) {
    line = line + key + '\t';
  }
  console.log(line.slice(0, -1));
  console.log(repeat('=', 50));

  if (Array.isArray(rows)) {
    printArray(rows);
  } else {
    for (key in rows) {
      console.log(repeat('-', key.length));
      console.log(key);
      console.log(repeat('-', key.length));
      printArray(rows[key]);
    }
  }
}

// ###############################################################
// ###############################################################

function listProjectsCallback(projects) {
  if (options.group) {
    lmj.lmt.clients.list(function(clients) {
      var clientMap = {};
      var groupBy = {};

      clients.forEach(function (client) {
        clientMap[client.id] = client;
      });

      projects.forEach(function(project) {
        project.clientName = clientMap[project.clientId].name;
        groupBy[project.clientName] = groupBy[project.clientName] || [];
        groupBy[project.clientName].push(project);
      });

      printTable(groupBy, defaultTable);
    }, false);
  } else {
    printTable(projects, defaultTable);
  }
}

function listTasksCallback(tasks) {
  printTable(tasks, defaultTable);
}

function listClientsCallback(clients) {
  if (options.used) {
    lmj.lmt.projects.list(function(projects) {
      var validClientIds = {};

      projects.forEach(function(project) {
        validClientIds[project.clientId] = true;
      });

      clients = clients.filter(function(client) {
        return validClientIds[client.id] === true;
      });
      printTable(clients, defaultTable);
    }, false);
  } else {
    printTable(clients, defaultTable);
  }
}

// ###############################################################
// ###############################################################

exports = module.exports;

exports.route = route;