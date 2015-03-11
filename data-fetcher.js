"use strict";

var https = require('https');
var fs = require('fs');
var zlib = require('zlib');

var ACCESS_TOKEN = 'a244603e-e107-43ea-a2c2-296cd74fe9d8';
var USER_AGENT = 'mybot/1.0 (ansel01@gmail.com)';

// Build path for API request destination
var buildURL = function(sport, method, id, format, params) {
  var array = [sport, method, id];
  var path;
  var url;
  var param_list = [];
  var param_string;
  var key;

  path = array.filter(function (element) {
    return element !== undefined;
  }).join('/');
  url = '/' + path + '.' + format;

  // Check for parameters and create parameter string
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

  // Initialize arguments for API URL building
  var urlElements = {
    sport: undefined,
    method: 'events',
    id: undefined,
    format:'json',
    params: {
      'sport' : 'nba',
      'date': '20130414'
    } 
  };

  // Set options object for http.get argument
  var default_opts = {
    'host': 'erikberg.com',
    'path': '/',
    'headers': {
        'Accept-Encoding': 'gzip',
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'User-Agent': USER_AGENT
    }
  };

  // Request data from API target
  var requestData = function(urlElements) {

    default_opts.path = buildURL(urlElements.sport, urlElements.method, urlElements.id, urlElements.format, urlElements.params);
    console.log('\nREQUEST URL\nhttps://' + default_opts.host + default_opts.path + '\n\nEVENT IDS');

    https.get(default_opts, function(res) {
      var chunks = [];
      res.on('data', function (chunk) {
        chunks.push(chunk);
      });
      res.on('end', function() {
        if (res.statusCode !== 200) {
          // Handle error...
          console.log(res.statusCode);
          console.warn("Server did not return a 200 response!\n" + chunks.join(''));
          process.exit(1);
        }

        var encoding = res.headers['content-encoding'];
        if (encoding === 'gzip') {
          var buffer = Buffer.concat(chunks);
          zlib.gunzip(buffer, function (err, decoded) {
            if (err) {
              return console.log(err)
              console.warn("Error trying to decompress data: " + err.message);
              process.exit(1);
            }
            
            var results = decoded.toString();
            var parsedResults = JSON.parse(results);
            var eventIds = [];
            for (var i = 0; i < parsedResults.event.length; i++) {
              eventIds.push(parsedResults.event[i].event_id);
            }
            console.log(eventIds);

            fs.appendFile('output.js', JSON.stringify(eventIds), function(err) {
              if (err) {
                return console.log(err);
              }
            });
            
          });
        } else {
          console.log('Not encoded: ' + chunks.join(''));
        }
      }); 
    }).on('error', function (err) {
      console.warn("Error trying to contact server: " + err.message);
      process.exit(1);
    });
  }

  requestData(urlElements);
};

main();
