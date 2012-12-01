var nock = require('nock');
var expect = require('expect.js');
var sinon = require('sinon');
var modulePath = '../lib/phli';

describe("Phli", function() {
  var phli;

  describe("#settings", function () {
    it("exists as a public object on a Phli instance", function () {
      phli = require(modulePath)();
      expect(typeof phli.settings).to.eql('object');
    });
    
    it("is set to the value of the prototype's defaultSettings if no settings have been passed", function () {
      phli = require(modulePath)();
      expect(phli.settings.apiHost).to.eql("http://services.phila.gov");
      expect(phli.settings.addressKeyPath).to.eql("/ULRS311/Data/LIAddressKey");
      expect(phli.settings.historyPath).to.eql("/PhillyAPI/data/v0.7/HelperService.svc/GetLocationHistory");
      expect(phli.settings.permitPathBase).to.eql("/PhillyApi/data/v0.7/Service.svc/");
    });
    
    it("can be set to the overriding values it's passed on instantiation", function () {
      phli = require(modulePath)({
        apiHost: 'fakeHost',
        addressKeyPath: 'fakeAddressKeyPath',
        historyPath: 'fakeHistoryPath',
        permitPathBase: 'fakePermitPathBase'
      });

      expect(phli.settings.apiHost).to.eql("fakeHost");
      expect(phli.settings.addressKeyPath).to.eql("fakeAddressKeyPath");
      expect(phli.settings.historyPath).to.eql("fakeHistoryPath");
      expect(phli.settings.permitPathBase).to.eql("fakePermitPathBase");
    });
  });

  describe("#getAddressKey", function (done) {
    it("exists a public method on a phli instance", function (done) {
      phli = require(modulePath)();
      expect(typeof phli.getAddressKey).to.eql("function");
      done();
    });
  });

  describe("#getPermitInfo", function (done) {
    it("exists a public method on a phli instance", function (done) {
      phli = require(modulePath)();
      expect(typeof phli.getPermitInfo).to.eql("function");
      done();
    });
  });

  describe("#getHistory", function (done) {
    it("exists a public method on a phli instance", function (done) {
      phli = require(modulePath)();
      expect(typeof phli.getHistory).to.eql("function");
      done();
    });
  });

  describe("#getPermits", function (done) {
    it("exists a public method on a phli instance", function (done) {
      phli = require(modulePath)();
      expect(typeof phli.getPermits).to.eql("function");
      done();
    });
  });

  describe("#getData", function (done) {
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

      phli.getData('http://www.someURL.com/some/path', {foo: 'bar'}, function(r) {
        expect(r).to.eql({resp: 'fakeResponse'});
        done();
      });
    });
  });
});
