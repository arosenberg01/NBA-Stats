"use strict";

var https = require('https');
var fs = require('fs');
var zlib = require('zlib');
var mongoose = require('mongoose');
var Day = require('./test-schema');

var ACCESS_TOKEN = 'a244603e-e107-43ea-a2c2-296cd74fe9d8';
var USER_AGENT = 'mybot/1.0 (ansel01@gmail.com)';

var db = mongoose.connect('mongodb://localhost/nba');
var dateNum;

// mongoose.connection.once('connected', function() {
//   console.log("Connected to database")
// });

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
      'date': '20150316'
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
    console.log('--------------------------------------------------------------');
    console.log('\nREQUEST URL\nhttps://' + default_opts.host + default_opts.path);
    console.log('\n--------------------------------------------------------------');

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
            console.log('urlElements.method: ' + urlElements.method);

            if (urlElements.method === 'events') {
              var eventIds = [];

              for (var i = 0; i < parsedResults.event.length; i++) {
                eventIds.push(parsedResults.event[i].event_id);
              }
       
            } else if (urlElements.method === 'boxscore') {
              for (var key in parsedResults) {
                console.log(key);
              }

            }
            
            var test =  new Day();
            test.date = parseInt(urlElements.params.date);
            test.games = eventIds;

            test.save(function(err, data) {
              if (err) {
                console.log(err)
              } else {
                console.log('Data: ' + data);
  
              }
            });




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

    setTimeout(function() {
      dateNum = parseInt(urlElements.params.date);
      console.log(typeof dateNum + ": " + dateNum);
      if (dateNum > 20150312) {
        dateNum--;
        urlElements.params.date = dateNum.toString();
        requestData(urlElements);
      } else {
        console.log('DONE FETCHING DATA');
        console.log('(Last day: ' + urlElements.params.date + ')');
        mongoose.disconnect();
      }
    }, 12000);

  }
  
  
  // GET /sport/boxscore/event_id.format
  // https://erikberg.com/nba/boxscore/20120621-oklahoma-city-thunder-at-miami-heat.json

  requestData(urlElements);

  
   // urlElements.sport = 'nba';
   //  urlElements.method = 'boxscore';
   //  urlElements.id = eventIds[0];
   //  urlElements.params = {};

};


main();















