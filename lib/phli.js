var _ = require('underscore');
var request = require('request');

function Phli(opts) {
  this.defaultSettings = {
    apiHost: 'http://services.phila.gov',
    addressKeyPath: '/ULRS311/Data/LIAddressKey',
    historyPath: '/PhillyAPI/data/v0.7/HelperService.svc/GetLocationHistory',
    permitPathBase: '/PhillyApi/data/v0.7/Service.svc/'
  };

  this.settings = opts ? _.defaults(opts, this.defaultSettings) : this.defaultSettings;
}

Phli.prototype.getAddressKey = function (address, callback) {
  var url = this.settings.apiHost + this.settings.addressKeyPath + '/' + encodeURI(address);
  this.getData(url, {}, callback);
};

Phli.prototype.getHistory = function (address, callback) {
  var self = this;
  var path = this.settings.apiHost + this.settings.historyPath;
  var params = {
    $format: 'json'
  };

  this.getAddressKey(address, function (data) {
    params.AddressKey = data.TopicID;

    self.getData(path, params, callback);
  });
};

Phli.prototype.getPermitInfo = function (permitID, callback) {
  var params = {
    $format: 'json'
  };
  var path = this.settings.apiHost + buildPermitPath(this.settings.permitPathBase, permitID);

  this.getData(path, params, callback);
};

Phli.prototype.getData = function (path, params, callback) {
  _.defaults(params, {});

  request(path, {qs: params}, function (error, response, body) {
    callback(JSON.parse(body));
  });
};

module.exports = function(opts) {
  return new Phli(opts);
};

// helpers
function buildPermitPath (permitPathBase, permitID) {
  if (permitID) {
    return permitPathBase + "permits('" + permitID + "')";
  }
}
