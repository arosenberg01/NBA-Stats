"use strict";
var async = require('async');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var requestData = require('./request-data.js') // takes urlElements and processing callback

var db;
var daysCollection;
var playersCollection;

// Connect to local mongo db
MongoClient.connect('mongodb://localhost/nba', function(err, database) {
  assert.equal(null, err);
  console.log('\n**************************************');
  console.log("*  Connected correctly to database   *");
  console.log('**************************************\n');
  
  db = database;
  daysCollection = db.collection('days');
  playersCollection = db.collection('players');
  main();

});

var main = function() {
  
  var dayBeforeFirst = moment("20141027", "YYYYMMDD"); // Oct 27, 2014 - day before opening day
  var dayAfterLast = moment("20150416", "YYYYMMDD"); // April 16, 2015 - day after last day (regular season)
  var nextDate;
 
  // Initialize arguments for API URL building
  var urlElements = {
    events: {
      sport: undefined,
      method: 'events',
      id: undefined,
      format:'json',
      params: {
        'sport' : 'nba',
        'date': '20150316' // FIX ME
      }
    },
    boxScore: {
      sport: 'nba',
      method: 'boxscore',
      // id: eventIds[0], // FIX ME
      params: {}
    }
  };

  // // Check dates with moment.js to see if more API requests are necessary
  var checkForNewGames = function(prevEventDate) {
    var todaysDate = moment();
    nextDate = prevEventDate.add(1, 'days');

    // Check if date already exists in database
    var formattedDate = nextDate.format("YYYYMMDD")
    console.log('Checking for event date: ' + formattedDate);
    daysCollection.find({"date": parseInt(formattedDate)}).toArray(function(err, docs) {
        assert.equal(err, null); 
        if (docs.length > 0) {
          console.log("Date already exists in db.days!")
        }
        
        // Check to make sure new request date is: before today's date, on or before the last day of the season, \
        // on or after the first day, and hasn't already been stored
        if (nextDate.isBefore(todaysDate) && nextDate.isBefore(dayAfterLast) && nextDate.isAfter(dayBeforeFirst) && docs.length === 0) {
         
         // set new date and and request new event ids after 12 second delay
          urlElements.events.params.date = nextDate.format("YYYYMMDD");
          
              eventEmitter.emit('getNextDaysEvents');

        } else {

          // don't get new event ids, stop bot
          eventEmitter.emit('stopBot');
        }
      
      });   

  };

  eventEmitter.on('getNextDaysEvents', function() {
      requestData(urlElements.events, processEventIds);
  });

  eventEmitter.on('stopBot', function() {
    console.log('DONE WORKING');
    console.log('\n==============================================================');
    console.log('==============================================================\n');
    db.close();
  });
  

  var processEventIds = function(eventIds) {

      var eventArray = [];
      for (var i = 0; i < eventIds.event.length; i++) {
        if (eventIds.event[i].event_status === "completed") {
          eventArray.push(eventIds.event[i].event_id);
        }
      }

      var newDoc = {};
      newDoc.date = parseInt(urlElements.events.params.date)
      newDoc.events = eventArray;
      console.log(newDoc);

      // save data to db
      daysCollection.insert(newDoc, function(err, record) {
        assert.equal(null, err);
        console.log("Document inserted!");

        requestData(urlElements.boxScore, processBoxScore);

      });

  };

  var processBoxScore = function(boxScore) {
    console.log("Made it to boxscore!")
    console.dir(boxScore);
    // pass date back to checkForNewGames
    // checkForNewGames(nextDate);
  };
  
  checkForNewGames(moment("20141027", "YYYYMMDD"));


  // process response from http.get request
  // var processData = function(data) {

  //   var parsedResults = data;

  //    if (urlElements.method === 'boxscore') {
  //     for (var key in parsedResults) {

  //       if (parsedResults[key] === "home_stats") {
  //         // for (var i = 0; i < parsedResults["home_stats"].length; i++) {
  //         //   var playerName = parsedResults["home_stats"][i]["display_name"];
            
  //         //   if (db.collection('players').find({"display_name": playerName}, {_id: 1}).limit(1))) {
  //         //     console.log("Player already exists, updating stats");
  //         //     // update player stats
  //         //   } else {
  //         //     // add new player
  //         //   }
  //         // }


  //       } else if (parsedResults[key] === "away_stats") {
  //         for (var i = 0; i < parsedResults["away_stats"].length; i++) {

  //         }
  //       }
      
  //       console.log(key);
  //     }
  //   }
 
  // };

  
  

};


