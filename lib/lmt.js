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

  exports.clients.load();
  exports.projects.load();
  exports.tasks.load();
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

      if (dataObject.d.results !== undefined)
        callback.call(undefined, dataObject.d.results);
      else
        callback.call(undefined, dataObject.d);
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
  var template = {};

  this._filePath = options.cacheDir + '/' + this._resourceName.toLowerCase() + '.cache';

  if (this._list.load(this._filePath) !== true) {
    template[this._resourceName.toLowerCase()] = [];
    this._list.load(template);
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

function Clients() {
  ResourceList.call(this, 'Clients');
}

Clients.prototype = new ResourceList();

Clients.prototype._map = function(rawObject) {
  return {
    id: rawObject.ID,
    name: rawObject.Name
  };
};

Clients.prototype._filter = function(rawObject) {
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
    name: rawObject.Name,
    clientId: rawObject.ClientID
  };
};

Projects.prototype._filter = function(rawObject) {
  return rawObject.Active === true;
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

function TimeEntries() {
  this._resourceName = 'TimeEntries';
}

TimeEntries.prototype.create = function(params, callback) {
  var rawParams = {
    TaskID: params.task,
    ProjectID: params.project,
    TypeID: 1
  };

  var h = params.time,
      m = (h - Math.floor(h)) * 60,
      s = (m - Math.floor(m)) * 60,
      ms = (s - Math.floor(s)) * 1000;

  h = Math.floor(h);
  m = Math.floor(m);
  s = Math.floor(s);
  ms = Math.floor(ms);

  rawParams.StartTime = new Date(Date.UTC(params.date.getFullYear(), params.date.getMonth(), params.date.getDate(), 0, 0, 0, 0));
  rawParams.EndTime = new Date(Date.UTC(params.date.getFullYear(), params.date.getMonth(), params.date.getDate(), h, m, s, ms));

  rawParams.StartTime = JSON.stringify(rawParams.StartTime).slice(1,-6);
  rawParams.EndTime = JSON.stringify(rawParams.EndTime).slice(1,-6);

  httpOptions.method = 'POST';
  httpOptions.headers['Content-Type'] = 'application/json';
  
  // console.log(JSON.stringify(rawParams));
  doRequest(this._resourceName, rawParams, callback);
};

exports = module.exports;

exports.configure = configure;

exports.tasks = new Tasks();
exports.projects = new Projects();
exports.clients = new Clients();
exports.timeEntries = new TimeEntries();