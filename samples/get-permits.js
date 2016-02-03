var phli = require('../lib/phli')();

phli.getPermitInfo(659695, { expand: 'locations' }, function getData(err, data) {
  console.log(JSON.stringify(data));
});