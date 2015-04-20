var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NbaDay = new Schema({
  date: Number,
  games: []
});

module.exports = mongoose.model('Day', NbaDay);




    // // save to mongoDB using schema
    // var test =  new Day();
    // test.date = parseInt(urlElements.params.date);
    // test.games = eventIds;

    // test.save(function(err, data) {
    //   if (err) {
    //     console.log(err)
    //   } else {
    //     console.log('SAVED TO DB\n' + data);
    //     console.log('\n--------------------------------------------------------------\n');
    //     // Day.findOne({date: parseInt(urlElements.params.date)}, 'date', function(err, day)     
    //     // });

    //     checkForNewGames(test.date);

    //   }
    // });



    // var mongoose = require('mongoose');
    // var Day = require('./test-schema');