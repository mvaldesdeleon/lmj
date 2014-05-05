var helper  = require('./helper.js');
var util    = require('util');
var https   = require('https');
var config  = require('./config.js');

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

function doRequest(resource, data, callback) {
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
  if (data) {
    req.write(JSON.stringify(data), 'utf8');
  }
  req.end();

  req.on('error', function(error) {
    callback.call(undefined, error);
  });
}

// ###############################################################
// ###############################################################

function ResourceList(resourceName) {
  this._resourceName = typeof resourceName === 'string' ? resourceName : '';
  this._list = new config.Config();
  this._filePath = '';
}

ResourceList.prototype._map = function(rawObject) {
  return rawObject;
};

ResourceList.prototype._filter = function(rawObject) {
  return true;
};

ResourceList.prototype.save = function() {
  this._list.save(this._filePath, true);
};

ResourceList.prototype.load = function() {
  this._filePath = options.cacheDir + '/' + this._resourceName.toLowerCase() + '.cache';

  if (this._list.load(this._filePath) !== true) {
    this._list.load({
      tasks: []
    });
    this.save();
  }
};

ResourceList.prototype.sync = function(callback) {
  if (typeof callback !== 'function') callback = function() {};
  var self = this,
      template = {};

  doRequest(this._resourceName, undefined, function(results) {
    if (results instanceof Error) {
      callback.call(undefined, results);
    } else {
      results = results.filter(self._filter).map(self._map);
      template[self._resourceName.toLowerCase()] = results;
      self._list.load(template);
      self.save();
      callback.call(undefined, self._list.get()[self._resourceName.toLowerCase()]);
    }
  });
};

ResourceList.prototype.list = function(callback, sync) {
  if (typeof callback !== 'function') return new Error('No callback specified');

  if (sync === true) {
    this.sync(callback);
  } else {
    callback.call(undefined, this._list.get()[this._resourceName.toLowerCase()]);
  }

  return true;
};

// ###############################################################
// ###############################################################

function Tasks() {
  ResourceList.call(this, 'Tasks');
}

Tasks.prototype = new ResourceList();

Tasks.prototype._map = function(rawObject) {
  return {
    id: rawObject.ID,
    name: rawObject.Description
  };
};

Tasks.prototype._filter = function(rawObject) {
  return rawObject.Active === true;
};

// ###############################################################
// ###############################################################

function Projects() {
  ResourceList.call(this, 'Projects');
}

Projects.prototype = new ResourceList();

Projects.prototype._map = function(rawObject) {
  return {
    id: rawObject.ID,
    name: rawObject.Name
  };
};

Projects.prototype._filter = function(rawObject) {
  return rawObject.Active === true;
};

// ###############################################################
// ###############################################################

function TimeEntries() {

}

TimeEntries.prototype.create = function() {
  
};

exports = module.exports;

exports.configure = configure;

exports.tasks = new Tasks();
exports.projects = new Projects();
exports.timeEntries = new TimeEntries();