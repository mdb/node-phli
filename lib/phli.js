var _ = require('underscore');
var request = require('request');
var fs = require('fs');

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

  this.getData(url, params, function (data) {
    callback(_.toArray(sortData('permits', data)));
  });
};

Phli.prototype.getLicenses = function (options, callback) {
  var params = buildLicensesParams(options);
  var url = this.settings.apiHost + this.settings.apiPathBase + '/licenses';

  this.getData(url, params, function (data) {
    callback(_.toArray(sortData('licenses', data)));
  });
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

function buildDateParams(obj) {
  var paramsParts = [];

  if (obj.start_date) {
    paramsParts.push(buildFilterPart(obj.start_date, "issued_datetime ge datetime'%XX%'"));
  }
  if (obj.end_date) {
    paramsParts.push(buildFilterPart(obj.end_date, "issued_datetime le datetime'%XX%'"));
  }

  if (paramsParts.length === 0) {
    return false;
  } else if (paramsParts.length > 1) {
    return paramsParts.join(" and ");
  } else {
    return paramsParts[0]
  }
}

function buildLocationParams(obj) {
  var paramsParts = [];

  if (obj.zip) {
    paramsParts.push(buildFilterPart(obj.zip, "startswith(locations/zip, '%XX%')"));
  }
  if (obj.ward) {
    paramsParts.push(buildFilterPart(obj.ward, "locations/ward eq '%XX%'"));
  }
  if (obj.council_district) {
    paramsParts.push(buildFilterPart(obj.council_district, "locations/council_district eq '%XX%'"));
  }
  if (obj.census_tract) {
    paramsParts.push(buildFilterPart(obj.census_tract, "locations/census_tract eq '%XX%'"));
  }

  if (paramsParts.length === 0) {
    return false;
  } else if (paramsParts.length > 1) {
    return paramsParts.join(" and ");
  } else {
    return paramsParts[0];
  }
}

function buildPermitsParams(obj) {
  var params = {
    $format: "json",
    $expand: "locations",
    $filter: ""
  };
  var filters = [];
  var locationParams = buildLocationParams(obj);
  var dateParams = buildDateParams(obj);
  
  if (obj.contractor_name) {
    filters.push(buildFilterPart(obj.contractor_name, "substringof('%XX%', contractor_name)"));
  }
  if (locationParams) {
    filters.push(locationParams);
  }
  if (dateParams) {
    filters.push(dateParams);
  }

  params.$filter = filters.join(" and ");
  return params;
}

function buildLicensesParams(obj) {
  var params = {
    $format: "json",
    $filter: "",
    $expand: "locations"
  };
  var filters = [];
  var locationParams = buildLocationParams(obj);
  var dateParams = buildDateParams(obj);
  
  if (locationParams) {
    filters.push(locationParams);
  }
  if (dateParams) {
    filters.push(dateParams);
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
      formattedFilterParts.push(pattern.replace("%XX%", filterPart));
    }
  }

  if (formattedFilterParts.length > 1) {
    return "(" + formattedFilterParts.join(" or ") + ")";
  } else {
    return formattedFilterParts[0];
  }
}

function sortData(type, data) {
  var sortedData = {};
  var item;
  var key;
  var i;
  var dataLength = data.d.results.length;

  for (i = 0; i < dataLength; i++) {
    item = data.d.results[i];
    key = item.locations.location_id;

    if(sortedData[key] === undefined) {
      sortedData[key] = item.locations;
      sortedData[key][type] = [];
    }
    delete item.locations;
    sortedData[key][type].push(item);
  }

  return sortedData;
}
