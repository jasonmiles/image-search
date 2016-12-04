var express = require('express')
var Bing = require('node-bing-api')({ accKey: "1ef55e2f96224feebe7aad8c63dd0d58" });
var mongodb = require('mongodb');

var app = express();

var port = process.env.PORT || 8080;


app.get('/api/imagesearch/*', function(req, res) {
  var searchTerm = req.originalUrl.substr(17);
  var searchTermDecoded = decodeURIComponent(searchTerm.split('?')[0]);
  var requestTime = new Date();
  var MongoClient = mongodb.MongoClient;

  var mongoUrl = process.env.MONGOLAB_URI;

  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      console.log('Connected to server');
      var collection = db.collection('results');

      collection.insert({term: searchTermDecoded, when: requestTime}, function (err, result) {
        if (err) {
          console.log(err);
        }
        db.close();
      })
    }
  })

  Bing.images(searchTerm, {
    top: 10,
  }, function(error, result, body){

    if (error) throw error;

    var resultsArr = [];
    for(var i = 0; i < body.value.length; i++) {
      var currentResult = body.value[i];
      resultsArr.push({ url: currentResult.contentUrl,
                        snippet: currentResult.name,
                        thumbnail: currentResult.thumbnailUrl,
                        context: currentResult.hostPageUrl})
    }
    res.send(resultsArr);
  });
})

app.get('/api/latest/imagesearch/', function(req, res) {
  var MongoClient = mongodb.MongoClient;

  var mongoUrl = process.env.MONGOLAB_URI;

  MongoClient.connect(mongoUrl, function(err, db) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      console.log('Connected to server');
      var collection = db.collection('results');

      collection.find({}, {_id:0}).sort({x:1}).limit(10).toArray(function(err, results) {
        if (err) {
          console.log(err);
        } else {
          res.send(results);
        }
        db.close();
      })
    }
  })
})

app.listen(port, function () {
  console.log('Example app listening on port ' + port)
})
