[![Build Status](https://secure.travis-ci.org/mdb/node-phli.png?branch=master)](https://travis-ci.org/mdb/node-phli)

# phli

A Node.js module for interacting with the City of Philadelphia's Licenses & Inspections data.

`phli` was built during the December 2012 [Random Hacks of Kindness](http://www.rhok.org) Philadelphia hackathon.

## Getting Started

Install phli:

```
npm install phli
```

Require and instantiate phli:

```
var phli = require('phli')();
```

## Example Usage

### getAddressHistory

Get L & I history for a Philadelpia address:

```javascript
phli.getAddressHistory('1500 market street', function (err, data) {
  console.log(data);
});
```

### getPermits

Get permits data related to a certain filter criteria, such as zipcode:

```javascript
phli.getPermits({zip: '19143'}, function (err, data) {
  console.log(data);
});
```

Available filters example:

```javascript
{
  zip: '19143', // pass an array of zipcodes to filter on multiple zips
  ward: '44', // 1 - 66; pass an array of wards to filter on multiple wards
  contractor_name: 'John Doe'; pass an array of contractors to filter on multiple contractors
  council_district: '1', // 1 - 10; pass an array of districts to filter on multiple districts
  census_tract: '1', // 1 - 300-and-something; pass an array of tracts to filter on multiple tracts
  start_date: '2011-12-01',
  end_date: '2012-12-01',
  top: '2'
}
```

### getLicenses

Get licenses data related to a certain filter criteria, such as zipcode:

```javascript
phli.getLicenses({zip: '19143'}, function (err, data) {
  console.log(data);
});
```

Available filters example:

```javascript
{
  zip: '19143', // pass an array of zipcodes to filter on multiple zips
  ward: '44', // 1 - 66; pass an array of wards to filter on multiple wards
  council_district: '1', // 1 - 10; pass an array of districts to filter on multiple districts
  census_tract: '1', // 1 - 300-and-something; pass an array of tracts to filter on multiple tracts
  start_date: '2011-12-01',
  end_date: '2012-12-01',
  top: '2'
}
```

### getCases

Get cases data related to a certain filter criteria, such as zipcode:

```javascript
phli.getLicenses({zip: '19143'}, function (err, data) {
  console.log(data);
});
```

Available filters example:

```javascript
{
  zip: '19143', // pass an array of zipcodes to filter on multiple zips
  ward: '44', // 1 - 66; pass an array of wards to filter on multiple wards
  council_district: '1', // 1 - 10; pass an array of districts to filter on multiple districts
  census_tract: '1', // 1 - 300-and-something; pass an array of tracts to filter on multiple tracts
  start_date: '2011-12-01',
  end_date: '2012-12-01'
}
```

### getPermitInfo

Get permit details surrounding a specific permit ID, such as 33333:

```javascript
phli.getPermitInfo('33333', function (err, data) {
  console.log(data);
});
```
