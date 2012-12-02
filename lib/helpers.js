exports.buildPermitPath = function (permitPathBase, permitID) {
  if (permitID) {
    return permitPathBase + "/permits('" + permitID + "')";
  } else {
    return false;
  }
};

exports.buildDateParams = function (obj, datetimePrefix) {
  var prefix = datetimePrefix ? datetimePrefix : "issued";
  var paramsParts = [];

  if (obj.start_date) {
    paramsParts.push(exports.buildFilterPart(obj.start_date, prefix + "_datetime ge datetime'%XX%'"));
  }
  if (obj.end_date) {
    paramsParts.push(exports.buildFilterPart(obj.end_date, prefix + "_datetime le datetime'%XX%'"));
  }

  if (paramsParts.length === 0) {
    return false;
  } else if (paramsParts.length > 1) {
    return paramsParts.join(" and ");
  } else {
    return paramsParts[0];
  }
};

exports.buildFilterPart = function (filterPart, pattern) {
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
};

exports.buildLocationParams = function (obj) {
  var paramsParts = [];

  if (obj.zip) {
    paramsParts.push(exports.buildFilterPart(obj.zip, "startswith(locations/zip, '%XX%')"));
  }
  if (obj.ward) {
    paramsParts.push(exports.buildFilterPart(obj.ward, "locations/ward eq '%XX%'"));
  }
  if (obj.council_district) {
    paramsParts.push(exports.buildFilterPart(obj.council_district, "locations/council_district eq '%XX%'"));
  }
  if (obj.census_tract) {
    paramsParts.push(exports.buildFilterPart(obj.census_tract, "locations/census_tract eq '%XX%'"));
  }

  if (paramsParts.length === 0) {
    return false;
  } else if (paramsParts.length > 1) {
    return paramsParts.join(" and ");
  } else {
    return paramsParts[0];
  }
};

exports.buildCommonParams = function (options) {
  var params = {
    $format: "json",
    $filter: "",
    $expand: "locations",
    $top: options.top || "",
    $inlinecount: options.top ? "allpages" : ""
  };

  var filters = [];
  var locationParams = exports.buildLocationParams(options);
  var dateParams = exports.buildDateParams(options);
  
  if (locationParams) {
    filters.push(locationParams);
  }
  if (dateParams) {
    filters.push(dateParams);
  }
  params.$filter = filters.join(" and ");
  
  return params;
};

exports.sortCasesData = function (data) {
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
};
