var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerSchema = new Schema({
  name: String,
  team: String,
  gameScores: [],
  averages: {}
});

modules.exports = mongoose.model('Player', PlayerSchema);