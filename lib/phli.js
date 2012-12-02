var _ = require('underscore');
var request = require('request');
var fs = require('fs');

function Phli(opts) {
  this.defaultSettings = {
    apiHost: 'http://services.phila.gov',
    addressKeyPath: '/ULRS311/Data/LIAddressKey',
    apiPathBase: '/PhillyApi/Data/v0.7/Service.svc',
    historyPath: '/PhillyAPI/data/v0.7/HelperService.svc/GetLocationHistory'
  };

  this.settings = opts ? _.defaults(opts, this.defaultSettings) : this.defaultSettings;
}

Phli.prototype.getAddressKey = function (address, callback) {
  var url = this.settings.apiHost + this.settings.addressKeyPath + '/' + encodeURI(address);
  this.getData(url, {}, callback);
};

Phli.prototype.getPermits = function (options, callback) {
  var url = this.settings.apiHost + this.settings.apiPathBase + '/permits';
  var params = buildCommonParams(options);

  params.$expand = "locations";

  if (options.contractor_name) {
    params.$filter = params.$filter + ' and ' + 
      buildFilterPart(options.contractor_name, "substringof('%XX%', contractor_name)");
  }

  this.getData(url, params, function (err, data) {
    if (err) return callback(err);
    callback(null, sortData('permits', options, data));
  });
};

Phli.prototype.getLicenses = function (options, callback) {
  var url = this.settings.apiHost + this.settings.apiPathBase + '/licenses';
  var params = buildCommonParams(options);

  this.getData(url, params, function (err, data) {
    if (err) return callback(err);
    callback(null, sortData('licenses', options, data));
  });
};

Phli.prototype.getCases = function (options, callback) {
  var url = this.settings.apiHost + this.settings.apiPathBase + '/violationdetails';
  var params = buildCommonParams(options);

  params.$expand = "cases,locations";

  this.getData(url, params, function (err, data) {
    if (err) return callback(err);
    callback(null, sortCasesData(data));
  });
};

Phli.prototype.getAddressHistory = function (address, callback) {
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
  var path = this.settings.apiHost + buildPermitPath(this.settings.apiPathBase, permitID);

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

// helpers
function buildCommonParams (options) {
  var params = {
    $format: "json",
    $filter: "",
    $expand: "locations",
    $top: options.top || "",
    $inlinecount: options.top ? "allpages" : ""
  };

  var filters = [];
  var locationParams = buildLocationParams(options);
  var dateParams = buildDateParams(options);
  
  if (locationParams) {
    filters.push(locationParams);
  }
  if (dateParams) {
    filters.push(dateParams);
  }
  params.$filter = filters.join(" and ");
  
  return params;
}

function buildPermitPath (permitPathBase, permitID) {
  if (permitID) {
    return permitPathBase + "/permits('" + permitID + "')";
  }
}

function buildDateParams(obj, datetimePrefix) {
  var prefix = datetimePrefix ? datetimePrefix : "issued";
  var paramsParts = [];

  if (obj.start_date) {
    paramsParts.push(buildFilterPart(obj.start_date, prefix + "_datetime ge datetime'%XX%'"));
  }
  if (obj.end_date) {
    paramsParts.push(buildFilterPart(obj.end_date, prefix + "_datetime le datetime'%XX%'"));
  }

  if (paramsParts.length === 0) {
    return false;
  } else if (paramsParts.length > 1) {
    return paramsParts.join(" and ");
  } else {
    return paramsParts[0];
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

function buildFilterPart(filterPart, pattern) {
  var formattedFilterParts = [];
  var i;
  var filterPartsLength;

  if (typeof filterPart === "string") {
    return pattern.replace('%XX%', filterPart);
  } else if (typeof filterPart === "object") {
    filterPartsLength = filterPart.length;
    for (i = 0; i < filterPartsLength; i++) {
      formattedFilterParts.push(pattern.replace("%XX%", filterPart[i]));
    }
  }

  if (formattedFilterParts.length > 1) {
    return "(" + formattedFilterParts.join(" or ") + ")";
  } else {
    return formattedFilterParts[0];
  }
}

function sortData(type, options, data) {
  console.log(data);
  var sortedData = {};
  var item;
  var key;
  var i;
  // workaround for crappy odata -- not needed if we pass inlinecount?
  //var results = options.top ? data.d : data.d.results;
  var results = data.d.results;
  var resultsLength = results.length;

  for (i = 0; i < resultsLength; i++) {
    item = results[i];
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

function sortCasesData(data) {
  var sortedData = {},
    dataLength = data.d.results.length,
    item,
    locationKey,
    caseKey,
    i;

  for(i = 0; i < dataLength; i++) {
    item = data.d.results[i];
    locationKey = item.locations.location_id;
    caseKey = item.cases.case_number;
    
    if(sortedData[locationKey] === undefined) {
      sortedData[locationKey] = item.locations;
      sortedData[locationKey].cases = {};
    }
    if(sortedData[locationKey].cases[caseKey] === undefined) {
      sortedData[locationKey].cases[caseKey] = item.cases;
      sortedData[locationKey].cases[caseKey].violationdetails = [];
    }
    delete item.locations;
    delete item.cases;
    sortedData[locationKey].cases[caseKey].violationdetails.push(item);
  }
  return sortedData;
}
