"use strict";

var https = require('https');
var fs = require('fs');
var zlib = require('zlib');
var events = require('events');
var eventEmitter = new events.EventEmitter();
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
    console.log('\n==============================================================');
    console.log('==============================================================');
    console.log('\nREQUEST URL\nhttps://' + default_opts.host + default_opts.path);
    console.log('\n--------------------------------------------------------------\n');

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
          console.log('DECODING...')
          var buffer = Buffer.concat(chunks);
          zlib.gunzip(buffer, function (err, decoded) {
            if (err) {
              return console.log(err)
              console.warn("Error trying to decompress data: " + err.message);
              process.exit(1);
            }

            console.log('DECODED\n');
            
            var results = decoded.toString();
            var parsedResults = JSON.parse(results);

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
                console.log('SAVED TO DB\n' + data);
                console.log('\n--------------------------------------------------------------\n');
                // Day.findOne({date: parseInt(urlElements.params.date)}, 'date', function(err, day)     
                // });

                dateNum = test.date;
                dateNum--;

                if (dateNum > 20150312) {
                  eventEmitter.emit('goToNext');
                } else {
                  eventEmitter.emit('stopBot');
                }

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
  
  eventEmitter.on('goToNext', function() {
    setTimeout(function() {
      urlElements.params.date = dateNum.toString();
      requestData(urlElements);
    }, 12000);
  });

  eventEmitter.on('stopBot', function() {
    console.log('DONE WORKING');
    console.log('\n==============================================================');
    console.log('==============================================================\n');
    // console.log('(Last day: ' + urlElements.params.date + ')');
    mongoose.disconnect();
  });
  
  // GET /sport/boxscore/event_id.format
  // https://erikberg.com/nba/boxscore/20120621-oklahoma-city-thunder-at-miami-heat.json

  requestData(urlElements);

  
   // urlElements.sport = 'nba';
   //  urlElements.method = 'boxscore';
   //  urlElements.id = eventIds[0];
   //  urlElements.params = {};

};


main();
