var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NbaDay = new Schema({
  date: Number,
  games: []
});

module.exports = mongoose.model('Day', NbaDay);