var nock = require('nock');
var expect = require('expect.js');
var sinon = require('sinon');
var modulePath = '../lib/phli';

describe("Phli", function() {
  var phli;

  describe("#settings", function () {
    it("exists as a public object on a Phli instance", function () {
      phli = require(modulePath)();
      expect(typeof phli.settings).to.eql("object");
    });
    
    it("is set to the value of the prototype's defaultSettings if no settings have been passed", function () {
      phli = require(modulePath)();
      expect(phli.settings.apiHost).to.eql("http://services.phila.gov");
      expect(phli.settings.addressKeyPath).to.eql("/ULRS311/Data/LIAddressKey");
      expect(phli.settings.historyPath).to.eql("/PhillyAPI/data/v0.7/HelperService.svc/GetLocationHistory");
    });
    
    it("can be set to the overriding values it's passed on instantiation", function () {
      phli = require(modulePath)({
        apiHost: 'fakeHost',
        addressKeyPath: 'fakeAddressKeyPath',
        historyPath: 'fakeHistoryPath'
      });

      expect(phli.settings.apiHost).to.eql("fakeHost");
      expect(phli.settings.addressKeyPath).to.eql("fakeAddressKeyPath");
      expect(phli.settings.historyPath).to.eql("fakeHistoryPath");
    });
  });

  describe("#getAddressKey", function () {
    it("exists a public method on a phli instance", function (done) {
      phli = require(modulePath)();
      expect(typeof phli.getAddressKey).to.eql("function");
      done();
    });

    it("makes an API call to the proper services.phila.gov URL", function (done) {
      nock("http://services.phila.gov")
        .get("/PhillyApi/Data/v0.7/Service.svc/permits(%27someAddress%27)?%24format=json")
        .reply(200, {resp: "fakeResponse"});

      phli.getPermitInfo('someAddress', function(err, data) {
        expect(data).to.eql({resp: 'fakeResponse'});
        done();
      });
    });
  });

  describe("#getPermitInfo", function () {
    it("exists a public method on a phli instance", function (done) {
      phli = require(modulePath)();
      expect(typeof phli.getPermitInfo).to.eql("function");
      done();
    });

    it("makes an API call to the proper services.phila.gov endpoint in the proper Odata-style syntax with the necessary parameters", function (done) {
      nock("http://services.phila.gov")
        .get("/PhillyApi/Data/v0.7/Service.svc/permits(%27someID%27)?%24format=json")
        .reply(200, {resp: "fakeResponse"});

      phli.getPermitInfo('someID', function(err, data) {
        expect(data).to.eql({resp: 'fakeResponse'});
        done();
      });
    });
  });

  describe("#getAddressHistory", function () {
    it("exists a public method on a phli instance", function (done) {
      phli = require(modulePath)();
      expect(typeof phli.getAddressHistory).to.eql("function");
      done();
    });

    it("makes an API call to the proper services.phila.gov URL in the proper Odata-style syntax", function (done) {
      // getAddressKey request
      nock("http://services.phila.gov")
        .get("/ULRS311/Data/LIAddressKey/someAddress?")
        .reply(200, {
          AgencyID: 'agencyIDVal',
          TopicName: 'topicNameVal',
          TopicID: 'topicIDVal',
          AddressRef: 'addressRefVal'
        });

      // getAddressHistory request
      nock("http://services.phila.gov")
        .get("/PhillyAPI/data/v0.7/HelperService.svc/GetLocationHistory?%24format=json&AddressKey=topicIDVal")
        .reply(200, {resp: "fakeResponse"});

      phli.getAddressHistory('someAddress', function(err, data) {
        expect(data).to.eql({resp: 'fakeResponse'});
        done();
      });      
    });
  });

  describe("#getPermits", function () {
    it("exists a public method on a phli instance", function (done) {
      phli = require(modulePath)();
      expect(typeof phli.getPermits).to.eql("function");
      done();
    });
  });

  describe("#getType", function () {
    context("it is passed a 'permits' type", function () {
      context("it is passed an options object with a contractor_name property", function () {
        it("makes the properly formatted Odata-style API call and capitalizes the contractor name in the URL", function (done) {
          nock("http://services.phila.gov")
            .get("/PhillyApi/Data/v0.7/Service.svc/permits?%24format=json&%24filter=substringof(%27CONTRACTORNAME%27%2C%20contractor_name)&%24expand=locations&%24top=&%24inlinecount=")
            .reply(200, {resp: "fakeResponse"});

          phli.getType('permits', {contractor_name: 'contractorName'}, function(err, data) {
            expect(data).to.eql({resp: 'fakeResponse'});
            done();
          });
        });
      });
    });

    context("it is not passed a valid type", function () {
      it("Returns a 'Bad type' error", function (done) {
        phli.getType('fakeType', {contractor_name: 'contractorName'}, function(err, data) {
          expect(err).to.eql(new Error('Bad type'));
          done();
        });
      });
    });
  });

  describe("#getData", function () {
    beforeEach(function() {
      phli = require(modulePath)();
    });

    it("exists a public method on a phli instance", function (done) {
      expect(typeof phli.getData).to.eql("function");
      done();
    });

    it("makes an API call to the URL it is passed endpoint", function (done) {
      nock('http://www.someURL.com')
        .get('/some/path?foo=bar')
        .reply(200, {resp: 'fakeResponse'});

      phli.getData('http://www.someURL.com/some/path', {foo: 'bar'}, function(err, data) {
        expect(data).to.eql({resp: 'fakeResponse'});
        done();
      });
    });

    it("continues to work as designed, even if the API responds with an error code of 500", function (done) {
      nock('http://www.someURL.com')
        .get('/some/path?foo=bar')
        .reply(500, {resp: 'fake500Response'});

      phli.getData('http://www.someURL.com/some/path', {foo: 'bar'}, function(err, data) {
        expect(data).to.eql({resp: 'fake500Response'});
        done();
      });
    });
  });
});
