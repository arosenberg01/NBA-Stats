var https = require('https');
var zlib = require('zlib');
var buildUrl = require('./build-urlpath.js');

var ACCESS_TOKEN = '';
var USER_AGENT = 'mybot/1.0 (ansel01@gmail.com)';

// Set options object for first argument to https.get 
var defaultOpts = {
  'host': 'erikberg.com',
  'path': '/',
  'headers': {
      'Accept-Encoding': 'gzip',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
      'User-Agent': USER_AGENT
  }
};

module.exports = function(urlObj, callback) {
    
    // set path property of defaultOps with string returned from buildUrl module

    defaultOpts.path = buildUrl(urlObj);

    console.log('\n==============================================================');
    console.log('==============================================================');
    console.log('\nREQUEST URL\nhttps://' + defaultOpts.host + defaultOpts.path);
    console.log('\n--------------------------------------------------------------\n');

    // Initiate https.get request with url parameters and callback passed in from data-fetcher.js
    console.log('\nPAUSING FOR 12s...\n');
    

      https.get(defaultOpts, function(res) {
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

              // Invoke callback with decoded response from https.get request
              var parsedResults[] = JSON.parse(decoded.toString());
              callback(parsedResults);

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