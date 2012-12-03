var expect = require('expect.js');
var helpers = require('../lib/helpers');

describe("helpers", function() {

  describe("#buildPermitPath", function () {
    it("returns a properly formatted path", function () {
      expect(helpers.buildPermitPath('path', 'permitID')).to.eql("path/permits('permitID')");
    });

    it("returns false if it is not passed a permit id as its second argument", function () {
      expect(helpers.buildPermitPath('path')).to.eql(false);
    });
  });

  describe("#buildDateParams", function () {
    context("it is passed an object with 'start_date' and 'end_date' properties", function () {
      it("returns a properly formatted param part", function () {
        expect(helpers.buildDateParams({
          start_date: '2011-01-01',
          end_date: '2012-01-01'
        })).to.eql("issued_datetime ge datetime'2011-01-01' and issued_datetime le datetime'2012-01-01'");
      });
    });

    context("it is passed an object with no 'start_date' or 'end_date' properties", function () {
      it("returns false", function () {
        expect(helpers.buildDateParams({
          someProperty: 'someValue'
        })).to.eql(false);
      });
    });

    context("it is passed an object with a 'start_date' but no 'end_date' property", function () {
      it("returns a properly formatted param part", function () {
        expect(helpers.buildDateParams({
          start_date: '2012-01-01'
        })).to.eql("issued_datetime ge datetime'2012-01-01'");
      });
    });

    context("it is passed a 'datetimePrefix' as its second argment", function () {
      it("uses the the string as the prefix to '_datetime' in the formatted param parts", function () {
        expect(helpers.buildDateParams({
          start_date: '2011-01-01',
          end_date: '2012-01-01'
        }, 'blah')).to.eql("blah_datetime ge datetime'2011-01-01' and blah_datetime le datetime'2012-01-01'");
      });
    });
  });

  describe("#buildFilterPart", function () {
    context("it is passed a string filterPart value as its first argument", function () {
      it("returns a string with the '%XX' part of the second argument properly replaced", function () {
        expect(helpers.buildFilterPart('someFilterPart', '[[[ %XX% ]]]')).to.eql("[[[ someFilterPart ]]]");
      });
    });

    context("it is passed an array filterPart value as its first argument", function () {
      it("returns a properly formatted string with the '%XX' parts of the second argument properly replaced", function () {
        expect(helpers.buildFilterPart(['firstItem', 'secondItem'], '[[[ %XX% ]]]')).to.eql("([[[ firstItem ]]] or [[[ secondItem ]]])");
      });

      it("returns a properly formatted string no outer parentheses and with the '%XX' part of the second argument properly replaced if the array it's passed only contains one item", function () {
        expect(helpers.buildFilterPart(['onlyItem'], '[[[ %XX% ]]]')).to.eql("[[[ onlyItem ]]]");
      });
    });
  });

  describe("#buildLocationParams", function () {
    context("the object it's passed contains a zip property", function () {
      it("formats the zip value in the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          zip: '19143'
        })).to.eql("startswith(locations/zip, '19143')");
      });

      it("formats an array zip value in the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          zip: ['11111', '22222']
        })).to.eql("(startswith(locations/zip, '11111') or startswith(locations/zip, '22222'))");
      });
    });

    context("the object it's passed contains a ward property", function () {
      it("formats the ward value in the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          ward: 'someWard'
        })).to.eql("locations/ward eq 'someWard'");
      });

      it("formats an array ward value in the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          ward: ['1', '2']
        })).to.eql("(locations/ward eq '1' or locations/ward eq '2')");
      });
    });

    context("the object it's passed contains a council_district property", function () {
      it("formats the council_district value in the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          council_district: 'someCD'
        })).to.eql("locations/council_district eq 'someCD'");
      });

      it("formats an array ward value in the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          council_district: ['1', '2']
        })).to.eql("(locations/council_district eq '1' or locations/council_district eq '2')");
      });
    });

    context("the object it's passed contains a census_tract property", function () {
      it("formats the council_district value in the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          census_tract: 'censusTract'
        })).to.eql("locations/census_tract eq 'censusTract'");
      });

      it("formats an array ward value in the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          census_tract: ['1', '2']
        })).to.eql("(locations/census_tract eq '1' or locations/census_tract eq '2')");
      });
    });

    context("the object it's passed contains zip, council_district, census_tract, and ward properties", function () {
      it("formats the property values into the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          census_tract: 'censusTract',
          zip: 'someZip',
          ward: 'someWard',
          council_district: 'someCD'
        })).to.eql("startswith(locations/zip, 'someZip') and locations/ward eq 'someWard' and locations/council_district eq 'someCD' and locations/census_tract eq 'censusTract'");
      });
    });

    context("the object it's passed contains no zip, council_district, census_tract, or ward properties", function () {
      it("formats the property values into the proper OData-style", function () {
        expect(helpers.buildLocationParams({
          foo: 'bar'
        })).to.eql(false);
      });
    });
  });

  describe("#buildCommonParams", function () {
    context("it is not passed any values which override its defaults", function () {
      it("returns an object whose $format property is 'json'", function () {
        expect(helpers.buildCommonParams({foo: 'bar'}).$format).to.eql('json');
      });
      
      it("returns an object whose $expand property is 'locations'", function () {
        expect(helpers.buildCommonParams({foo: 'bar'}).$expand).to.eql('locations');
      });

      it("returns an object whose $filter property is an empty string", function () {
        expect(helpers.buildCommonParams({foo: 'bar'}).$filter).to.eql('');
      });

      it("returns an object whose $top property is an empty string", function () {
        expect(helpers.buildCommonParams({foo: 'bar'}).$filter).to.eql('');
      });

      it("returns an object whose $inlinecount property is an empty string", function () {
        expect(helpers.buildCommonParams({foo: 'bar'}).$inlinecount).to.eql('');
      });

      it("returns an object whose $filter property is an empty string", function () {
        expect(helpers.buildCommonParams({foo: 'bar'}).$filter).to.eql('');
      });
    });

    context("it is passed an options object with a 'top' property", function () {
      it("returns an object whose $top value is the value of the top property in the options object it's passed", function () {
        expect(helpers.buildCommonParams({top: '1'}).$top).to.eql('1');
      });

      it("returns an object whose $inlinecount value is 'allpages'", function () {
        expect(helpers.buildCommonParams({top: '1'}).$inlinecount).to.eql('allpages');
      });
    });

    context("it is passed locations-related options", function () {
       it("sets the Odata-formatted-related location query to the value of $filter", function () {
        expect(helpers.buildCommonParams({
          zip: 'someZip'
          }).$filter).to.eql("startswith(locations/zip, 'someZip')");
      });
    });

    context("it is passed date-related options", function () {
       it("sets the Odata-formatted-related date query to the value of $filter", function () {
        expect(helpers.buildCommonParams({start_date: 'startDate'}).$filter).to.eql("issued_datetime ge datetime'startDate'");
      });
    });

    context("it is passed date-related and location-related options", function () {
       it("sets the Odata-formatted-related date query to the value of $filter, joining each with ' and '", function () {
        expect(helpers.buildCommonParams({
          start_date: 'startDate',
          zip: 'someZip'
        }).$filter).to.eql("startswith(locations/zip, 'someZip') and issued_datetime ge datetime'startDate'");
      });
    });
  });
});
