"use strict";

var https = require('https');
var fs = require('fs');
var zlib = require('zlib');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var ACCESS_TOKEN = 'c5ef8296-2f3d-4b01-9c48-e6b41f49a4f1';
var USER_AGENT = 'mybot/1.0 (ansel01@gmail.com)';

MongoClient.connect('mongodb://localhost/nba', function(err, db) {
  assert.equal(null, err);
  console.log('\n==============================================================\n');
  console.log("Connected correctly to server");
  console.log('\n==============================================================\n');
  

  db.close();
});


// Build path for API request destination
var buildURL = function(urlObj) {
  var array = [urlObj.sport, urlObj.method, urlObj.id];
  var path;
  var url;
  var param_list = [];
  var param_string;
  var key;

  path = array.filter(function (element) {
    return element !== undefined;
  }).join('/');
  url = '/' + path + '.' + urlObj.format;

  // Check for parameters and create parameter string
  if (urlObj.params) {
    for (key in urlObj.params) {
      if (urlObj.params.hasOwnProperty(key)) {
        param_list.push(encodeURIComponent(key) + '=' + encodeURIComponent(urlObj.params[key]));
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
  var defaultOpts = {
    'host': 'erikberg.com',
    'path': '/',
    'headers': {
        'Accept-Encoding': 'gzip',
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'User-Agent': USER_AGENT
    }
  };
  
  // var firstDay = moment("20142810", "YYYYDDMM"); // Oct 28, 2014
  // var lastDay = moment("20151504", "YYYYDDMM"); // April 15, 2015

  // Get date in same format as URL parameter
  // moment().format("YYYYDDMM");

  // Check dates with moment.js to see if more API requests are necessary
  // var checkForNewGames = function(eventRequestDate) {
  //   if (eventRequestDate.isBefore(TODAY) && eventRequestDate.isBefore(lastDay) && eventRequestDate.isAfter(DAY BEFORE FIRST GAME)) {
  //    // set new date and get new event ids
  //     var nextDay = eventRequestDate.add(1, 'days');
  //     urlElments.params.date = nextDay.format("YYYYDDMM");
  //     eventEmitter.emit('getMoreData');
  //   } else {
  //     // don't get new event ids, stop bot
  //     eventEmitter.emit('stopBot');
  //   }

  // };

  eventEmitter.on('getMoreData', function() {
    setTimeout(function() {
      requestData(urlElements);
    }, 12000);
  });

  eventEmitter.on('stopBot', function() {
    console.log('DONE WORKING');
    console.log('\n==============================================================');
    console.log('==============================================================\n');
    mongoose.disconnect();
  });

  // Request data from API target
  var requestData = function(urlObj) {

    defaultOpts.path = buildURL(urlObj);

    console.log('\n==============================================================');
    console.log('==============================================================');
    console.log('\nREQUEST URL\nhttps://' + defaultOpts.host + defaultOpts.path);
    console.log('\n--------------------------------------------------------------\n');

    https.get(
      defaultOpts, function(res) {
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
            processData(decoded);

          });
        } else {
          console.log('Not encoded: ' + chunks.join(''));
        }
      }); 
    }).on('error', function (err) {
      console.warn("Error trying to contact server: " + err.message);
      process.exit(1);
    }); 

  };
  
  // process response from http.get request
  var processData = function(data) {
    var results = data.toString();

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
    

  };

  requestData(urlElements);

   // urlElements.sport = 'nba';
   //  urlElements.method = 'boxscore';
   //  urlElements.id = eventIds[0];
   //  urlElements.params = {};

};

main();
