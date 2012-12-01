var _ = require('underscore');
var request = require('request');

function Phli(opts) {
  this.defaultSettings = {
    apiHost: 'http://services.phila.gov',
    addressKeyPath: '/ULRS311/Data/LIAddressKey',
    apiPathBase: '/PhillyApi/Data/v0.7/Service.svc',
    historyPath: '/PhillyAPI/data/v0.7/HelperService.svc/GetLocationHistory',
    permitPathBase: '/PhillyApi/data/v0.7/Service.svc/'
  };

  this.settings = opts ? _.defaults(opts, this.defaultSettings) : this.defaultSettings;
}

Phli.prototype.getAddressKey = function (address, callback) {
  var url = this.settings.apiHost + this.settings.addressKeyPath + '/' + encodeURI(address);
  this.getData(url, {}, callback);
};

Phli.prototype.getPermits = function (options, callback) {
  var params = buildPermitsParams(options);
  var url = this.settings.apiHost + this.settings.apiPathBase + '/permits';

  this.getData(url, params, callback);
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

function buildPermitsParams(obj) {
  /*
    $filter: "startswith(locations/zip, 'ZIP')", 
    $filter: "locations/ward eq 'WARD_VAL'", 
    $filter: "locations/council_district eq 'CD_VAL'", 
    $filter: "locations/census_tract eq 'CENSUS_TRACT_VAL'", 
    $filter: "substringof('CONTRACTOR_NAME', contractor_name)", 
    $format: "json"
  */

  var params = {
    $format: "json",
    $filter: ""
  };
  var filters = [];
  
  if (obj.zip) {
    filters.push(buildFilterPart(obj.zip, "startswith(locations/zip, '%XX%')"));
  }
  if (obj.ward) {
    filters.push(buildFilterPart(obj.ward, "locations/ward eq %XX%"));
  }
  if (obj.council_district) {
    filters.push(buildFilterPart(obj.council_district, "locations/council_district eq %XX%"));
  }
  if (obj.census_tract) {
    filters.push(buildFilterPart(obj.census_tract, "locations/census_tract eq %XX%"));
  }
  if (obj.contractor_name) {
    filters.push(buildFilterPart(obj.contractor_name, "substringof('%XX%', contractor_name)"));
  }

  params.$filter = filters.join(" and ");

  return params;
}

function buildFilterPart(filterPart, pattern) {
  var formattedFilterParts = [];
  var i;
  var filterPartsLength;

  if (typeof filterPart === "string") {
    return pattern.replace('%XX%', filterPart);
  } else if (typeof filterPart === "object") {
    filterPartsLength = filterPart.length;
    for (i = 0; i < filterPartsLength; i++) {
      formattedFilterParts.push(pattern.replace("%XX%", filterPart))
    }
  }

  if (formattedFilterParts.length > 1) {
    return "(" + formattedFilterParts.join(" or ") + ")";
  } else {
    return formattedFilterParts[0];
  }
}
