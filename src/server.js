var express = require('express');
var app = express();

app.use('/game', express.static(__dirname + '/public'));

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Node app is up and running to serve static HTML content.');
});