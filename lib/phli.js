var _ = require('underscore');
var request = require('request');
var helpers = require('./helpers');

function Phli(opts) {
  this.defaultSettings = {
    apiHost: "http://services.phila.gov",
    addressKeyPath: "/ULRS311/Data/LIAddressKey",
    apiPathBase: "/PhillyApi/Data/v0.7/Service.svc",
    historyPath: "/PhillyAPI/data/v0.7/HelperService.svc/GetLocationHistory"
  };

  this.settings = opts ? _.defaults(opts, this.defaultSettings) : this.defaultSettings;
}

Phli.prototype.getAddressKey = function (address, callback) {
  var url = this.settings.apiHost + this.settings.addressKeyPath + '/' + encodeURI(address);
  this.getData(url, {}, callback);
};

Phli.prototype.getPermits = function (options, callback) {
  return this.getType('permits', options, callback);
};

Phli.prototype.getLicenses = function (options, callback) {
  return this.getType('licenses', options, callback);
};

Phli.prototype.getCases = function (options, callback) {
  return this.getType('cases', options, callback);
};

Phli.prototype.getType = function (type, options, callback) {
  var that = this;
  var path = this.settings.apiHost + this.settings.apiPathBase + '/' + type;
  var params = helpers.buildCommonParams(options);

  var typeMap = {
    'permits': function () {
      if (options.contractor_name) {
        params.$filter = params.$filter + " and " + 
          helpers.buildFilterPart(options.contractor_name, "substringof('%XX%', contractor_name)");
      }  
    },
    'licenses': function () {}, // noop
    'cases': function () {
      path = that.settings.apiHost + that.settings.apiPathBase + '/violationdetails';
      params.$expand = "cases,locations";
      // cases isn't working with the top param
      params.$top = '';
      params.$inlinecount = '';
    }
  };
  if (!typeMap[type]) return callback(new Error('Bad type'));
  typeMap[type]();

  this.getData(path, params, callback);
};

Phli.prototype.getAddressHistory = function (address, callback) {
  var self = this;
  var path = this.settings.apiHost + this.settings.historyPath;
  var params = {
    $format: "json"
  };

  this.getAddressKey(address, function (data) {
    params.AddressKey = data.TopicID;

    self.getData(path, params, callback);
  });
};

Phli.prototype.getPermitInfo = function (permitID, callback) {
  var params = {
    $format: "json"
  };
  var path = this.settings.apiHost + helpers.buildPermitPath(this.settings.apiPathBase, permitID);

  this.getData(path, params, callback);
};

Phli.prototype.getData = function (path, params, callback) {
  _.defaults(params, {});

  request(path, {qs: params}, function (err, response, body) {
    if (err) return callback(err);
    callback(null, JSON.parse(body));
  });
};

module.exports = function(opts) {
  return new Phli(opts);
};
