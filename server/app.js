var express = require('express');
var app = express();


app.use(express.static(__dirname + '../../client'));

// app.get('/', function(req, res) {
//   // res.send('index.html');
// });

var server = app.listen(3000, function() {
  console.log('listening on localhost:3000');
});

