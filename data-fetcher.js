"use strict";

var https = require('https');
var fs = require('fs');
var zlib = require('zlib');

var ACCESS_TOKEN = 'a244603e-e107-43ea-a2c2-296cd74fe9d8';
var USER_AGENT = 'mybot/0.1-(ansel01@gmail.com)';

// var buildURL = function(host, sport, method, id, format, params) {
//   var ary = [sport, method, id];
//   var path;
//   var url;
//   var param_list = [];
//   var param_string;
//   var key;

//   path = ary.filter(function (element) {
//     return element !== undefined;
//   }).join('/');
//   url = 'https://' + host + '/' + path + '.' + format;

//   // check for parameters and create parameter string
//   if (params) {
//     for (key in params) {
//       if (params.hasOwnProperty(key)) {
//         param_list.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
//       }
//     }
//     param_string = param_list.join('&');
//     if (param_list.length > 0) {
//       url += '?' + param_string;
//     }
//   }
//   return url;
// }

var main = function() {

  var host = 'erikberg.com';
  var sport = undefined;
  var method = 'events';
  var id = 'undefined';
  var format = 'json';
  var params = {
    'sport' : 'nba',
    'date': '20130414'
  }

  var url; 
  var default_opts;
  var chunks;
  var buffer;
  var encoding;

  default_opts = {
    'host': 'erikberg.com',
    'path': '/nba/boxscore/20120621-oklahoma-city-thunder-at-miami-heat.json',
    'headers': {
        'Accept-Encoding': 'gzip',
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'User-Agent': 'mybot/0.1 (ansel01@gmail.com)'
    }
  };

  // url = buildURL(host, sport, method, id, format, params);
  // 'https://erikberg.com/nba/boxscore/20120621-oklahoma-city-thunder-at-miami-heat.json'

  https.get(default_opts, function(res) {
    chunks = [];
    res.on('data', function (chunk) {
      chunks.push(chunk);
    });
    res.on('end', function() {
      // if (res.statusCode !== 200) {
      //   // handle error...
      //   console.log(res.statusCode);
      //   console.warn("Server did not return a 200 response!\n" + chunks.join(''));
      //   process.exit(1);
      // }

      encoding = res.headers['content-encoding'];
      if (encoding === 'gzip') {
        console.log('Encoded with gzip');
        buffer = Buffer.concat(chunks);
        zlib.gunzip(buffer, function (err, decoded) {
          if (err) {
            console.warn("Error trying to decompress data: " + err.message);
            process.exit(1);
          }
          console.log('Decoded');
         
          var writeStream = fs.createWriteStream('output.js');
          writeStream.pipe(decoded.toString());
          
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