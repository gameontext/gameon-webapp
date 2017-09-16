'use strict';

// Used when building/running tests

var express = require('express');
var morgan = require('morgan');
var app = express();
var fs = require('fs');
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

var port =process.env.PORT || 8080;

//setup the logger
//do no log the pings from the proxy (healthcheck)
app.use(morgan('combined', {stream: accessLogStream, skip: function(req, res) {
    return req.method === "HEAD" && req.path === "/"
  }}));

if (/^dev|test$/.test(app.get('env'))) {
  app.use('/', express.static(__dirname + '/.tmp'));
  app.use('/', express.static(__dirname + '/public'));
} else {
  // fix grunt! app.use('/game', express.static(__dirname + '/dist'));
  app.use('/', express.static(__dirname + '/public'));
}

var server = app.listen(port, function () {
  var host = server.address().address;

  console.log('Node app is up and running to serve static HTML content: ' + host + ':' + port);
});
