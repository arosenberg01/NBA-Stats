"use strict";

var https = require('https');
var fs = require('fs');
var zlib = require('zlib');

var ACCESS_TOKEN = 'a244603e-e107-43ea-a2c2-296cd74fe9d8';
var USER_AGENT = 'mybot/1.0 (ansel01@gmail.com)';

var buildURL = function(sport, method, id, format, params) {
  var ary = [sport, method, id];
  var path;
  var url;
  var param_list = [];
  var param_string;
  var key;

  path = ary.filter(function (element) {
    return element !== undefined;
  }).join('/');
  url = '/' + path + '.' + format;

  // check for parameters and create parameter string
  if (params) {
    for (key in params) {
      if (params.hasOwnProperty(key)) {
        param_list.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    }
    param_string = param_list.join('&');
    if (param_list.length > 0) {
      url += '?' + param_string;
    }
  }
  return url;
}

var main = function() {

  // set arguments for API target
  var sport = undefined;
  var method = 'events';
  var id = undefined;
  var format = 'json';
  var params = {
    'sport' : 'nba',
    'date': '20130414'
  }

  var url = buildURL(sport, method, id, format, params);
  console.log(url);

  var default_opts = {
    'host': 'erikberg.com',
    'path': url,
    'headers': {
        'Accept-Encoding': 'gzip',
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'User-Agent': 'mybot/1.0 (ansel01@gmail.com)'
    }
  };

  https.get(default_opts, function(res) {
    var chunks = [];
    res.on('data', function (chunk) {
      chunks.push(chunk);
    });
    res.on('end', function() {
      if (res.statusCode !== 200) {
        // handle error...
        console.log(res.statusCode);
        console.warn("Server did not return a 200 response!\n" + chunks.join(''));
        process.exit(1);
      }

      var encoding = res.headers['content-encoding'];
      if (encoding === 'gzip') {
        console.log('Encoded with gzip');
        var buffer = Buffer.concat(chunks);
        zlib.gunzip(buffer, function (err, decoded) {
          if (err) {
            console.warn("Error trying to decompress data: " + err.message);
            process.exit(1);
          }
          console.log('Decoded');
          
          var results = decoded.toString();
          
          // fs.writeFile('output.js', 'var events = ', function(err) {
          //   if (err) {
          //     return console.log(err);
          //   }
          // });

          fs.appendFile('output.js', results, function(err) {
            if (err) {
              return console.log(err);
            }
          });
          
        });
      } else {
        console.log('Regular data');
        console.log(chunks.join(''));
      }
    });

  }).on('error', function (err) {
    console.warn("Error trying to contact server: " + err.message);
    process.exit(1);
  });
};

main();