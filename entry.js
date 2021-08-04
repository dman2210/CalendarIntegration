var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();
console.log("server starting...")
var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };
  app.use(express.static(__dirname + '/public'));
  http.createServer(app).listen(8080);
  https.createServer(options, app).listen(4433);
  console.log("server running")