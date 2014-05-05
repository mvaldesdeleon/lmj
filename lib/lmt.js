var helper  = require('./helper.js');
var util    = require('util');
var https   = require('https');
var config  = require('./config.js');

exports = module.exports;

exports.tasks = new Tasks();
exports.projects = new Projects();

exports.configure = configure;

var httpOptions = {
  hostname: 'api.logmytime.de',
  path: '/V1/API.svc/',
  headers: {
    'accept': 'application/json',
    'X-LogMyTimeAPIKey': '',
    'User-Agent': 'logmyjira 0.0.1'
  }
};

var options = {};

function configure(opts) {
  util._extend(options, opts);
  httpOptions.headers['X-LogMyTimeAPIKey'] = options.apiKey;

  exports.tasks.load();
  exports.projects.load();
}

function doRequest(resource, callback) {
  var httpOpts = util._extend({}, httpOptions);

  httpOpts.path = httpOpts.path + resource;

  var req = https.request(httpOpts, function(response) {
    var buffer = new Buffer(0);

    response.on('data', function(data) {
      buffer = Buffer.concat([buffer, data]);
    });

    response.on('end', function() {
      var dataObject = JSON.parse(buffer.toString('utf8'));

      callback.call(undefined, dataObject.d.results);
    });
  });
  req.end();

  req.on('error', function(error) {
    callback.call(undefined, error);
  });
}

function Tasks() {
  this._tasks = new config.Config();
  this._filePath = '';
}

Tasks.prototype.save = function() {
  this._tasks.save(this._filePath, true);
}

Tasks.prototype.load = function() {
  this._filePath = options.cacheDir + '/tasks.cache';

  if (this._tasks.load(this._filePath) !== true) {
    this._tasks.load({
      tasks: []
    });
    this.save();
  }
}

Tasks.prototype.sync = function(callback) {
  if (typeof callback !== 'function') callback = function() {};
  var self = this;

  doRequest('Tasks', function(results) {
    if (results instanceof Error) {
      callback.call(undefined, results);
    } else {
      self._tasks.load({tasks: results});
      self.save();
      callback.call(undefined, self._tasks.get().tasks);
    }
  });
};

Tasks.prototype.list = function(callback, sync) {
  if (typeof callback !== 'function') return new Error('No callback specified');

  if (sync === true) {
    this.sync(callback);
  } else {
    callback.call(undefined, this._tasks.get().tasks);
  }

  return true;
}

function Projects() {
  this._projects = new config.Config();
  this._filePath = '';
}

Projects.prototype.save = function() {
  this._projects.save(this._filePath, true);
}

Projects.prototype.load = function() {
  this._filePath = options.cacheDir + '/projects.cache';

  if (this._projects.load(this._filePath) !== true) {
    this._projects.load({
      projects: []
    });
    this.save();
  }
}

Projects.prototype.sync = function(callback) {
  if (typeof callback !== 'function') callback = function() {};
  var self = this;

  doRequest('Projects', function(results) {
    if (results instanceof Error) {
      callback.call(undefined, results);
    } else {
      self._projects.load({projects: results});
      self.save();
      callback.call(undefined, self._projects.get().projects);
    }
  });
};

Projects.prototype.list = function(callback, sync) {
  if (typeof callback !== 'function') return new Error('No callback specified');

  if (sync === true) {
    this.sync(callback);
  } else {
    callback.call(undefined, this._projects.get().projects);
  }

  return true;
}