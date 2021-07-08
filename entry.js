var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();

var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
  app.use(express.static(__dirname + '/public'));
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);