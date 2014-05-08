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
  var projectMap = {};
  var taskMap = {};

  var getProjects = function() {
    lmj.lmt.projects.list(function(projects) {
      projects.forEach(function (project) {
        projectMap[project.id] = project;
      });

      getTasks();
    }, false);
  };

  var getTasks = function() {
    lmj.lmt.tasks.list(function(tasks) {
      tasks.forEach(function (task) {
        taskMap[task.id] = task;
      });

      validateAndCreate();
    }, false);
  };

  var validateAndCreate = function() {
    if (ensureValidProject(projectMap) === false) return;
    if (ensureValidTask(taskMap) === false) return;
    if (ensureValidDate() === false) return;
    if (ensureValidTime() === false) return;
    // check if we have all the necesary options
    // if not, ask for values or fail
    lmj.lmt.timeEntries.create({
      project: options.project,
      task: options.task,
      date: options.date,
      time: options.time
    }, function(result) {
      if (result instanceof Error) {
        console.log('an error has occurred');
      } else {
        console.log('the entry has been created');
      }
    });
  };

  getProjects();
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

function ensureValidProject(projectMap) {
  var valid = function(projectId) {
    return projectMap[projectId] !== undefined;
  };

  while (valid(options.project) === false) {
    console.log('invalid project');
    return false;
  }

  console.log('Selected project: ' + projectMap[options.project].name);
  return true;
}

function ensureValidTask(taskMap) {
  var valid = function(taskId) {
    return taskMap[taskId] !== undefined;
  };

  while (valid(options.task) === false) {
    console.log('invalid task');
    return false;
  }

  console.log('Selected task: ' + taskMap[options.task].name);
  return true;
}

function ensureValidDate() {
  if (options.date.getTime === undefined || isNaN(options.date.getTime())) {
    console.log('invalid date');
    return false;
  }

  console.log('Selected date (dd/MM/yyyy): ' + options.date.getDate() + '/' + (options.date.getMonth() + 1) + '/' + options.date.getFullYear());
  return true;
}

function ensureValidTime() {
  var valid = function(time) {
    if (time.indexOf(':') !== -1) {
      time = parseFloat(time.split(':')[0]) + parseFloat(time.split(':')[1]) / 60
    } else {
      time = parseFloat(time);
    }

    return isNaN(time) ? false : (0 < time && time < 24 ? time : false);
  };

  while ((options.time = valid(options.time)) === false) {
    console.log('invalid time');
    return false;
  }

  console.log('Selected time: ' + options.time);
  return true;
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