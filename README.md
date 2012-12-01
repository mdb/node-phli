# phli

A Node.js module for interacting with the City of Philadelphia's Licenses & Inspections data.

phli was built during the December 2012 [Random Hacks of Kindness](http://www.rhok.org) Philadelphia hackathon.

The module uses Philadelphia's [311 Mobile Data Service API](http://services.phila.gov/ULRS311).

## Getting Started

Install phli:

    npm install phli

Require and instantiate phli:
  
    var phli = require('phli')();

## Example Usage

### getAddressHistory

Get L & I history for a Philadelpia address:

    phli.getAddressHistory('1500 market street', function (data) {
      console.log(data);
    });

### getPermits

Get permits data related to a certain filter criteria, such as zipcode:

    phli.getPermits({zip: '19143'}, function (data) {
      console.log(data);
    });

Available filters example:

    {
      zip: '19143',
      ward: '44', // 1 - 66
      contractor_name: 'John Doe',
      council_district: '1', // 1 - 10
      census_tract: '1', // 1 - 300-and-something 
      start_date: '2011-12-01',
      end_date: '2012-12-01',
    }

### getLicenses

Get licenses data related to a certain filter criteria, such as zipcode:

    phli.getLicenses({zip: '19143'}, function (data) {
      console.log(data);
    });

Available filters example:

    {
      zip: '19143',
      ward: '44', // 1 - 66
      council_district: '1', // 1 - 10
      census_tract: '1', // 1 - 300-and-something 
      start_date: '2011-12-01',
      end_date: '2012-12-01',
    }

### getCases

Get cases data related to a certain filter criteria, such as zipcode:

    phli.getLicenses({zip: '19143'}, function (data) {
      console.log(data);
    });

Available filters example:

    {
      zip: '19143',
      ward: '44', // 1 - 66
      council_district: '1', // 1 - 10
      census_tract: '1', // 1 - 300-and-something 
      start_date: '2011-12-01',
      end_date: '2012-12-01',
    }
