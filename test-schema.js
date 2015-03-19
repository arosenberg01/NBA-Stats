var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NbaDay = new Schema({
  date: String,
  games: []
});

module.exports = mongoose.model('Day', NbaDay);